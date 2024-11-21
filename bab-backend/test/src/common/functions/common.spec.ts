import { S3Client } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
import {
  getMaxNumber,
  createMongoDBOption,
  createMongoDBConnection,
  getDatabaseNModel,
  APPLICATION_NAME_FOR_MONGO,
  MONGOOSE_AUTH_MECHANISM,
  MONGOOSE_AUTH_SOURCE,
  getS3Client,
} from 'src/common';
import { mockConnection } from '../../mock';

describe('getMaxNumber', () => {
  it('should return the higher number', () => {
    expect(getMaxNumber(1, 2)).toEqual(2);
    expect(getMaxNumber(10, 3)).toEqual(10);
    expect(getMaxNumber(0, -1)).toEqual(0);
  });
});

describe('createMongoDBOption', () => {
  it('should return the correct options', () => {
    const options = createMongoDBOption('test_db');

    expect(options).toEqual({
      appName: 'univar-backend',
      authMechanism: 'DEFAULT',
      authSource: 'admin',
      dbName: 'test_db',
      serverSelectionTimeoutMS: 30000,
    });
  });

  it('should return the correct options with connection name', () => {
    const options = createMongoDBOption('test_db', 'test_connection_name');

    expect(options).toEqual({
      appName: 'univar-backend',
      authMechanism: 'DEFAULT',
      authSource: 'admin',
      dbName: 'test_db',
      connectionName: 'test_connection_name',
      serverSelectionTimeoutMS: 30000,
    });
  });
});

describe('createMongoDBConnection', () => {
  const mockMongooseCreateConnection = jest.spyOn(mongoose, 'createConnection');

  it('should create a connection with the correct options', async () => {
    const mockConnection = {
      asPromise: jest.fn().mockReturnValue({}),
    };
    mockMongooseCreateConnection.mockReturnValue(<any>mockConnection);

    const connection = await createMongoDBConnection('test_db');

    expect(mockMongooseCreateConnection).toHaveBeenCalledWith(
      process.env.MONGO_BASE_URL,
      {
        dbName: 'test_db',
        appName: APPLICATION_NAME_FOR_MONGO,
        authMechanism: MONGOOSE_AUTH_MECHANISM,
        authSource: MONGOOSE_AUTH_SOURCE,
        serverSelectionTimeoutMS: 30000,
      },
    );
    expect(connection).toBeDefined();
  });
});

describe('getDatabaseNModel', () => {
  const mockMongooseCreateConnection = jest.spyOn(mongoose, 'createConnection');

  it('should create a connection and return the model', async () => {
    mockMongooseCreateConnection.mockReturnValue(<any>mockConnection);

    const [connection, model] = await getDatabaseNModel(
      'test_model',
      {} as any,
      'test_db',
    );

    expect(mockMongooseCreateConnection).toHaveBeenCalledWith(
      process.env.MONGO_BASE_URL,
      {
        dbName: 'test_db',
        appName: APPLICATION_NAME_FOR_MONGO,
        authMechanism: MONGOOSE_AUTH_MECHANISM,
        authSource: MONGOOSE_AUTH_SOURCE,
        serverSelectionTimeoutMS: 30000,
      },
    );
    expect((await mockConnection.asPromise()).model).toHaveBeenCalledWith(
      'test_model',
      {},
    );
    expect(connection).toBe(mockConnection.asPromise());
    expect(model).toEqual({});
  });
});

describe('getS3Client', () => {
  it('should create an S3Client with the correct region', async () => {
    // Mock the process.env.S3_REGION value
    process.env.S3_REGION = 'us-east-1';

    // Call the getS3Client function
    const s3Client = await getS3Client();
    // Assert that the S3Client is created with the correct region
    expect(s3Client).toBeInstanceOf(S3Client);
  });
});
