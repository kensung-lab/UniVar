import { Agenda, Job } from '@hokify/agenda';
import { Parser } from '@json2csv/plainjs';
import { Injectable } from '@nestjs/common';
import { DatabaseService, GenePanelService } from 'src/applicationInfo';
import {
  ACTION_TYPE,
  COMMON_DATABASE,
  EXCEPTION_LEVEL,
  EXCEPTION_TYPE,
  EXOMISER_COLUMN_LIST,
  ExportTsvVariant,
  ExportType,
  MAX_EXPORT_NUMBER,
  UserInfo,
  VCF_HEADER_NAME,
  WAIT_STATUS,
  checkSelectedDatabaseExist,
  createMongoDBOption,
  filterModifier,
  getDatabaseNModel,
  massageVariantSort,
} from 'src/common';
import { LoggingHelperService } from 'src/utils';
import {
  COMMON_INFO_MODEL_NAME,
  CommonInfosSchema,
  VARIANTS_MODEL_NAME,
  Variants,
  VariantsSchema,
} from 'src/variantsInfo';
import { TEMP_EXPORTS_MODEL_NAME, TempExports } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3Service } from 'src/s3linker';
import { FileService } from 'src/serverlinker';

@Injectable()
export class AgendaService {
  agenda: Agenda;

  constructor(
    @InjectModel(TEMP_EXPORTS_MODEL_NAME, COMMON_DATABASE)
    private TempExport: Model<TempExports>,
    private readonly loggingHelperService: LoggingHelperService,
    private readonly databaseService: DatabaseService,
    private readonly genePanelService: GenePanelService,
    private readonly s3Service: S3Service,
    private readonly fileService: FileService,
  ) {
    this.agenda = new Agenda({
      db: <any>{
        address: process.env.MONGO_BASE_URL,
        options: createMongoDBOption(process.env.MONGO_AGENDA_DATABASE_NAME),
      },
      defaultLockLifetime: 1800000, // change the default lock life time to 30mins
    });
  }

