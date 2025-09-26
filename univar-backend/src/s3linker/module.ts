import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { S3Service } from './services';
import { AwsSdkModule } from 'aws-sdk-v3-nest';
import { S3Client } from '@aws-sdk/client-s3';
import { getS3Client } from 'src/common';

@Module({
  imports: [
    UtilsModule,
    AwsSdkModule.registerAsync({
      clientType: S3Client,
      useFactory: getS3Client,
    }),
  ],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
