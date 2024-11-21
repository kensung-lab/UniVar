import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { parse } from 'csv-parse/sync';
import { Model } from 'mongoose';
import {
  ACTION_TYPE,
  BaseRequest,
  COMMON_DATABASE,
  CustomException,
  EXCEPTION_CODE,
  HPO_SAMPLE_KEY,
  PED_SAMPLE_KEY,
  SAMPLE_FILE_BUCKET,
  SNP_VCF_SAMPLE_KEY,
  SV_VCF_SAMPLE_KEY,
  SampleType,
  USER_MENU_KEY,
  UserInfo,
  checkGzip,
  getFullBucketPath,
  getDatabaseName,
  getVariantFileName,
  validateHPOTerm,
  validateFileSize,
  QueryRequest,
  checkSelectedDatabaseExist,
  createMongoDBConnection,
  JobInformation,
  TUTORIAL_KEY,
  getVCFHeader,
  UploadHPORequest,
  getBucketNameFromS3Path,
  getKeyFromS3Path,
  getFileNameFromS3Path,
  getDatabaseNModel,
  UploadFilesRequest,
  PedInfo,
  BRAND_SKIP_EXOMISER,
  getPedForFrontendFromVCF,
  BRAND_UNIVAR,
  getCallerFromS3Path,
  getFileName,
  SVFileInfo,
  HPO_PIPELINE_DEFAULT_NAME,
  getFileNameParts,
} from 'src/common';
import {
  DATABASE_MODEL_NAME,
  DatabaseService,
  Databases,
  GENE_PANEL_MODEL_NAME,
  GenePanels,
} from 'src/applicationInfo';
import { S3Service } from 'src/s3linker';
import { LoggingHelperService } from 'src/utils';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
  EXOMISER_INFO_MODEL_NAME,
  ExomiserInfo,
  ExomiserInfoSchema,
} from 'src/variantsInfo';
import { AxiosError } from '@nestjs/terminus/dist/errors/axios.error';
@Injectable()
export class PipelineService {
  constructor(
    @InjectModel(DATABASE_MODEL_NAME, COMMON_DATABASE)
    private DatabasesModel: Model<Databases>,
    @InjectModel(GENE_PANEL_MODEL_NAME, COMMON_DATABASE)
    private GenePanelsModel: Model<GenePanels>,
    private readonly databaseService: DatabaseService,
    private readonly s3Service: S3Service,
    private readonly loggingHelperService: LoggingHelperService,
    private readonly httpService: HttpService,
  ) {}