  async exportTsv(job: Job<any>, done: (error?: Error) => void) {
    const { exportRequest, userInfo } = job.attrs.data;

    console.log('exportTsv start', userInfo);

    await checkSelectedDatabaseExist(
      this.databaseService,
      exportRequest.track_number,
      exportRequest.selected_database,
      userInfo,
    );

    const tempDatabase = await getDatabaseNModel(
      VARIANTS_MODEL_NAME,
      VariantsSchema,
      exportRequest.selected_database,
    );
    const export_session = await this.TempExport.startSession();
    try {
      const collection = tempDatabase[1];
      const filters = await filterModifier(
        this.genePanelService,
        exportRequest.filter,
        exportRequest.panels,
        exportRequest.samples,
        userInfo,
        exportRequest.track_number,
        exportRequest.exomiser_run,
      );
      // only export MAX_EXPORT_NUMBER
      exportRequest.columns = exportRequest.columns
        ? exportRequest.columns
        : {};
      if (exportRequest.columns['samples_genotypes']) {
        exportRequest.columns['genotypes_index'] = 1;
      }
      if (
        exportRequest?.exomiser_run &&
        EXOMISER_COLUMN_LIST.some(
          (exomiser_key) => exomiser_key in exportRequest.columns,
        )
      ) {
        exportRequest.columns[exportRequest.exomiser_run] = 1;
      }

      exportRequest.columns['_id'] = 0;
      if (exportRequest.columns.location) {
        delete exportRequest.columns.location;
      }
      // try to get information by chunk
      let promiseTotalFilteredCount =
        await this.loggingHelperService.performanceLogAndCountMongo(
          collection,
          filters,
          userInfo.preferred_username,
          exportRequest.track_number,
          'count_export_total_filtered_variant',
          exportRequest.selected_database,
        );

      promiseTotalFilteredCount =
        promiseTotalFilteredCount > MAX_EXPORT_NUMBER
          ? MAX_EXPORT_NUMBER
          : promiseTotalFilteredCount;
      const orderedResults = [];
      const new_key_object = {};
      for (const key in exportRequest.columns) {
        if (key != '_id' && key != 'location') {
          new_key_object[key] = null;
        }
      }
      for (
        let ii = 0;
        ii < promiseTotalFilteredCount;
        ii += +process.env.EXPORT_CHUNK_SIZE
      ) {
        const tempResults =
          await this.loggingHelperService.performanceLogAndFindMongo(
            collection,
            filters,
            massageVariantSort(exportRequest.sort, exportRequest.exomiser_run),
            ii,
            +process.env.EXPORT_CHUNK_SIZE,
            exportRequest.columns,
            userInfo.preferred_username,
            exportRequest.track_number,
            'export_variant_tsv',
            exportRequest.selected_database,
          );
        if (tempResults) {
          const samples = exportRequest.samples.sort(
            (sample1, sample2) => sample1.i - sample2.i,
          );
          const orderObject = JSON.parse(JSON.stringify(new_key_object));
          if ('genotypes_index' in orderObject) {
            delete orderObject['genotypes_index'];
          }

          orderedResults.push(
            ...tempResults.map((variant: Variants) => {
              let tempResult = new ExportTsvVariant(
                variant,
                userInfo,
                samples,
                exportRequest.exomiser_run,
              );
              tempResult = Object.assign(
                JSON.parse(JSON.stringify(orderObject)),
                tempResult,
              );
              return tempResult;
            }),
          );
        }
      }

      const opts = { delimiter: '\t' };
      const parser = new Parser(opts);
      const tsvResult = parser.parse(orderedResults);
      // await this.s3Service.uploadToS3(
      //   process.env.EXPORT_S3_BUCKET_URL,
      //   process.env.EXPORT_LOCATION +
      //     exportRequest.track_number.replace(':', '_'),
      //   tsvResult,
      // );
      await this.fileService.uploadToLocal(
        process.env.EXPORT_S3_BUCKET_URL,
        process.env.EXPORT_LOCATION +
          exportRequest.track_number.replace(':', '_'),
        tsvResult,
      );

      export_session.startTransaction();
      const tempExports = new TempExports(
        ExportType.tsv,
        exportRequest.track_number,
      );
      const doc = new this.TempExport(tempExports);
      await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        exportRequest.track_number,
        'export_tsv_to_temp',
        COMMON_DATABASE,
        TEMP_EXPORTS_MODEL_NAME,
        tempExports,
        null,
      );
      await export_session.commitTransaction();
      export_session.endSession();
    } catch (error) {
      console.log('exportTsv err', error);
      this.loggingHelperService.errorLog(
        <Error>error,
        EXCEPTION_TYPE.UNEXPECTED,
        EXCEPTION_LEVEL.CRITICAL,
        userInfo.preferred_username,
        exportRequest.track_number,
        ACTION_TYPE.EXPORT,
        'Export Error',
      );
      await export_session.abortTransaction();
      export_session.endSession();
    } finally {
      console.log('exportTsv end');
    }
    await tempDatabase[0].destroy();
    done();
  }

  async exportVcf(job: Job<any>, done: (error?: Error) => void) {
    const { exportRequest, userInfo } = job.attrs.data;

    console.log('exportVcf start', userInfo);

    await checkSelectedDatabaseExist(
      this.databaseService,
      exportRequest.track_number,
      exportRequest.selected_database,
      userInfo,
    );

    const tempDatabase = await getDatabaseNModel(
      VARIANTS_MODEL_NAME,
      VariantsSchema,
      exportRequest.selected_database,
    );
    const export_session = await this.TempExport.startSession();
    try {
      const collection = tempDatabase[1];
      const filters = await filterModifier(
        this.genePanelService,
        exportRequest.filter,
        exportRequest.panels,
        exportRequest.samples,
        userInfo,
        exportRequest.track_number,
        exportRequest.exomiser_run,
      );
      // only export MAX_EXPORT_NUMBER
      const export_columns = {
        _id: 0,
        chrom: 1,
        start: 1,
        ref: 1,
        alt: 1,
        quality: 1,
        pass_filter: 1,
        genotypes_index: 1,
      };

      // To get the VCF Header
      const commonInfoDatabase = await getDatabaseNModel(
        COMMON_INFO_MODEL_NAME,
        CommonInfosSchema,
        exportRequest.selected_database,
      );

      const vcfHeader =
        await this.loggingHelperService.performanceLogAndFindOneMongo(
          commonInfoDatabase[1],
          { type: VCF_HEADER_NAME },
          {},
          userInfo.preferred_username,
          exportRequest.track_number,
          'find_vcf_header',
          exportRequest.selected_database,
        );

      let vcfStr = '';
      if (vcfHeader?.vcf_header) {
        vcfHeader.vcf_header.split('\n').forEach((vcfInfo) => {
          if (!vcfInfo.startsWith('##INFO') && !vcfInfo.startsWith('#CHROM')) {
            vcfStr += vcfInfo + '\n';
          }
        });

        const results =
          await this.loggingHelperService.performanceLogAndFindMongo(
            collection,
            filters,
            massageVariantSort(exportRequest.sort, exportRequest.exomiser_run),
            0,
            MAX_EXPORT_NUMBER,
            export_columns,
            userInfo.preferred_username,
            exportRequest.track_number,
            'export',
            exportRequest.selected_database,
          );

        if (results) {
          const vcfObjs = results.map((result) => {
            const tempResult = {};
            tempResult['#CHROM'] = result['chrom'];
            tempResult['POS'] = result['start'];
            tempResult['ID'] = '.';
            tempResult['REF'] = result['ref'];
            tempResult['ALT'] = result['alt'];
            tempResult['QUAL'] = result['quality'];
            tempResult['FILTER'] = result['pass_filter'];
            tempResult['INFO'] = '.';
            tempResult['FORMAT'] = 'GT';
            const samples = exportRequest.samples.sort(
              (sample1, sample2) => sample1.i - sample2.i,
            );
            if (
              result['genotypes_index'] &&
              result['genotypes_index'].length > 0
            ) {
              samples.forEach((sample) => {
                tempResult[sample.name] =
                  (result['genotypes_index'][sample.i][0] ?? '.') +
                  '/' +
                  (result['genotypes_index'][sample.i][1] ?? '.');
              });
            }

            return tempResult;
          });

          const opts = { delimiter: '\t', quote: '' };
          const parser = new Parser(opts);
          const content = parser.parse(vcfObjs);
          // TODO in current case doesn't have value contain "" so replacing them is okay
          vcfStr += content.replace(/"/g, '');
        }
      }
      await this.fileService.uploadToLocal(
        process.env.EXPORT_S3_BUCKET_URL,
        process.env.EXPORT_LOCATION +
          exportRequest.track_number.replace(':', '_'),
        vcfStr,
      );
      export_session.startTransaction();
      const tempExports = new TempExports(
        ExportType.vcf,
        exportRequest.track_number,
      );
      const doc = new this.TempExport(tempExports);

      await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        exportRequest.track_number,
        'export_vcf_to_temp',
        COMMON_DATABASE,
        TEMP_EXPORTS_MODEL_NAME,
        tempExports,
        null,
      );
      await export_session.commitTransaction();
      export_session.endSession();
    } catch (error) {
      console.log('exportVcf err', error);
      this.loggingHelperService.errorLog(
        <Error>error,
        EXCEPTION_TYPE.UNEXPECTED,
        EXCEPTION_LEVEL.CRITICAL,
        userInfo.preferred_username,
        exportRequest.track_number,
        ACTION_TYPE.EXPORT,
        'Export Error',
      );
      await export_session.abortTransaction();
      export_session.endSession();
    } finally {
      console.log('exportVcf end');
    }
    await tempDatabase[0].destroy();
    done();
  }

  async getExportResult(
    filetype: string,
    orig_track_number: string,
    track_number: string,
    userInfo: UserInfo,
  ) {
    return await this.loggingHelperService.performanceLogAndFindOneMongo(
      this.TempExport,
      {
        filetype: filetype,
        track_number: orig_track_number,
        status: WAIT_STATUS,
      },
      { creation_date: -1 },
      userInfo.preferred_username,
      track_number,
      'get_export_result',
      COMMON_DATABASE,
    );
  }

  async deleteExportResult(
    id: string,
    track_number: string,
    userInfo: UserInfo,
  ) {
    return await this.loggingHelperService.performanceLogAndDeleteOneMongo(
      this.TempExport,
      userInfo.preferred_username,
      track_number,
      { _id: id },
      COMMON_DATABASE,
      TEMP_EXPORTS_MODEL_NAME,
      'Delete Temp Exports',
    );
  }
}
