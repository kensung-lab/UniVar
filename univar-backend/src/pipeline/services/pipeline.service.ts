import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { parse } from 'csv-parse/sync';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as YAML from 'yaml';
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
  getDatabaseNModel,
  UploadFilesRequest,
  PedInfo,
  getPedForFrontendFromVCF,
  BRAND_UNIVAR,
  getCallerFromS3Path,
  getFileName,
  SVFileInfo,
  getFileNameParts,
  HPORequest,
  ControlFile,
  ErrorPipelineRequest,
  AnnotateServerRequest,
  InternalDataBaseRequest,
} from 'src/common';
import {
  DATABASE_MODEL_NAME,
  DatabaseService,
  Databases,
  DatabasesSchema,
  GENE_PANEL_MODEL_NAME,
  GenePanels,
  HPOTermService,
  UniVarDisplayHPOTerm,
} from 'src/applicationInfo';
import { S3Service } from 'src/s3linker';
import { LoggingHelperService } from 'src/utils';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import {
  EXOMISER_INFO_MODEL_NAME,
  ExomiserInfo,
  ExomiserInfoSchema,
} from 'src/variantsInfo';
import { ExomiserParam } from 'src/common/payloads/pipeline/exomiser-param';
import { FileService } from 'src/serverlinker';
@Injectable()
export class PipelineService {
  constructor(
    @InjectModel(DATABASE_MODEL_NAME, COMMON_DATABASE)
    private DatabasesModel: Model<Databases>,
    @InjectModel(GENE_PANEL_MODEL_NAME, COMMON_DATABASE)
    private GenePanelsModel: Model<GenePanels>,
    private readonly databaseService: DatabaseService,
    private readonly s3Service: S3Service,
    private readonly fileService: FileService,
    private readonly loggingHelperService: LoggingHelperService,
    private readonly hpoTermService: HPOTermService,
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
    const hpoDisplays: string[] = [];
    const controlFile: ControlFile = new ControlFile();
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

    // 3. add hpo terms with name
    if (hpoTerms) {
      const tempHpoTerms = hpoTerms.split('\n');
      // get the hpo terms from database
      const hpoCurrentVersion = await this.hpoTermService.findHPOTermVersions(
        uploadFilesRequest.track_number,
        userInfo,
      );
      const tempHPORequest = new HPORequest();
      tempHPORequest.track_number = uploadFilesRequest.track_number;
      tempHPORequest.version = hpoCurrentVersion[0];
      const dbHPO = await this.hpoTermService.findHPOTerms(
        tempHPORequest,
        userInfo,
      );
      const hpoTree = dbHPO.hpos[0];
      for (const hpoTerm of tempHpoTerms) {
        const hpoLabel = this.findHPOLabel(hpoTerm, hpoTree);
        if (!hpoLabel) {
          throw new CustomException(
            EXCEPTION_CODE.NOT_VALID_HPO_TERMS,
            hpoTerm,
            'Uploaded HPO file contain invalid HPO term: ' + hpoTerm,
          );
        }
        hpoDisplays.push(hpoLabel);
      }
    }

    // 4. upload to s3

    // generate UUID
    let anySnp = false;
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
    const samplePath = `${process.env.UPLOAD_FILE_PATH}/raw/${databaseName}/`;
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
    const tempPedLocation = samplePath + pedFileName;
    await this.fileService.storeFilesToLocal({
      filePath: tempPedLocation,
      fileBuffer: pedInfo as Buffer,
    });
    pedLocation.push(tempPedLocation);

    // hpos
    if (hpoTerms || (files.hpo?.length > 0 && files.hpo[0].buffer)) {
      const hpoFileName = hpoTerms
        ? databaseName + '.hpo'
        : files.hpo[0].originalname;
      const hpoBuffer = hpoTerms || files.hpo[0].buffer;
      const tempHpoLocation = samplePath + 'hpo/' + hpoFileName;
      await this.fileService.storeFilesToLocal({
        filePath: tempHpoLocation,
        fileBuffer: Buffer.from(hpoBuffer.toString().replace('\r', '')),
      });

      hpoLocation.push(tempHpoLocation);
    }

    const access_group = [unique_string];

    // snp files
    if (files.snp && files.snp.length > 0) {
      const snpFileName = getVariantFileName(
        await getFileName(
          uploadFilesRequest.probandId,
          files.snp[0].originalname,
          files.snp[0].buffer,
        ),
        unique_string,
      );
      const tempSnpLocation = samplePath + snpFileName;
      await this.fileService.storeFilesToLocal({
        filePath: tempSnpLocation,
        fileBuffer: files.snp[0].buffer,
      });
      snpLocation.push(tempSnpLocation);
      vcfHeader = await getVCFHeader(files.snp[0].buffer);

      controlFile.in_snp_file = tempSnpLocation;
      controlFile.output_name = snpFileName.replace('.vcf.gz', '');

      variantFileCounts++;
      anySnp = true;
    }

    // sv files
    if (files.sv && files.sv.length > 0) {
      const count = variantFileCounts;
      for (const svFile of files.sv) {
        const svFileName = getVariantFileName(
          await getFileName(
            uploadFilesRequest.probandId,
            svFile.originalname,
            svFile.buffer,
            'sv',
            svCallers,
          ),
          unique_string,
        );
        const tempSvFileLocation = samplePath + svFileName;
        await this.fileService.storeFilesToLocal({
          filePath: tempSvFileLocation,
          fileBuffer: svFile.buffer,
        });
        svLocation.push(tempSvFileLocation);
        controlFile.in_sv_files.push(tempSvFileLocation);
        if (count == variantFileCounts && !anySnp) {
          vcfHeader = await getVCFHeader(svFile.buffer);
        }

        variantFileCounts++;
      }
    }

    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      uploadFilesRequest.track_number,
      ACTION_TYPE.UPLOAD_FILE,
      'upload_data_file',
    );

