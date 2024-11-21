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

  /**
   * @deprecated
   * @param getCramRequest get cram request
   * @param userInfo user Infomration
   * @returns cram urls
   */
  async getS3preSignedUrl(
    getCramRequest: GetCramRequest,
    userInfo,
  ): Promise<CramUrl[]> {
    const extraInformation: any = getCramRequest.variant_info;
    if (extraInformation) {
      extraInformation.selected_database = getCramRequest.selected_database;
    }

    this.logger.actionLog(
      new ActionLog(
        userInfo.preferred_username,
        getCramRequest.track_number,
        ACTION_TYPE.GET_FILE,
        'get_s3_pre_sign_url',
        extraInformation,
      ),
    );
    const tempDatabase = await getDatabaseNModel(
      SAMPLE_MODEL_NAME,
      SamplesSchema,
      getCramRequest.selected_database,
    );

    const collection = tempDatabase[1];

    const samples = await this.loggingHelperService.performanceLogAndFindMongo(
      collection,
      {},
      {},
      null,
      null,
      {},
      userInfo.preferred_username,
      getCramRequest.track_number,
      'find_samples_for_s3',
      getCramRequest.selected_database,
    );

    if (
      !samples ||
      samples.length == 0 ||
      samples.length < getCramRequest.samples.length
    ) {
      throw new CustomException(EXCEPTION_CODE.GET_S3_SAMPLE_NOT_FOUND);
    }

    // create mapping for actual name if there is display name
    const sampleNameMap = new Map<string, string>();

    // loop request first to prevent any not valid sample
    getCramRequest.samples.forEach((sampleName: string) => {
      samples
        .filter(
          (sample: Samples) =>
            sample.display_name == sampleName || sample.name == sampleName,
        )
        .forEach((sample: Samples) => {
          sampleNameMap.set(sampleName, sample.name);
        });
    });

    // fist get the cram file path
    const promises = getCramRequest.samples.map((sample) =>
      this.getSignedUrlForS3(
        sampleNameMap.get(sample),
        process.env.CRAM_FILE_SUFFIX,
      ),
    );
    promises.push(
      ...getCramRequest.samples.map((sample) =>
        this.getSignedUrlForS3(
          sampleNameMap.get(sample),
          process.env.CRAM_IDX_FILE_SUFFIX,
        ),
      ),
    );

    const results = await Promise.allSettled(promises);
    const tempResultArr = [];
    let errorReason = null;
    results.forEach((result) => {
      if (result.status == PROMISES_REJECTED) {
        errorReason = result.reason;
      } else {
        tempResultArr.push(result.value);
      }
    });
    if (errorReason) {
      const customException = new CustomException(
        EXCEPTION_CODE.GET_S3_PRESIGNED_URL_REJECTED,
      );
      customException.message = errorReason;
      throw customException;
    }
    const actualResults = [];
    getCramRequest.samples.forEach((sample: string) => {
      const cramUrl = new CramUrl(sample);
      tempResultArr.forEach((tempResult: string) => {
        if (
          tempResult.includes(sampleNameMap.get(sample)) &&
          tempResult.includes(process.env.CRAM_IDX_FILE_SUFFIX)
        ) {
          cramUrl.cram_index_url = tempResult;
        } else if (tempResult.includes(sampleNameMap.get(sample))) {
          cramUrl.cram_url = tempResult;
        }
      });
      actualResults.push(cramUrl);
    });
    await tempDatabase[0].destroy();

    return actualResults;
  }

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

  async getFromLocal(
    directory: string,
    filename: string,
  ): Promise<Buffer> {
    let result = null;
    try {
      const filePath = path.join(directory, filename);

      // Read the file and return the buffer
      result = fs.promises.readFile(filePath);
    } catch (e) {
      console.log('Error!!', e)
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

  async uploadToLocal(filepath: string, filename: string, file: string | Buffer) {
    try {  
      const filePath = path.join(`/usr/src/app/upload_data/${filepath}`, filename);
      const folderPath = path.dirname(filePath);

      // Ensure the directory exists, create it if it doesn't
      await fs.promises.mkdir(folderPath, { recursive: true });

      // Write the file to the local directory
      await fs.promises.writeFile(filePath, file);

      // Change the file permissions to 775
      await fs.promises.chmod(filePath, 0o775);

      // Return the path of the saved file or a success message
      return `File saved to ${filePath}`;
    } catch (e) {
      console.log(e);
      throw e;
    }
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

  async deleteFromLocal(filepath: string, filename: string) {
    try {
      const filePath = path.join(`/usr/src/app/upload_data/${filepath}`, filename);

      // Remove the file
      await fs.promises.rm(filePath, { force: true });

      // Return a success message
      return `File deleted: ${filePath}`;
  } catch (e) {
      console.log(e);
      throw e;
  }
  }

  /**
   * @deprecated
   * @param sample - Sample Name
   * @param suffix - file extension
   * @returns Promise<string> the pre signed url from S3
   */
  private async getSignedUrlForS3(
    sample: string,
    suffix: string,
  ): Promise<string> {
    let result = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.CRAM_S3_BUCKET_URL,
        Key: process.env.CRAM_FILE_PREFIX + sample + suffix,
      }),
      {
        expiresIn: +process.env.CRAM_S3_TIMEOUT, //seconds
      },
    );
    // assume that our proxy server always https
    result = result
      ? result.replace(
          /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim,
          'https://' + process.env.CRAM_PROXY_DOMAIN + '/file',
        )
      : result;

    return result;
  }
}
