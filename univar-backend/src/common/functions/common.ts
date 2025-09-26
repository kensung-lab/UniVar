import mongoose, { ConnectOptions, Connection, Schema } from 'mongoose';
import {
  APPLICATION_NAME_FOR_MONGO,
  BRAND_UNIVAR_DEFAULT_ACCESS_GROUP,
  MONGOOSE_AUTH_MECHANISM,
  MONGOOSE_AUTH_SOURCE,
} from '../constants';
import { S3Client } from '@aws-sdk/client-s3';
import { DatabaseFilter, UserInfo } from '../payloads';

export function getMaxNumber(number1: number, number2: number): number {
  return number1 > number2 ? number1 : number2;
}

export function createMongoDBOption(
  databaseName: string,
  connectionName: string = null,
): ConnectOptions {
  const defaultOption: any = {
    dbName: databaseName,
    appName: APPLICATION_NAME_FOR_MONGO,
    authMechanism: MONGOOSE_AUTH_MECHANISM,
    authSource: MONGOOSE_AUTH_SOURCE,
    serverSelectionTimeoutMS: 30000,
  };
  if (connectionName) {
    defaultOption.connectionName = connectionName;
  }

  return defaultOption;
}

export function createMongoDBConnection(
  databaseName: string,
): Promise<Connection> {
  return mongoose
    .createConnection(
      process.env.MONGO_BASE_URL,
      createMongoDBOption(databaseName),
    )
    .asPromise();
}

export async function getDatabaseNModel(
  modelName: string,
  schema: Schema,
  databaseName: string,
): Promise<any[]> {
  const commonDatabaseConnection = await createMongoDBConnection(databaseName);
  return [
    commonDatabaseConnection,
    commonDatabaseConnection.model(modelName, schema),
  ];
}

export async function getDatabaseModel(
  modelName: string,
  schema: Schema,
  databaseName: string,
): Promise<any> {
  return (await getDatabaseNModel(modelName, schema, databaseName))[1];
}

export async function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION,
  });
}

export function getDatabaseFilter(
  userInfo: UserInfo,
  filters: DatabaseFilter,
  show_pending: boolean = false,
) {
  if (
    !userInfo.groups ||
    (userInfo.groups &&
      !userInfo.groups.some((item) =>
        item.includes(process.env.KEYCLOAK_SUPER_TEAM),
      ))
  ) {
    const accessGroupArray: string[] = [userInfo.preferred_username];
    if (!show_pending) {
      accessGroupArray.push(BRAND_UNIVAR_DEFAULT_ACCESS_GROUP);
    }

    if (userInfo.groups) {
      for (const group of userInfo.groups) {
        accessGroupArray.push(group.replace('/', ''));
      }
    }
    filters.access_group = {
      $in: accessGroupArray,
    };
  }

  if (!show_pending) {
    filters.is_ready = true;
  }

  return filters;
}
