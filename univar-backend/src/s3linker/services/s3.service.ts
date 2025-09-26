import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { InjectAws } from 'aws-sdk-v3-nest';
import {
  ACTION_TYPE,
  ActionLog,
  CramUrl,
  CustomException,
  EXCEPTION_CODE,
  GetCramRequest,
  PROMISES_REJECTED,
  getDatabaseNModel,
} from 'src/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LoggingHelperService } from 'src/utils/services';
import { AppLogger } from 'src/utils/logger';
import {
  SAMPLE_MODEL_NAME,
  Samples,
  SamplesSchema,
} from 'src/variantsInfo/schemas';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3Service {
  constructor(
    @InjectAws(S3Client) private readonly s3: S3Client,
    private readonly loggingHelperService: LoggingHelperService,
    private readonly logger: AppLogger,
  ) {}

  async getFromS3(
    path: string,
    filename: string,
  ): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: path,
      Key: filename,
    });
    let result = null;
    try {
      result = await this.s3.send(command);
    } catch (e) {
      console.log(e);
      throw e;
    }

    return result;
  }

  async uploadToS3(path: string, filename: string, file: string | Buffer) {
    const command = new PutObjectCommand({
      Bucket: path,
      Key: filename,
      Body: file,
    });
    let result = null;
    try {
      result = await this.s3.send(command);
    } catch (e) {
      console.log(e);
      throw e;
    }

    return result;
  }

  async deleteFromS3(path: string, filename: string) {
    const command = new DeleteObjectCommand({
      Bucket: path,
      Key: filename,
    });
    let result = null;
    try {
      result = await this.s3.send(command);
    } catch (e) {
      console.log(e);
      throw e;
    }

    return result;
  }
}