  async uploadFiles(
    uploadFilesRequest: UploadFilesRequest,
    files: {
      ped: Express.Multer.File[];
      hpo: Express.Multer.File[];
      snp: Express.Multer.File[];
      sv: Express.Multer.File[];
    },
    userInfo: UserInfo,
  ): Promise<JobInformation> {
    const svCallers: SVFileInfo[] = uploadFilesRequest?.svCallers
      ? JSON.parse(uploadFilesRequest.svCallers)
      : undefined;
    const peds: PedInfo[] = uploadFilesRequest?.peds
      ? JSON.parse(uploadFilesRequest.peds)
      : undefined;
    // 1. check number of running pipeline
    const userUploadCount =
      await this.loggingHelperService.performanceLogAndCountMongo(
        this.DatabasesModel,
        {
          is_ready: false,
        },
        userInfo.preferred_username,
        uploadFilesRequest.track_number,
        'check_upload_count',
        COMMON_DATABASE,
      );
    if (userUploadCount >= 10) {
      throw new CustomException(EXCEPTION_CODE.MAX_SAMPLE_EXCEED);
    }

    // 2. validate the files
    const pedInfo = await this.validateUploadFiles(
      files,
      peds,
      uploadFilesRequest.probandId,
    );
    let hpoTerms: string = undefined;

    if (
      files.hpo?.length > 0 ||
      uploadFilesRequest.hpos?.length > 0 ||
      uploadFilesRequest.panels.length > 0
    ) {
      let listOfGenePanels: GenePanels[] = undefined;
      if (uploadFilesRequest.panels) {
        listOfGenePanels =
          await this.loggingHelperService.performanceLogAndFindMongo(
            this.GenePanelsModel,
            { _id: { $in: uploadFilesRequest.panels.split(',') } },
            {},
            null,
            null,
            {},
            userInfo.preferred_username,
            uploadFilesRequest.track_number,
            'find_gene_panel_with_id',
            COMMON_DATABASE,
          );
      }
      hpoTerms = await this.validateHPO(
        files,
        uploadFilesRequest.hpos,
        listOfGenePanels,
      );
    }

    // 3. upload to s3

    // generate UUID
    let anySnp = false;
    const snpControlFile: any = { variants: [], brand: BRAND_SKIP_EXOMISER };
    const svControlFile: any = { variants: [], brand: BRAND_UNIVAR };
    const unique_string =
      new Date().getTime() + '-' + randomUUID().split('-').pop();
    const databaseName = getDatabaseName(
      files.snp && files.snp.length > 0
        ? await getFileNameParts(
            uploadFilesRequest.probandId,
            files.snp[0].buffer,
          )
        : await getFileNameParts(
            uploadFilesRequest.probandId,
            files.sv[0].buffer,
          ),
      unique_string,
    );
    const s3BucketKeyPrefix =
      process.env.PIPELINE_DATA_KEY + databaseName + '/';
    let variantFileCounts = 0;
    const snpLocation: string[] = [];
    const svLocation: string[] = [];
    const pedLocation: string[] = [];
    const hpoLocation: string[] = [];
    let vcfHeader: string = null;

    // upload ped file
    const pedFileName =
      files?.ped?.length > 0
        ? files.ped[0].originalname
        : `${uploadFilesRequest.probandId}_${unique_string}.ped`;
    await this.s3Service.uploadToLocal(
      process.env.PIPELINE_BUCKET,
      s3BucketKeyPrefix + pedFileName,
      pedInfo,
    );
    snpControlFile.ped = [
      getFullBucketPath(
        process.env.PIPELINE_BUCKET,
        s3BucketKeyPrefix,
        pedFileName,
      ),
    ];

    svControlFile.ped = [
      getFullBucketPath(
        process.env.PIPELINE_BUCKET,
        s3BucketKeyPrefix,
        pedFileName,
      ),
    ];

    pedLocation.push(
      getFullBucketPath(
        process.env.PIPELINE_BUCKET,
        s3BucketKeyPrefix,
        pedFileName,
      ),
    );

    // hpos
    if (hpoTerms || (files.hpo?.length > 0 && files.hpo[0].buffer)) {
      const hpoFileName = hpoTerms
        ? databaseName + '.hpo'
        : files.hpo[0].originalname;
      const hpoBuffer = hpoTerms || files.hpo[0].buffer;
      await this.s3Service.uploadToLocal(
        process.env.PIPELINE_BUCKET,
        s3BucketKeyPrefix + hpoFileName,
        Buffer.from(hpoBuffer.toString().replace('\r', '')),
      );

      hpoLocation.push(
        getFullBucketPath(
          process.env.PIPELINE_BUCKET,
          s3BucketKeyPrefix,
          hpoFileName,
        ),
      );
    }

    if (files.snp && files.snp.length > 0) {
      await this.s3Service.uploadToLocal(
        process.env.PIPELINE_BUCKET,
        s3BucketKeyPrefix +
          getVariantFileName(
            await getFileName(uploadFilesRequest.probandId, files.snp[0]),
            unique_string,
          ),
        files.snp[0].buffer,
      );
      const tempSnpLocation = getFullBucketPath(
        process.env.PIPELINE_BUCKET,
        s3BucketKeyPrefix,
        getVariantFileName(
          await getFileName(uploadFilesRequest.probandId, files.snp[0]),
          unique_string,
        ),
      );
      snpLocation.push(tempSnpLocation);
      snpControlFile.variants = [tempSnpLocation];

      variantFileCounts++;
      anySnp = true;
    }

    if (files.sv && files.sv.length > 0) {
      const count = variantFileCounts;
      for (const svFile of files.sv) {
        await this.s3Service.uploadToLocal(
          process.env.PIPELINE_BUCKET,
          s3BucketKeyPrefix +
            getVariantFileName(
              await getFileName(
                uploadFilesRequest.probandId,
                svFile,
                'sv',
                svCallers,
              ),
              unique_string,
            ),
          svFile.buffer,
        );
        const tempSvFileLocation = getFullBucketPath(
          process.env.PIPELINE_BUCKET,
          s3BucketKeyPrefix,
          getVariantFileName(
            await getFileName(
              uploadFilesRequest.probandId,
              svFile,
              'sv',
              svCallers,
            ),
            unique_string,
          ),
        );
        svLocation.push(tempSvFileLocation);
        svControlFile.variants.push(tempSvFileLocation);
        if (count == variantFileCounts && !anySnp) {
          vcfHeader = await getVCFHeader(svFile.buffer);
        }

        variantFileCounts++;
      }
    }

    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      uploadFilesRequest.track_number,
      ACTION_TYPE.UPLOAD_S3,
      'upload_data_file_to_s3',
    );