    // 5. upload control file
    controlFile.access_group = access_group.toString();
    controlFile.ped_path = tempPedLocation;
    controlFile.database_name = databaseName;
    const controlFilePath = `${process.env.UPLOAD_FILE_PATH}/control_files/${databaseName}/`;
    await this.fileService.storeFilesToLocal({
      filePath: controlFilePath + 'anno.yml',
      fileString: YAML.stringify(controlFile),
    });

    // 6. insert to database collection for pipeline execution
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
      databases.proband_id = uploadFilesRequest.probandId;
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
        databases.hpoDisplays = hpoDisplays;
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

    // 7. action logging
    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      uploadFilesRequest.track_number,
      ACTION_TYPE.UPLOAD_FILE,
      'upload_control_file',
    );

    return new JobInformation(unique_string);
  }

  async annotateServer(
    annotateServerRequest: AnnotateServerRequest,
    userInfo: UserInfo,
  ): Promise<JobInformation> {
    const hpoDisplays: string[] = [];
    const controlFile: ControlFile = new ControlFile();

    if (process.env.NEXTFLOW_SECRET != annotateServerRequest.secret) {
      throw new CustomException(EXCEPTION_CODE.INCORRECT_NEXTFLOW_SECRET);
    }

    // 1. validate the files
    const pedInfo = await this.validateServerFiles(
      annotateServerRequest.snp_path,
      annotateServerRequest.sv_callers,
      annotateServerRequest.ped_path,
      annotateServerRequest.hpo_path,
      annotateServerRequest.proband_id,
    );
    let hpoTerms: string = undefined;
    if (annotateServerRequest.hpo_path) {
      hpoTerms = await this.validateHPOServer(annotateServerRequest.hpo_path);
    }

    // 3. add hpo terms with name
    if (hpoTerms) {
      const tempHpoTerms = hpoTerms.split('\n');
      // get the hpo terms from database
      const hpoCurrentVersion = await this.hpoTermService.findHPOTermVersions(
        annotateServerRequest.track_number,
        userInfo,
      );
      const tempHPORequest = new HPORequest();
      tempHPORequest.track_number = annotateServerRequest.track_number;
      tempHPORequest.version = hpoCurrentVersion[0];
      const dbHPO = await this.hpoTermService.findHPOTerms(
        tempHPORequest,
        userInfo,
      );
      const hpoTree = dbHPO.hpos[0];
      for (const hpoTerm of tempHpoTerms) {
        const hpoLabel = this.findHPOLabel(hpoTerm, hpoTree);
        if (!hpoLabel) {
          throw new CustomException(
            EXCEPTION_CODE.NOT_VALID_HPO_TERMS,
            hpoTerm,
            'Uploaded HPO file contain invalid HPO term: ' + hpoTerm,
          );
        }
        hpoDisplays.push(hpoLabel);
      }
    }

    // 4. relocate the files
    const snpFile: Buffer = annotateServerRequest.snp_path
      ? await this.fileService.getFromLocal(annotateServerRequest.snp_path)
      : undefined;

    // generate UUID
    let anySnp = false;
    const unique_string =
      new Date().getTime() + '-' + randomUUID().split('-').pop();
    const databaseName = getDatabaseName(
      annotateServerRequest.snp_path
        ? await getFileNameParts(annotateServerRequest.proband_id, snpFile)
        : await getFileNameParts(
            annotateServerRequest.proband_id,
            await this.fileService.getFromLocal(
              annotateServerRequest.sv_callers[0].filename,
            ),
          ),
      unique_string,
    );
    const samplePath = `${process.env.UPLOAD_FILE_PATH}/raw/${databaseName}/`;
    let variantFileCounts = 0;
    const snpLocation: string[] = [];
    const svLocation: string[] = [];
    const pedLocation: string[] = [];
    const hpoLocation: string[] = [];
    let vcfHeader: string = null;

    // upload ped file
    const pedFileName = `${annotateServerRequest.proband_id}_${unique_string}.ped`;
    const tempPedLocation = samplePath + pedFileName;
    await this.fileService.storeFilesToLocal({
      filePath: tempPedLocation,
      fileBuffer: pedInfo as Buffer,
    });
    pedLocation.push(tempPedLocation);

    // hpos
    if (hpoTerms) {
      const hpoFileName = `${annotateServerRequest.proband_id}_${unique_string}.hpo`;
      const hpoBuffer = hpoTerms;
      const tempHpoLocation = samplePath + 'hpo/' + hpoFileName;
      await this.fileService.storeFilesToLocal({
        filePath: tempHpoLocation,
        fileBuffer: Buffer.from(hpoBuffer.toString().replace('\r', '')),
      });

      hpoLocation.push(tempHpoLocation);
    }

    const access_group = annotateServerRequest.access_group.split(',');

    // snp files
    if (snpFile) {
      const snpFileName = getVariantFileName(
        await getFileName(
          annotateServerRequest.proband_id,
          this.fileService.getFileNameFromPath(annotateServerRequest.snp_path),
          snpFile,
        ),
        unique_string,
      );
      const tempSnpLocation = samplePath + snpFileName;
      await this.fileService.storeFilesToLocal({
        filePath: tempSnpLocation,
        fileBuffer: snpFile,
      });
      snpLocation.push(tempSnpLocation);

      vcfHeader = await getVCFHeader(snpFile);
      controlFile.in_snp_file = tempSnpLocation;
      controlFile.output_name = snpFileName.replace('.vcf.gz', '');

      variantFileCounts++;
      anySnp = true;
    }

    // sv files
    if (
      annotateServerRequest.sv_callers &&
      annotateServerRequest.sv_callers.length > 0
    ) {
      const count = variantFileCounts;
      for (const svFile of annotateServerRequest.sv_callers) {
        const svFileBuffer = await this.fileService.getFromLocal(
          svFile.filename,
        );
        const svFileName = getVariantFileName(
          await getFileName(
            annotateServerRequest.proband_id,
            svFile.filename,
            svFileBuffer,
            'sv',
            annotateServerRequest.sv_callers,
          ),
          unique_string,
        );
        const tempSvFileLocation = samplePath + svFileName;
        await this.fileService.storeFilesToLocal({
          filePath: tempSvFileLocation,
          fileBuffer: svFileBuffer,
        });
        svLocation.push(tempSvFileLocation);
        controlFile.in_sv_files.push(tempSvFileLocation);
        if (count == variantFileCounts && !anySnp) {
          vcfHeader = await getVCFHeader(svFileBuffer);
        }

        variantFileCounts++;
      }
    }

    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      annotateServerRequest.track_number,
      ACTION_TYPE.UPLOAD_FILE,
      'upload_data_file',
    );

    // 5. upload control file
    controlFile.access_group = access_group.toString();
    controlFile.ped_path = tempPedLocation;
    controlFile.database_name = databaseName;
    const controlFilePath = `${process.env.UPLOAD_FILE_PATH}/control_files/${databaseName}/`;
    await this.fileService.storeFilesToLocal({
      filePath: controlFilePath + 'anno.yml',
      fileString: YAML.stringify(controlFile),
    });

    // 6. insert to database collection for pipeline execution
    const session = await this.DatabasesModel.startSession();
    try {
      session.startTransaction();
      const databases = new Databases();
      databases.database_name = databaseName;
      databases.display_name = databaseName;
      databases.is_ready = false;
      databases.access_group = [annotateServerRequest.access_group];
      databases.email = userInfo.email;
      databases.complete_num = variantFileCounts;
      databases.brand = BRAND_UNIVAR;
      databases.create_time = new Date();
      databases.proband_id = annotateServerRequest.proband_id;
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
        databases.hpoDisplays = hpoDisplays;
      }

      if (snpLocation.length > 0) {
        databases.snpVcfLocation = snpLocation;
      }

      if (
        annotateServerRequest.cram_path &&
        annotateServerRequest.cram_path.length > 0
      ) {
        databases.cramLocation = annotateServerRequest.cram_path;
      }

      const doc = new this.DatabasesModel(databases);
      await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        annotateServerRequest.track_number,
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

    // 7. action logging
    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      annotateServerRequest.track_number,
      ACTION_TYPE.UPLOAD_FILE,
      'upload_control_file',
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
    const hpoDisplays: string[] = [];
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

    // 3. add hpo terms with name
    if (hpoTerms) {
      const tempHpoTerms = hpoTerms.split('\n');
      // get the hpo terms from database
      const hpoCurrentVersion = await this.hpoTermService.findHPOTermVersions(
        uploadHPORequest.track_number,
        userInfo,
      );
      const tempHPORequest = new HPORequest();
      tempHPORequest.track_number = uploadHPORequest.track_number;
      tempHPORequest.version = hpoCurrentVersion[0];
      const dbHPO = await this.hpoTermService.findHPOTerms(
        tempHPORequest,
        userInfo,
      );
      const hpoTree = dbHPO.hpos[0];
      for (const hpoTerm of tempHpoTerms) {
        const hpoLabel = this.findHPOLabel(hpoTerm, hpoTree);
        if (!hpoLabel) {
          throw new CustomException(
            EXCEPTION_CODE.NOT_VALID_HPO_TERMS,
            undefined,
            'The HPO file contain a HPO term which is not match UniVar HPO term: ' +
              hpoTerm,
          );
        }
        hpoDisplays.push(hpoLabel);
      }
    }

    // 4. upload to s3
    // generate UUID
    const exomiserParam: ExomiserParam = new ExomiserParam();
    const uniquePostfix =
      '_' + new Date().getTime() + '-' + randomUUID().split('-').pop();
    const uniqueString = 'exomiser' + uniquePostfix;
    const databaseName = uploadHPORequest.selected_database;
    const inputFolder = process.env.UPLOAD_FILE_PATH + '/raw/';
    let numberOfVcfFiles = 0;

    // hpos
    const hpoFileName = hpoTerms
      ? databaseName + uniquePostfix + '.hpo'
      : files.hpo[0].originalname.replace('.hpo', '') + uniquePostfix + '.hpo';
    const hpoBuffer = hpoTerms || files.hpo[0].buffer;
    const hpoLocation = `${inputFolder}${databaseName}/hpo/${hpoFileName}`;

    await this.fileService.storeFilesToLocal({
      filePath: hpoLocation,
      fileBuffer: Buffer.from(hpoBuffer.toString().replace('\r', '')),
    });

    const selectedDatabases: Databases[] =
      await this.databaseService.getRawDatabasesList(
        uploadHPORequest.track_number,
        userInfo,
        'get_databases_for_exomiser',
        { database_name: uploadHPORequest.selected_database },
      );
    let currentSelectedDatabase = null;
    if (selectedDatabases?.length == 1) {
      currentSelectedDatabase = selectedDatabases[0];
      if (currentSelectedDatabase?.snpVcfLocation?.length > 0) {
        // assuming raw folder structure:
        // path/to/raw/unique_string/file
        // assuming annotated folder structure:
        // path/to/annotated/file
        const tempAnnotatedPath: string[] =
          currentSelectedDatabase.snpVcfLocation[0]
            .replace('raw', 'annotated')
            .split('/');
        tempAnnotatedPath.splice(-2, 1);
        exomiserParam.vcf_files.push(tempAnnotatedPath.join('/'));
        numberOfVcfFiles++;
      }
      if (currentSelectedDatabase?.svVcfLocation?.length > 0) {
        currentSelectedDatabase?.svVcfLocation?.forEach(
          (svVcfLocation: string) => {
            exomiserParam.vcf_files.push(svVcfLocation);
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
      ACTION_TYPE.UPLOAD_FILE,
      'upload_hpo',
    );
    exomiserParam.access_group = currentSelectedDatabase?.access_group[0];
    exomiserParam.database_name = uploadHPORequest.selected_database;
    exomiserParam.exomiser_run = uniqueString;
    exomiserParam.hpo_path = hpoLocation;
    exomiserParam.ped_path = currentSelectedDatabase?.pedLocation[0];
    exomiserParam.proband_id =
      currentSelectedDatabase?.proband_id ??
      currentSelectedDatabase?.samples.proband.sample_id;

    // 5. save exomiser param to trigger nextflow
    const exomiserParamYML = YAML.stringify(exomiserParam);
    await this.fileService.storeFilesToLocal({
      filePath: `${process.env.UPLOAD_FILE_PATH}/exomiser_control_files/${uniqueString}/${uniqueString}.yml`,
      fileBuffer: Buffer.from(exomiserParamYML.replace('\r', '')),
    });

    // 6. insert to database collection for exomiser execution
    const session = await collection.startSession();
    try {
      session.startTransaction();
      const exomiserInfo = new ExomiserInfo();
      exomiserInfo.run = uniqueString;
      exomiserInfo.display_name = uploadHPORequest.display_name;
      exomiserInfo.complete_num = numberOfVcfFiles;
      exomiserInfo.is_ready = false;
      exomiserInfo.create_time = new Date();
      exomiserInfo.hpos = hpoTerms.split('\n');
      exomiserInfo.hpoDisplays = hpoDisplays;

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

    return new JobInformation(uniqueString);
  }

  async initExomiser(
    internalDatabaseRequest: InternalDataBaseRequest,
    userInfo: UserInfo,
  ): Promise<JobInformation> {
    if (
      process.env.VARIANT_IMPORT_TOOL_SECRET != internalDatabaseRequest.secret
    ) {
      throw new CustomException(
        EXCEPTION_CODE.INCORRECT_VARIANT_IMPORT_TOOL_SECRET,
      );
    }

    // no need to check if currently is running 5 exomiser already, as this is must run
    // 1. create trigger params
    const exomiserParam: ExomiserParam = new ExomiserParam();
    const uniqueString = 'initial_exomiser_run';
    const databaseName = internalDatabaseRequest.selected_database;
    const inputFolder = process.env.UPLOAD_FILE_PATH + '/raw/';
    let numberOfVcfFiles = 0;

    const selectedDatabases: Databases[] =
      await this.databaseService.getRawDatabasesList(
        internalDatabaseRequest.track_number,
        userInfo,
        'get_databases_for_exomiser',
        { database_name: internalDatabaseRequest.selected_database },
      );

    let currentSelectedDatabase = null;
    if (selectedDatabases?.length == 1) {
      currentSelectedDatabase = selectedDatabases[0];

      if (currentSelectedDatabase?.hpoLocation?.length > 0) {
        exomiserParam.hpo_path = currentSelectedDatabase.hpoLocation[0];
      } else {
        // check if upload hpo exist, if not return
        return new JobInformation(uniqueString);
      }
      if (currentSelectedDatabase?.snpVcfLocation?.length > 0) {
        exomiserParam.vcf_files.push(currentSelectedDatabase.snpVcfLocation[0]);
        numberOfVcfFiles++;
      }
      if (currentSelectedDatabase?.svVcfLocation?.length > 0) {
        currentSelectedDatabase?.svVcfLocation?.forEach(
          (svVcfLocation: string) => {
            exomiserParam.vcf_files.push(svVcfLocation);
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
      internalDatabaseRequest.track_number,
      ACTION_TYPE.UPLOAD_FILE,
      'upload_hpo',
    );
    exomiserParam.access_group = currentSelectedDatabase?.access_group;
    exomiserParam.database_name = internalDatabaseRequest.selected_database;
    exomiserParam.exomiser_run = uniqueString;
    exomiserParam.ped_path = currentSelectedDatabase?.pedLocation[0];
    exomiserParam.proband_id =
      currentSelectedDatabase?.proband_id ??
      currentSelectedDatabase?.samples.proband.sample_id;

    // 2. save exomiser param to trigger nextflow
    const exomiserParamYML = YAML.stringify(exomiserParam);
    await this.fileService.storeFilesToLocal({
      filePath: `${process.env.UPLOAD_FILE_PATH}/exomiser_control_files/${databaseName}/${uniqueString}.yml`,
      fileBuffer: Buffer.from(exomiserParamYML.replace('\r', '')),
    });

    // 3. insert to database collection for exomiser execution
    const tempDatabase = await getDatabaseNModel(
      EXOMISER_INFO_MODEL_NAME,
      ExomiserInfoSchema,
      internalDatabaseRequest.selected_database,
    );
    const collection = tempDatabase[1];
    const session = await collection.startSession();
    try {
      session.startTransaction();
      const exomiserInfo = new ExomiserInfo();
      exomiserInfo.run = uniqueString;
      exomiserInfo.display_name = uniqueString;
      exomiserInfo.complete_num = numberOfVcfFiles;
      exomiserInfo.is_ready = false;
      exomiserInfo.create_time = new Date();
      exomiserInfo.hpos = currentSelectedDatabase?.hpos;
      exomiserInfo.hpoDisplays = currentSelectedDatabase?.hpoDisplays;

      const doc = new collection(exomiserInfo);
      await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        internalDatabaseRequest.track_number,
        'insert_database',
        internalDatabaseRequest.selected_database,
        EXOMISER_INFO_MODEL_NAME,
        exomiserInfo,
      );
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
    }
    await tempDatabase[0].destroy();

    session.endSession();

    return new JobInformation(uniqueString);
  }

  async pipelineError(
    errorPipelineRequest: ErrorPipelineRequest,
    userInfo: UserInfo,
  ) {
    if (process.env.NEXTFLOW_SECRET != errorPipelineRequest.secret) {
      throw new CustomException(EXCEPTION_CODE.INCORRECT_NEXTFLOW_SECRET);
    }

    const selectedDatabases: Databases[] =
      await this.databaseService.getRawDatabasesList(
        errorPipelineRequest.track_number,
        userInfo,
        'get_databases_for_exomiser',
        { database_name: errorPipelineRequest.selected_database },
      );

    let currentSelectedDatabase: Databases = null;
    if (selectedDatabases?.length == 1) {
      currentSelectedDatabase = selectedDatabases[0];

      const tempDatabase = await getDatabaseNModel(
        DATABASE_MODEL_NAME,
        DatabasesSchema,
        COMMON_DATABASE,
      );

      const collection = tempDatabase[1];
      const session = await collection.startSession();
      try {
        session.startTransaction();

        await this.loggingHelperService.performanceLogAndUpdateManyMongo(
          collection,
          { database_name: errorPipelineRequest.selected_database },
          { $set: { is_error: true } },
          userInfo.preferred_username,
          errorPipelineRequest.track_number,
          'mark_pipeline_failed',
          errorPipelineRequest.selected_database,
          DATABASE_MODEL_NAME,
        );
        await session.commitTransaction();
      } catch (e) {
        await session.abortTransaction();
      }
      await tempDatabase[0].destroy();

      session.endSession();
    } else {
      throw new CustomException(
        EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST,
      );
    }
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

    const sampileFile = await this.fileService.getFromLocal(
      key,
      process.env.EXAMPLE_FILES_PATH,
    );
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

  private async validateServerFiles(
    snpFilePath: string,
    svCallers: SVFileInfo[],
    pedPath: string,
    hpoPath: string,
    probandId: string,
  ): Promise<string | Buffer> {
    const setOfFileNames = new Set<string>();
    let pedInfo: Buffer = await this.fileService.getFromLocal(pedPath);
    // validate the upload ped file format
    if (pedInfo) {
      if (!validateFileSize(Buffer.byteLength(pedInfo))) {
        throw new CustomException(EXCEPTION_CODE.UPLOAD_FILE_SIZE_EXCEED);
      }
      let pedContent = null;
      try {
        pedContent = parse(pedInfo.toString(), {
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

      setOfFileNames.add(this.fileService.getFileNameFromPath(pedPath));
    } else {
      throw new CustomException(EXCEPTION_CODE.PIPELINE_REQUIRE_PED);
    }

    const gzFileList: Buffer[] = [];

    // validate the uploaded SNP VCF gz file
    if (snpFilePath) {
      const tempSnpFile: Buffer =
        await this.fileService.getFromLocal(snpFilePath);
      const tempSnpFilename: string =
        this.fileService.getFileNameFromPath(snpFilePath);
      if (snpFilePath && Buffer.byteLength(tempSnpFile) > 0) {
        if (setOfFileNames.has(tempSnpFilename)) {
          throw new CustomException(EXCEPTION_CODE.DUPLICATE_UPLOAD_FILE_NAME);
        }
        if (!validateFileSize(Buffer.byteLength(tempSnpFile))) {
          throw new CustomException(EXCEPTION_CODE.UPLOAD_FILE_SIZE_EXCEED);
        }
        if (!checkGzip(tempSnpFile)) {
          throw new CustomException(EXCEPTION_CODE.NOT_VALID_SNP_VCF_FILE);
        }
        setOfFileNames.add(tempSnpFilename);
        gzFileList.push(tempSnpFile);
      }
    }

    // validate the uploaded SV VCF gz file
    if (svCallers && svCallers.length > 0) {
      for (const svFile of svCallers) {
        const tempSvFile: Buffer = await this.fileService.getFromLocal(
          svFile.filename,
        );
        const tempSvFilename: string = this.fileService.getFileNameFromPath(
          svFile.filename,
        );
        if (setOfFileNames.has(tempSvFilename)) {
          throw new CustomException(EXCEPTION_CODE.DUPLICATE_UPLOAD_FILE_NAME);
        }
        if (!validateFileSize(Buffer.byteLength(tempSvFile))) {
          throw new CustomException(EXCEPTION_CODE.UPLOAD_FILE_SIZE_EXCEED);
        }
        if (!checkGzip(tempSvFile)) {
          throw new CustomException(EXCEPTION_CODE.NOT_VALID_SV_VCF_FILE);
        }
        setOfFileNames.add(tempSvFilename);
        gzFileList.push(tempSvFile);
      }
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

  private async validateHPOServer(hpo_path: string): Promise<string> {
    let hpoFile = null;
    const tempHPOFile: Buffer = await this.fileService.getFromLocal(hpo_path);
    // validate the upload HPO file format
    if (tempHPOFile && Buffer.byteLength(tempHPOFile) > 0) {
      if (!validateFileSize(Buffer.byteLength(tempHPOFile))) {
        throw new CustomException(EXCEPTION_CODE.UPLOAD_FILE_SIZE_EXCEED);
      }
      try {
        const result = parse(tempHPOFile.toString(), {
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
      } catch (e) {
        throw new CustomException(EXCEPTION_CODE.NOT_VALID_HPO_FILE);
      }
    } else {
      // should never come as checked before
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

  private findHPOLabel(hpoTerm: string, hpoTree: UniVarDisplayHPOTerm): string {
    let result = null;
    if (hpoTerm == hpoTree.value) {
      result = hpoTree.label;
    } else {
      for (const hpoSubTree of hpoTree.children) {
        result = this.findHPOLabel(hpoTerm, hpoSubTree);
        if (result) {
          break;
        }
      }
    }
    return result;
  }
}