    // 4. upload control file
    if (files.snp && files.snp.length > 0) {
      await this.s3Service.uploadToLocal(
        process.env.PIPELINE_BUCKET,
        process.env.PIPELINE_CONTROL_KEY + databaseName + '.snv.json',
        JSON.stringify(snpControlFile),
      );
    }
    if (files.sv && files.sv.length > 0) {
      await this.s3Service.uploadToLocal(
        process.env.PIPELINE_BUCKET,
        process.env.PIPELINE_CONTROL_KEY + databaseName + '.ssv.json',
        JSON.stringify(svControlFile),
      );
    }
    
    // // TESTING
    // return new JobInformation(unique_string);

    // 5. insert to database collection for pipeline execution
    const session = await this.DatabasesModel.startSession();
    try {
      session.startTransaction();
      const databases = new Databases();
      databases.database_name = databaseName;
      databases.display_name = databaseName;
      databases.is_ready = false;
      databases.access_group = [unique_string];
      databases.email = userInfo.email;
      databases.complete_num = variantFileCounts;
      databases.brand = BRAND_UNIVAR;
      databases.create_time = new Date();
      if (vcfHeader) {
        databases.vcf_header = vcfHeader;
      }

      if (pedLocation.length > 0) {
        databases.pedLocation = pedLocation;
      }

      if (svLocation.length > 0) {
        databases.svVcfLocation = svLocation;
      }

      if (hpoLocation.length > 0) {
        databases.hpoLocation = hpoLocation;
        databases.hpos = hpoTerms.replace('\r', '').split('\n');
      }

      if (snpLocation.length > 0) {
        databases.snpVcfLocation = snpLocation;
      }

      const doc = new this.DatabasesModel(databases);
      await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        uploadFilesRequest.track_number,
        'insert_database',
        COMMON_DATABASE,
        DATABASE_MODEL_NAME,
        databases,
      );
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
    }

    session.endSession();

    // 6. action logging
    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      uploadFilesRequest.track_number,
      ACTION_TYPE.UPLOAD_S3,
      'upload_control_file_to_s3',
    );

    return new JobInformation(unique_string);
  }

  async uploadHPO(
    uploadHPORequest: UploadHPORequest,
    files: {
      hpo: Express.Multer.File[];
    },
    userInfo: UserInfo,
  ): Promise<JobInformation> {
    // 1. check if currently is running 5 exomiser already
    const tempDatabase = await getDatabaseNModel(
      EXOMISER_INFO_MODEL_NAME,
      ExomiserInfoSchema,
      uploadHPORequest.selected_database,
    );
    const collection = tempDatabase[1];
    const userUploadCount =
      await this.loggingHelperService.performanceLogAndCountMongo(
        collection,
        {
          is_ready: false,
        },
        userInfo.preferred_username,
        uploadHPORequest.track_number,
        'check_exomiser_run_count',
        uploadHPORequest.selected_database,
      );
    if (userUploadCount >= 5) {
      throw new CustomException(EXCEPTION_CODE.MAX_EXOMISER_RUN_EXCEED);
    }

    // 2. validate the hpo file
    let listOfGenePanels: GenePanels[] = undefined;
    if (uploadHPORequest.panels) {
      listOfGenePanels =
        await this.loggingHelperService.performanceLogAndFindMongo(
          this.GenePanelsModel,
          { _id: { $in: uploadHPORequest.panels.split(',') } },
          {},
          null,
          null,
          {},
          userInfo.preferred_username,
          uploadHPORequest.track_number,
          'find_gene_panel_with_id',
          COMMON_DATABASE,
        );
    }

    const hpoTerms = await this.validateHPO(
      files,
      uploadHPORequest.hpos,
      listOfGenePanels,
    );
    // 3. upload to s3
    // generate UUID
    const controlParams: any[] = [];
    const unique_string =
      'exomiser_' + new Date().getTime() + '-' + randomUUID().split('-').pop();
    const databaseName = uploadHPORequest.selected_database;
    const s3BucketKeyPrefix = process.env.EXPORT_LOCATION + databaseName + '/';
    let numberOfVcfFiles = 0;

    // hpos
    const hpoFileName = hpoTerms
      ? databaseName + '.hpo'
      : files.hpo[0].originalname;
    const hpoBuffer = hpoTerms || files.hpo[0].buffer;
    await this.s3Service.uploadToS3(
      process.env.EXPORT_S3_BUCKET_URL,
      s3BucketKeyPrefix + hpoFileName,
      Buffer.from(hpoBuffer.toString().replace('\r', '')),
    );

    const selectedDatabases: Databases[] =
      await this.databaseService.getRawDatabasesList(
        uploadHPORequest.track_number,
        userInfo,
        'get_databases_for_exomiser',
        { database_name: uploadHPORequest.selected_database },
      );

    if (selectedDatabases?.length == 1) {
      const currentSelectedDatabase = selectedDatabases[0];
      if (currentSelectedDatabase?.snpVcfLocation?.length > 0) {
        this.createControlParam(
          currentSelectedDatabase.snpVcfLocation[0],
          controlParams,
          false,
        );
        numberOfVcfFiles++;
      }
      if (currentSelectedDatabase?.svVcfLocation?.length > 0) {
        currentSelectedDatabase?.svVcfLocation?.forEach(
          (svVcfLocation: string) => {
            this.createControlParam(svVcfLocation, controlParams, true);
          },
        );
        numberOfVcfFiles++;
      }
    } else {
      throw new CustomException(
        EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST,
      );
    }

    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      uploadHPORequest.track_number,
      ACTION_TYPE.UPLOAD_S3,
      'upload_hpo_to_s3',
    );

    // 4. trigger argo workflow
    const argoWorkflowBody = {
      namespace: 'argo',
      serverDryRun: false,
      workflow: {
        apiVersion: 'argoproj.io/v1alpha1',
        kind: 'Workflow',
        metadata: {
          generateName: 'exomiser-standalone-',
          namespace: 'argo',
        },
        spec: {
          arguments: {
            parameters: [
              {
                name: 'family_id',
                value: uploadHPORequest.selected_database,
              },
              {
                name: 'ped_bucket',
                value: getBucketNameFromS3Path(
                  selectedDatabases[0].pedLocation[0],
                ),
              },
              {
                name: 'ped_key',
                value: getKeyFromS3Path(selectedDatabases[0].pedLocation[0]),
              },
              {
                name: 'ped_file_name',
                value: getFileNameFromS3Path(
                  selectedDatabases[0].pedLocation[0],
                ),
              },
              {
                name: 'hpo_bucket',
                value: process.env.EXPORT_S3_BUCKET_URL,
              },
              {
                name: 'hpo_key',
                value: s3BucketKeyPrefix + hpoFileName,
              },
              {
                name: 's3_asset_bucket',
                value: 'bab-annot-testing-assets',
              },
              {
                name: 'pipeline_version',
                value: 'S1.0.0',
              },
              {
                name: 'uat_mode',
                value: '',
              },
              {
                name: 'access_group',
                value: '',
              },
              {
                name: 'database_name',
                value: 'DUMMY',
              },
              {
                name: 'environment',
                value: 'development',
              },
              {
                name: 'exomiser_run',
                value: unique_string,
              },
              {
                name: 'file_list',
                value: JSON.stringify(controlParams),
              },
            ],
          },
          artifactGC: {
            strategy: 'OnWorkflowDeletion',
          },
          entrypoint: 'annotate-exomiser',
          retryStrategy: {
            limit: 3,
            retryPolicy: 'Always',
          },
          podGC: {
            strategy: 'OnPodCompletion',
            deleteDelayDuration: '3600s',
          },
          imagePullSecrets: [
            {
              name: 'docker-config',
            },
          ],
          serviceAccountName: 'argo-admin',
          workflowTemplateRef: {
            name: 'exomiser-template',
          },
        },
      },
    };

    const response = await firstValueFrom(
      this.httpService
        .post(
          process.env.ARGO_WORKFLOW_BASE_URL +
            process.env.ARGO_SUBMIT_WORKFLOW_URL,
          argoWorkflowBody,
        )
        .pipe(
          catchError((error: AxiosError) => {
            const additInfo = error?.response?.data || undefined;
            throw new CustomException(
              EXCEPTION_CODE.ERROR_CALLING_ARGO,
              additInfo,
            );
          }),
        ),
    );

    if (!response || !response.data || response.data.code) {
      const additInfo = response?.data?.code ? response.data : undefined;
      throw new CustomException(EXCEPTION_CODE.ERROR_CALLING_ARGO, additInfo);
    }

    // 5. insert to database collection for exomiser execution
    const session = await collection.startSession();
    try {
      session.startTransaction();
      const exomiserInfo = new ExomiserInfo();
      exomiserInfo.run = unique_string;
      exomiserInfo.display_name = uploadHPORequest.display_name;
      exomiserInfo.complete_num = numberOfVcfFiles;
      exomiserInfo.is_ready = false;
      exomiserInfo.create_time = new Date();
      exomiserInfo.hpos = hpoTerms.split('\n');

      const doc = new collection(exomiserInfo);
      await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        uploadHPORequest.track_number,
        'insert_database',
        uploadHPORequest.selected_database,
        EXOMISER_INFO_MODEL_NAME,
        exomiserInfo,
      );
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
    }
    await tempDatabase[0].destroy();

    session.endSession();

    return new JobInformation(unique_string);
  }

  async pipelineHPO(
    queryRequest: QueryRequest,
    userInfo: UserInfo,
  ): Promise<JobInformation> {
    // 1. check if currently is running 5 exomiser already
    const tempDatabase = await getDatabaseNModel(
      EXOMISER_INFO_MODEL_NAME,
      ExomiserInfoSchema,
      queryRequest.selected_database,
    );
    const collection = tempDatabase[1];
    const userUploadCount =
      await this.loggingHelperService.performanceLogAndCountMongo(
        collection,
        {
          is_ready: false,
        },
        userInfo.preferred_username,
        queryRequest.track_number,
        'check_exomiser_run_count',
        queryRequest.selected_database,
      );
    if (userUploadCount >= 5) {
      throw new CustomException(EXCEPTION_CODE.MAX_EXOMISER_RUN_EXCEED);
    }

    // 2. upload to s3
    // generate UUID
    const controlParams: any[] = [];
    const unique_string =
      'exomiser_' + new Date().getTime() + '-' + randomUUID().split('-').pop();
    let numberOfVcfFiles = 0;

    // 3. create trigger params
    const selectedDatabases: Databases[] =
      await this.databaseService.getRawDatabasesList(
        queryRequest.track_number,
        userInfo,
        'get_databases_for_exomiser',
        { database_name: queryRequest.selected_database },
      );

    if (selectedDatabases?.length == 1 && selectedDatabases[0].hpos) {
      const currentSelectedDatabase = selectedDatabases[0];
      if (currentSelectedDatabase?.snpVcfLocation?.length > 0) {
        this.createControlParam(
          currentSelectedDatabase.snpVcfLocation[0],
          controlParams,
          false,
        );
        numberOfVcfFiles++;
      }
      if (currentSelectedDatabase?.svVcfLocation?.length > 0) {
        currentSelectedDatabase?.svVcfLocation?.forEach(
          (svVcfLocation: string) => {
            this.createControlParam(svVcfLocation, controlParams, true);
          },
        );
        numberOfVcfFiles++;
      }
    } else if (selectedDatabases?.length == 1 && !selectedDatabases[0].hpos) {
      throw new CustomException(EXCEPTION_CODE.NO_HPO_ON_INIT);
    } else {
      throw new CustomException(
        EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST,
      );
    }

    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      queryRequest.track_number,
      ACTION_TYPE.UPLOAD_S3,
      'upload_hpo_to_s3',
    );

    // 4. trigger argo workflow
    const argoWorkflowBody = {
      namespace: 'argo',
      serverDryRun: false,
      workflow: {
        apiVersion: 'argoproj.io/v1alpha1',
        kind: 'Workflow',
        metadata: {
          generateName: 'exomiser-standalone-',
          namespace: 'argo',
        },
        spec: {
          arguments: {
            parameters: [
              {
                name: 'family_id',
                value: queryRequest.selected_database,
              },
              {
                name: 'ped_bucket',
                value: getBucketNameFromS3Path(
                  selectedDatabases[0].pedLocation[0],
                ),
              },
              {
                name: 'ped_key',
                value: getKeyFromS3Path(selectedDatabases[0].pedLocation[0]),
              },
              {
                name: 'ped_file_name',
                value: getFileNameFromS3Path(
                  selectedDatabases[0].pedLocation[0],
                ),
              },
              {
                name: 'hpo_bucket',
                value: getBucketNameFromS3Path(
                  selectedDatabases[0].hpoLocation[0],
                ),
              },
              {
                name: 'hpo_key',
                value: getKeyFromS3Path(selectedDatabases[0].hpoLocation[0]),
              },
              {
                name: 's3_asset_bucket',
                value: 'bab-annot-testing-assets',
              },
              {
                name: 'pipeline_version',
                value: 'S1.0.0',
              },
              {
                name: 'uat_mode',
                value: '',
              },
              {
                name: 'access_group',
                value: '',
              },
              {
                name: 'database_name',
                value: 'DUMMY',
              },
              {
                name: 'environment',
                value: 'development',
              },
              {
                name: 'exomiser_run',
                value: unique_string,
              },
              {
                name: 'file_list',
                value: JSON.stringify(controlParams),
              },
            ],
          },
          artifactGC: {
            strategy: 'OnWorkflowDeletion',
          },
          entrypoint: 'annotate-exomiser',
          retryStrategy: {
            limit: 3,
            retryPolicy: 'Always',
          },
          podGC: {
            strategy: 'OnPodCompletion',
            deleteDelayDuration: '3600s',
          },
          imagePullSecrets: [
            {
              name: 'docker-config',
            },
          ],
          serviceAccountName: 'argo-admin',
          workflowTemplateRef: {
            name: 'exomiser-template',
          },
        },
      },
    };

    const response = await firstValueFrom(
      this.httpService
        .post(
          process.env.ARGO_WORKFLOW_BASE_URL +
            process.env.ARGO_SUBMIT_WORKFLOW_URL,
          argoWorkflowBody,
        )
        .pipe(
          catchError((error: AxiosError) => {
            const additInfo = error?.response?.data || undefined;
            throw new CustomException(
              EXCEPTION_CODE.ERROR_CALLING_ARGO,
              additInfo,
            );
          }),
        ),
    );

    if (!response || !response.data || response.data.code) {
      const additInfo = response?.data?.code ? response.data : undefined;
      throw new CustomException(EXCEPTION_CODE.ERROR_CALLING_ARGO, additInfo);
    }

    // 5. insert to database collection for exomiser execution
    const session = await collection.startSession();
    try {
      session.startTransaction();
      const exomiserInfo = new ExomiserInfo();
      exomiserInfo.run = unique_string;
      exomiserInfo.display_name = HPO_PIPELINE_DEFAULT_NAME;
      exomiserInfo.complete_num = numberOfVcfFiles;
      exomiserInfo.is_ready = false;
      exomiserInfo.create_time = new Date();
      exomiserInfo.hpos = selectedDatabases[0].hpos;

      const doc = new collection(exomiserInfo);
      await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        queryRequest.track_number,
        'insert_database',
        queryRequest.selected_database,
        EXOMISER_INFO_MODEL_NAME,
        exomiserInfo,
      );
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      console.log('Error: ', e);
      throw e;
    }
    await tempDatabase[0].destroy();

    session.endSession();

    return new JobInformation(unique_string);
  }

  async uploadVCFForPed(
    files: {
      snp: Express.Multer.File[];
      sv: Express.Multer.File[];
    },
    baseRequest: BaseRequest,
    userInfo: UserInfo,
  ): Promise<any[]> {
    let result = [];

    if (files?.snp && files?.snp.length > 0) {
      result = await getPedForFrontendFromVCF(files.snp[0].buffer);
    }

    if (
      (!result ||
        result.length == 0 ||
        (result?.length > 0 &&
          result[0].mother_id === '' &&
          result[0].father_id === '')) &&
      files?.sv &&
      files?.sv.length > 0
    ) {
      for (const sv of files.sv) {
        result = await getPedForFrontendFromVCF(sv.buffer);
        if (
          !(
            (!result ||
              result.length == 0 ||
              (result?.length > 0 &&
                result[0].mother_id === '' &&
                result[0].father_id === '')) &&
            files?.sv &&
            files?.sv.length > 0
          )
        ) {
          break;
        }
      }
    }

    await this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      baseRequest.track_number,
      ACTION_TYPE.EXTRACT_FILE,
      'get_ped_fromvcf',
    );

    return result;
  }

  async deleteSample(
    queryRequest: QueryRequest,
    userInfo: UserInfo,
  ): Promise<Databases> {
    await checkSelectedDatabaseExist(
      this.databaseService,
      queryRequest.track_number,
      queryRequest.selected_database,
      userInfo,
    );

    const connection = await createMongoDBConnection(
      queryRequest.selected_database,
    );

    await this.loggingHelperService.performanceLogAndDropDatabaseMongo(
      connection,
      userInfo.preferred_username,
      queryRequest.track_number,
      queryRequest.selected_database,
      ACTION_TYPE.DELETE_DB,
      'delete_uploaded_db',
    );

    const database =
      await this.loggingHelperService.performanceLogAndFindOneMongo(
        this.DatabasesModel,
        { database_name: queryRequest.selected_database },
        {},
        userInfo.preferred_username,
        queryRequest.track_number,
        'query_database_for_delete',
        COMMON_DATABASE,
      );

    await this.loggingHelperService.performanceLogAndDeleteOneMongo(
      this.DatabasesModel,
      userInfo.preferred_username,
      queryRequest.track_number,
      { _id: database._id },
      COMMON_DATABASE,
      DATABASE_MODEL_NAME,
      'delete_one_database',
    );

    return database;
  }

  async getSampleFile(
    baseRequest: BaseRequest,
    sampleType: SampleType,
    userInfo: UserInfo,
  ): Promise<GetObjectCommandOutput> {
    let key = '';
    switch (sampleType) {
      case SampleType.hpo:
        key = HPO_SAMPLE_KEY;
        break;
      case SampleType.ped:
        key = PED_SAMPLE_KEY;
        break;
      case SampleType.snp:
        key = SNP_VCF_SAMPLE_KEY;
        break;
      case SampleType.sv:
        key = SV_VCF_SAMPLE_KEY;
        break;
      case SampleType.menu:
        key = USER_MENU_KEY;
        break;
      case SampleType.tutorial:
        key = TUTORIAL_KEY;
        break;
    }

    const sampileFile = await this.s3Service.getFromS3(SAMPLE_FILE_BUCKET, key);
    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      baseRequest.track_number,
      ACTION_TYPE.SAMPLE_FILE,
      'get_sample_file_' + sampleType,
    );

    return sampileFile;
  }

  async getSampleFileLocal(
    baseRequest: BaseRequest,
    sampleType: SampleType,
    userInfo: UserInfo,
  ): Promise<Buffer> {
    let key = '';
    switch (sampleType) {
      case SampleType.hpo:
        key = HPO_SAMPLE_KEY;
        break;
      case SampleType.ped:
        key = PED_SAMPLE_KEY;
        break;
      case SampleType.snp:
        key = SNP_VCF_SAMPLE_KEY;
        break;
      case SampleType.sv:
        key = SV_VCF_SAMPLE_KEY;
        break;
      case SampleType.menu:
        key = USER_MENU_KEY;
        break;
      case SampleType.tutorial:
        key = TUTORIAL_KEY;
        break;
    }

    const sampileFile = await this.s3Service.getFromLocal('/usr/src/app/sample', key);
    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      baseRequest.track_number,
      ACTION_TYPE.SAMPLE_FILE,
      'get_sample_file_' + sampleType,
    );

    return sampileFile;
  }

  private async validateUploadFiles(
    files: {
      ped: Express.Multer.File[];
      hpo: Express.Multer.File[];
      snp: Express.Multer.File[];
      sv: Express.Multer.File[];
    },
    peds: PedInfo[],
    probandId: string,
  ): Promise<string | Buffer> {
    const setOfFileNames = new Set<string>();
    let pedInfo: string | Buffer = undefined;
    // validate the upload ped file format
    if (files?.ped?.length > 0) {
      if (!validateFileSize(files.ped[0].size)) {
        throw new CustomException(EXCEPTION_CODE.UPLOAD_FILE_SIZE_EXCEED);
      }
      let pedContent = null;
      try {
        pedContent = parse(files.ped[0].buffer.toString(), {
          columns: false,
          skip_empty_lines: true,
          delimiter: '\t',
          comment: '#',
        });
      } catch (e) {
        throw new CustomException(EXCEPTION_CODE.NOT_VALID_PED_FILE);
      }
      let anyProband = false;
      pedContent.forEach((row) => {
        if (row[1] == probandId) {
          anyProband = true;
        }
      });
      if (!anyProband) {
        throw new CustomException(EXCEPTION_CODE.NO_PROBAND_IN_PED);
      }

      setOfFileNames.add(files.ped[0].originalname);
      pedInfo = files.ped[0].buffer;
    } else if (peds?.length > 0) {
      let result =
        '#Family ID	Individual ID	Paternal ID	Maternal ID	Sex	Phenotype\n';
      const defaultFamilyID =
        new Date().getTime() + '-' + randomUUID().split('-').pop();
      peds.forEach((ped) => {
        result += `${defaultFamilyID}\t${ped.sample_id}\t${ped.paternalID}\t${ped.maternalID}\t${ped.sex}\t${ped.affected}\n`;
      });
      pedInfo = result;

      let anyProband = false;
      const rows = pedInfo.split('\n');
      rows.forEach((row) => {
        const columns = row.split('\t');
        if (columns[1] == probandId) {
          anyProband = true;
        }
      });
      if (!anyProband) {
        throw new CustomException(EXCEPTION_CODE.NO_PROBAND_IN_PED);
      }
    } else {
      throw new CustomException(EXCEPTION_CODE.PIPELINE_REQUIRE_PED);
    }

    const gzFileList: Buffer[] = [];

    // validate the uploaded SNP VCF gz file
    if (files.snp && files.snp.length > 0) {
      if (setOfFileNames.has(files.snp[0].originalname)) {
        throw new CustomException(EXCEPTION_CODE.DUPLICATE_UPLOAD_FILE_NAME);
      }
      if (!validateFileSize(files.snp[0].size)) {
        throw new CustomException(EXCEPTION_CODE.UPLOAD_FILE_SIZE_EXCEED);
      }
      if (
        !['application/gzip', 'application/x-gzip'].includes(
          files.snp[0].mimetype,
        ) ||
        !checkGzip(files.snp[0].buffer)
      ) {
        throw new CustomException(EXCEPTION_CODE.NOT_VALID_SNP_VCF_FILE);
      }
      setOfFileNames.add(files.snp[0].originalname);
      gzFileList.push(files.snp[0].buffer);
    }

    // validate the uploaded SV VCF gz file
    if (files.sv && files.sv.length > 0) {
      files.sv.forEach((svFile: Express.Multer.File) => {
        if (setOfFileNames.has(svFile.originalname)) {
          throw new CustomException(EXCEPTION_CODE.DUPLICATE_UPLOAD_FILE_NAME);
        }
        if (!validateFileSize(svFile.size)) {
          throw new CustomException(EXCEPTION_CODE.UPLOAD_FILE_SIZE_EXCEED);
        }
        if (
          !['application/gzip', 'application/x-gzip'].includes(
            svFile.mimetype,
          ) ||
          !checkGzip(svFile.buffer)
        ) {
          throw new CustomException(EXCEPTION_CODE.NOT_VALID_SV_VCF_FILE);
        }
        setOfFileNames.add(svFile.originalname);
        gzFileList.push(svFile.buffer);
      });
    }

    if (
      (!files.snp && !files.sv) ||
      (files.snp && files.snp.length == 0 && !files.sv) ||
      (!files.snp && files.sv && files.sv.length == 0)
    ) {
      throw new CustomException(EXCEPTION_CODE.AT_LEAST_ONE_VARIANT_TYPE);
    }

    return pedInfo;
  }

  private async validateHPO(
    files: {
      hpo: Express.Multer.File[];
    },
    hpos: string,
    genePanels: GenePanels[],
  ): Promise<string> {
    const setOfFileNames = new Set<string>();
    let hpoFile = null;
    // validate the upload HPO file format
    if (files?.hpo?.length > 0) {
      if (setOfFileNames.has(files.hpo[0].originalname)) {
        throw new CustomException(EXCEPTION_CODE.DUPLICATE_UPLOAD_FILE_NAME);
      }
      if (!validateFileSize(files.hpo[0].size)) {
        throw new CustomException(EXCEPTION_CODE.UPLOAD_FILE_SIZE_EXCEED);
      }
      try {
        const result = parse(files.hpo[0].buffer.toString(), {
          columns: false,
          skip_empty_lines: true,
          delimiter: '\t',
          comment: '#',
        });
        result.forEach((row: string[]) => {
          if (
            row.length == 0 ||
            row.length > 1 ||
            !row[0].startsWith('HP:') ||
            !validateHPOTerm(row[0])
          ) {
            throw new CustomException(EXCEPTION_CODE.NOT_VALID_HPO_FILE);
          }
        });
        const tempHpos = result.map((row: string[]) => row[0].trim());
        hpoFile = tempHpos.join('\n');
        setOfFileNames.add(files.hpo[0].originalname);
      } catch (e) {
        throw new CustomException(EXCEPTION_CODE.NOT_VALID_HPO_FILE);
      }
    } else if (hpos) {
      hpos = hpos.toUpperCase();
      const hpoCounts = (hpos.match(/HP:/g) || []).length;
      let delimiterCount = -1;
      let delimiter = ',';
      if (hpos.includes('\t')) {
        delimiterCount = (hpos.match(/\t/g) || []).length;
        delimiter = '\t';
      } else if (hpos.includes(',')) {
        delimiterCount = (hpos.match(/,/g) || []).length;
      } else if (hpos.includes(' ')) {
        delimiterCount = (hpos.match(/ /g) || []).length;
        delimiter = ' ';
      }

      if (delimiterCount + 1 != hpoCounts) {
        throw new CustomException(
          EXCEPTION_CODE.ENTER_HPO_TERMS_FORMAT_INVALID,
        );
      }

      hpoFile = hpos.split(delimiter).join('\n');
    } else if (genePanels) {
      const tempSet = new Set();
      genePanels.forEach((panel: GenePanels) => {
        panel.hpos.forEach((hpo: string) => {
          tempSet.add(hpo.trim());
        });
      });
      if (tempSet.size == 0) {
        throw new CustomException(EXCEPTION_CODE.PIPELINE_REQUIRE_HPO_FILE);
      } else {
        hpoFile = Array.from(tempSet.values()).join('\n');
      }
    } else {
      throw new CustomException(EXCEPTION_CODE.PIPELINE_REQUIRE_HPO_FILE);
    }

    return hpoFile;
  }

  private createControlParam(
    s3Path: string,
    controlParams: any[],
    isSV: boolean,
  ): void {
    const controlParam = {};
    controlParam['vcf_bucket'] = getBucketNameFromS3Path(s3Path);
    controlParam['vcf_key'] = getKeyFromS3Path(s3Path);
    if (isSV) {
      controlParam['caller'] = getCallerFromS3Path(s3Path);
    } else {
      controlParam['caller'] = 'snp';
    }
    controlParams.push(controlParam);
  }
}
