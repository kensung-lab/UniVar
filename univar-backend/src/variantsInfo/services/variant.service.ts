import { Injectable } from '@nestjs/common';
import {
  DeleteExomiserRunRequest,
  ExomiserRunResponse,
  ExportRequest,
  ExportResultRequest,
  FindVariantExonsRequest,
  GENE_DB_VERSION_NAME,
  IsReadStatus,
  MarkReadRequest,
  MarkReadResponse,
  Note,
  PROMISES_REJECTED,
  Paging,
  PagingRequest,
  QueryRequest,
  Sample,
  UpdateNoteRequest,
  UserInfo,
  Variant,
  VariantData,
  checkSelectedDatabaseExist,
  filterModifier,
  getDatabaseNModel,
  massageVariantSort,
} from 'src/common';
import {
  DatabaseService,
  GenePanelService,
  GeneService,
  Versions,
} from 'src/applicationInfo';
import { LoggingHelperService } from 'src/utils';
import {
  COMMON_INFO_MODEL_NAME,
  CommonInfosSchema,
  EXOMISER_INFO_MODEL_NAME,
  ExomiserInfo,
  ExomiserInfoSchema,
  SAMPLE_MODEL_NAME,
  Samples,
  SamplesSchema,
  VARIANTS_MODEL_NAME,
  VARIANT_EXONS_MODEL_NAME,
  VAR_USER_INPUTS_MODEL_NAME,
  VarUserInputs,
  VarUserInputsSchema,
  VariantExonsSchema,
  Variants,
  VariantsSchema,
} from '..';
import { Connection } from 'mongoose';
import { AgendaService } from 'src/agenda';
import { S3Service } from 'src/s3linker';
import * as path from 'path';
import { FileService } from 'src/serverlinker';

@Injectable()
export class VariantService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly genePanelService: GenePanelService,
    private readonly loggingHelperService: LoggingHelperService,
    private readonly agendaService: AgendaService,
    private readonly geneService: GeneService,
    private readonly s3Service: S3Service,
    private readonly fileService: FileService,
  ) {}
  async findVariants(
    pagingRequest: PagingRequest,
    userInfo: UserInfo,
  ): Promise<VariantData> {
    await checkSelectedDatabaseExist(
      this.databaseService,
      pagingRequest.track_number,
      pagingRequest.selected_database,
      userInfo,
    );

    const variantData = new VariantData();
    const tempDatabase = await getDatabaseNModel(
      VARIANTS_MODEL_NAME,
      VariantsSchema,
      pagingRequest.selected_database,
    );

    const connection = tempDatabase[0];
    const collection = tempDatabase[1];
    const filters = await filterModifier(
      this.genePanelService,
      pagingRequest.filter,
      pagingRequest.panels,
      pagingRequest.samples,
      userInfo,
      pagingRequest.track_number,
      pagingRequest.exomiser_run,
    );

    const promiseTotalCount =
      this.loggingHelperService.performanceLogAndCountMongo(
        collection,
        {},
        userInfo.preferred_username,
        pagingRequest.track_number,
        'count_total_variant',
        pagingRequest.selected_database,
      );

    const promiseTotalFilteredCount =
      this.loggingHelperService.performanceLogAndCountMongo(
        collection,
        filters,
        userInfo.preferred_username,
        pagingRequest.track_number,
        'count_total_filtered_variant',
        pagingRequest.selected_database,
      );

    const promiseResult = this.loggingHelperService.performanceLogAndFindMongo(
      collection,
      filters,
      massageVariantSort(pagingRequest.sort, pagingRequest.exomiser_run),
      pagingRequest.per_page * pagingRequest.page,
      pagingRequest.per_page,
      {},
      userInfo.preferred_username,
      pagingRequest.track_number,
      'find_variant',
      pagingRequest.selected_database,
    );

    const pagingInformation = new Paging(pagingRequest);

    const [totalCount, totalFilteredCount, tempResult] =
      await Promise.allSettled([
        promiseTotalCount,
        promiseTotalFilteredCount,
        promiseResult,
      ]);

    if (totalCount.status == PROMISES_REJECTED) {
      throw totalCount.reason;
    } else if (totalFilteredCount.status == PROMISES_REJECTED) {
      throw totalFilteredCount.reason;
    } else if (tempResult.status == PROMISES_REJECTED) {
      throw tempResult.reason;
    }
    pagingInformation.total_count = totalCount.value;
    pagingInformation.filtered_total_count = totalFilteredCount.value;
    pagingInformation.total_page =
      pagingInformation.filtered_total_count % pagingRequest.per_page == 0
        ? pagingInformation.filtered_total_count / pagingRequest.per_page
        : Math.floor(
            pagingInformation.filtered_total_count / pagingRequest.per_page,
          ) + 1;
    variantData.result = tempResult.value.map(
      (variant: Variants) =>
        new Variant(variant, userInfo, pagingRequest.exomiser_run),
    );

    await connection.close();

    variantData.page_info = pagingInformation;

    return variantData;
  }

  async findVariantExons(
    findVariantExonsRequest: FindVariantExonsRequest,
    userInfo: UserInfo,
  ): Promise<any> {
    await checkSelectedDatabaseExist(
      this.databaseService,
      findVariantExonsRequest.track_number,
      findVariantExonsRequest.selected_database,
      userInfo,
    );

    const tempDatabase = await getDatabaseNModel(
      VARIANT_EXONS_MODEL_NAME,
      VariantExonsSchema,
      findVariantExonsRequest.selected_database,
    );

    const connection = tempDatabase[0];
    const collection = tempDatabase[1];

    const variantExons =
      await this.loggingHelperService.performanceLogAndFindOneMongo(
        collection,
        { variant_id: findVariantExonsRequest.variant_id },
        {},
        userInfo.preferred_username,
        findVariantExonsRequest.track_number,
        'find_variant_exons',
        findVariantExonsRequest.selected_database,
      );
    await connection.close();
    return variantExons;
  }

  async exportTsv(exportRequest: ExportRequest, userInfo: any): Promise<void> {
    await this.agendaService.agenda.now('export-tsv', {
      exportRequest: exportRequest,
      userInfo: userInfo,
    });
  }

  async exportVcf(exportRequest: ExportRequest, userInfo: any): Promise<void> {
    await this.agendaService.agenda.now('export-vcf', {
      exportRequest: exportRequest,
      userInfo: userInfo,
    });
  }

  // async getExportResult(
  //   exportRequest: ExportResultRequest,
  //   userInfo: any,
  //   fileType: string,
  // ): Promise<string | null> {
  //   let result = null;
  //   const tempResult = await this.agendaService.getExportResult(
  //     fileType,
  //     exportRequest.orig_track_number,
  //     exportRequest.track_number,
  //     userInfo,
  //   );
  //   if (tempResult != null) {
  //     const response = await this.s3Service.getFromS3(
  //       process.env.EXPORT_S3_BUCKET_URL,
  //       process.env.EXPORT_LOCATION +
  //         exportRequest.orig_track_number.replace(':', '_'),
  //     );
  //     result = await response.Body.transformToString();
  //     if (result) {
  //       await this.agendaService.deleteExportResult(
  //         tempResult._id,
  //         exportRequest.orig_track_number,
  //         userInfo,
  //       );
  //       await this.s3Service.deleteFromS3(
  //         process.env.EXPORT_S3_BUCKET_URL,
  //         process.env.EXPORT_LOCATION +
  //           exportRequest.orig_track_number.replace(':', '_'),
  //       );
  //     }
  //   }

  //   return result;
  // }
  async getExportResult(
    exportRequest: ExportResultRequest,
    userInfo: any,
    fileType: string,
  ): Promise<string | null> {
    let result = null;
    const tempResult = await this.agendaService.getExportResult(
      fileType,
      exportRequest.orig_track_number,
      exportRequest.track_number,
      userInfo,
    );
    try {
      if (tempResult != null) {
        const response = await this.fileService.getFromLocal(
          process.env.EXPORT_LOCATION +
            exportRequest.orig_track_number.replace(':', '_'),
          path.join(
            process.env.EXPORT_FILE_PATH,
            process.env.EXPORT_S3_BUCKET_URL,
          ),
        );
        // result = await response.Body.transformToString();
        result = new TextDecoder().decode(response);
        if (result) {
          await this.agendaService.deleteExportResult(
            tempResult._id,
            exportRequest.orig_track_number,
            userInfo,
          );
          await this.fileService.deleteFromLocal(
            process.env.EXPORT_S3_BUCKET_URL,
            process.env.EXPORT_LOCATION +
              exportRequest.orig_track_number.replace(':', '_'),
          );
        }
      }
    } catch (err) {
      console.log('getExportResult Err', err);
    }

    return result;
  }

  async findGeneDBVersion(
    queryRequest: QueryRequest,
    userInfo: UserInfo,
  ): Promise<Versions | any> {
    await checkSelectedDatabaseExist(
      this.databaseService,
      queryRequest.track_number,
      queryRequest.selected_database,
      userInfo,
    );

    const tempDatabase = await getDatabaseNModel(
      COMMON_INFO_MODEL_NAME,
      CommonInfosSchema,
      queryRequest.selected_database,
    );

    const connection = tempDatabase[0];
    const collection = tempDatabase[1];

    const geneDBVersion =
      await this.loggingHelperService.performanceLogAndFindOneMongo(
        collection,
        { type: GENE_DB_VERSION_NAME },
        {},
        userInfo.preferred_username,
        queryRequest.track_number,
        'find_gene_db_version_used',
        queryRequest.selected_database,
      );
    await connection.close();
    let result = {};
    if (geneDBVersion) {
      const geneDetailVersion = this.geneService.findVersion(
        queryRequest.track_number,
        userInfo,
        {
          gene_database_version: geneDBVersion.version,
        },
      );
      result = geneDetailVersion;
    }

    return result;
  }

  async findSamples(
    queryRequest: QueryRequest,
    userInfo: UserInfo,
  ): Promise<Sample[]> {
    await checkSelectedDatabaseExist(
      this.databaseService,
      queryRequest.track_number,
      queryRequest.selected_database,
      userInfo,
    );

    const tempDatabase = await getDatabaseNModel(
      SAMPLE_MODEL_NAME,
      SamplesSchema,
      queryRequest.selected_database,
    );

    const connection = tempDatabase[0];
    const collection = tempDatabase[1];

    const result = await this.loggingHelperService.performanceLogAndFindMongo(
      collection,
      {},
      {},
      null,
      null,
      {},
      userInfo.preferred_username,
      queryRequest.track_number,
      'find_samples',
      queryRequest.selected_database,
    );
    await connection.close();

    return result.map((sample: Samples, index: number) => {
      return new Sample(sample, index);
    });
  }

  async saveRead(
    markReadRequest: MarkReadRequest,
    userInfo: UserInfo,
  ): Promise<MarkReadResponse> {
    const tempDatabase = await getDatabaseNModel(
      VAR_USER_INPUTS_MODEL_NAME,
      VarUserInputsSchema,
      markReadRequest.selected_database,
    );

    const connection = tempDatabase[0];
    const collection = tempDatabase[1];
    const session = await (<Connection>connection).startSession();

    // for statistics purpose saving in multiple collection
    const variantModel = (<Connection>connection).model(
      VARIANTS_MODEL_NAME,
      VariantsSchema,
    );

    const result = new MarkReadResponse();
    result.success_list = [];
    try {
      session.startTransaction();
      const existingVariants =
        await this.loggingHelperService.performanceLogAndFindMongo(
          variantModel,
          {
            _id: {
              $in: markReadRequest.is_read.map((is_read) => is_read.obj_id),
            },
          },
          {},
          null,
          null,
          {},
          userInfo.preferred_username,
          markReadRequest.track_number,
          'get_is_read_status_from_variant',
          markReadRequest.selected_database,
        );

      // create two list to handle them differently.
      const insert_list: Variants[] = [];
      const update_list: Variants[] = [];
      existingVariants.map((variant: Variants) => {
        if (variant?.is_read && variant.is_read.length > 0) {
          update_list.push(variant);
        } else {
          insert_list.push(variant);
        }
      });

      for (const variant of insert_list) {
        const tempResult = await this.markEachVariantAsRead(
          null,
          markReadRequest,
          markReadRequest.is_read.filter(
            (request) => request.obj_id == (<any>variant)._id,
          )[0],
          variant,
          userInfo,
          connection,
          collection,
        );
        if (tempResult) {
          result.success_list.push(tempResult._id);
        }
      }
      for (const variant of update_list) {
        const varUserInputs =
          await this.loggingHelperService.performanceLogAndFindOneMongo(
            collection,
            { variant_object_id: (<any>variant)._id },
            {},
            userInfo.preferred_username,
            markReadRequest.track_number,
            'exist_variant_is_read',
            markReadRequest.selected_database,
          );
        const tempResult = await this.markEachVariantAsRead(
          varUserInputs,
          markReadRequest,
          markReadRequest.is_read.filter(
            (request) => request.obj_id == (<any>variant)._id,
          )[0],
          variant,
          userInfo,
          connection,
          collection,
        );
        if (tempResult) {
          result.success_list.push(tempResult._id);
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }

    await connection.close();
    return result;
  }

  async saveNote(
    updateNoteRequest: UpdateNoteRequest,
    userInfo: UserInfo,
  ): Promise<Variant> {
    const tempDatabase = await getDatabaseNModel(
      VAR_USER_INPUTS_MODEL_NAME,
      VarUserInputsSchema,
      updateNoteRequest.selected_database,
    );

    const connection = tempDatabase[0];
    const collection = tempDatabase[1];
    const session = await (<Connection>connection).startSession();
    let result = null;
    try {
      session.startTransaction();

      // for statistics purpose saving in multiple collection
      const variantModel = (<Connection>connection).model(
        VARIANTS_MODEL_NAME,
        VariantsSchema,
      );

      const existingVariant =
        await this.loggingHelperService.performanceLogAndFindOneMongo(
          variantModel,
          { _id: updateNoteRequest.variant_object_id },
          {},
          userInfo.preferred_username,
          updateNoteRequest.track_number,
          'existing_variant_note',
          updateNoteRequest.selected_database,
        );

      const existingVarUserInputs =
        await this.loggingHelperService.performanceLogAndFindOneMongo(
          collection,
          { variant_object_id: updateNoteRequest.variant_object_id },
          {},
          userInfo.preferred_username,
          updateNoteRequest.track_number,
          'exist_var_user_input_is_read',
          updateNoteRequest.selected_database,
        );

      const varUserInputs =
        existingVarUserInputs ?? new VarUserInputs(existingVariant);
      this.updateNoteArray(updateNoteRequest, userInfo, varUserInputs);
      const doc = new collection(varUserInputs);

      await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        updateNoteRequest.track_number,
        existingVarUserInputs ? 'update_note' : 'insert_note',
        updateNoteRequest.selected_database,
        VAR_USER_INPUTS_MODEL_NAME,
        varUserInputs,
        existingVarUserInputs,
      );

      // Should be exist
      if (existingVariant) {
        // deep clone for logging
        const origVariant = JSON.parse(JSON.stringify(existingVariant));

        this.updateNoteArray(updateNoteRequest, userInfo, existingVariant);

        result = await this.loggingHelperService.performanceLogAndSaveMongo(
          new variantModel(existingVariant),
          userInfo.preferred_username,
          updateNoteRequest.track_number,
          origVariant?.note?.length
            ? 'update_variants_note'
            : 'insert_variants_note',
          updateNoteRequest.selected_database,
          VARIANTS_MODEL_NAME,
          existingVariant,
          origVariant,
        );
        result = new Variant(result, userInfo, null);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }

    return result;
  }

  async getExomiserRunList(
    queryRequest: QueryRequest,
    userInfo: UserInfo,
  ): Promise<ExomiserRunResponse[]> {
    const tempDatabase = await getDatabaseNModel(
      EXOMISER_INFO_MODEL_NAME,
      ExomiserInfoSchema,
      queryRequest.selected_database,
    );

    const connection = tempDatabase[0];
    const collection = tempDatabase[1];

    const result = await this.loggingHelperService.performanceLogAndFindMongo(
      collection,
      {},
      { create_time: -1 },
      null,
      null,
      {},
      userInfo.preferred_username,
      queryRequest.track_number,
      'get_exomiser_run_list',
      queryRequest.selected_database,
    );

    await connection.close();
    return result
      ? result.map((exomiser) => new ExomiserRunResponse(exomiser))
      : [];
  }

  async deleteExomiserRun(
    deleteExomiserRunRequest: DeleteExomiserRunRequest,
    userInfo: UserInfo,
  ): Promise<ExomiserInfo> {
    const tempDatabase = await getDatabaseNModel(
      EXOMISER_INFO_MODEL_NAME,
      ExomiserInfoSchema,
      deleteExomiserRunRequest.selected_database,
    );

    const connection = tempDatabase[0];
    const collection = tempDatabase[1];

    const session = await (<Connection>connection).startSession();

    let result = null;
    try {
      session.startTransaction();

      const variantModel = (<Connection>connection).model(
        VARIANTS_MODEL_NAME,
        VariantsSchema,
      );

      const tempResult =
        await this.loggingHelperService.performanceLogAndDeleteOneMongo(
          collection,
          userInfo.preferred_username,
          deleteExomiserRunRequest.track_number,
          { run: deleteExomiserRunRequest.exomiser_run },
          deleteExomiserRunRequest.selected_database,
          EXOMISER_INFO_MODEL_NAME,
          'delete_exomiser_run_info',
        );

      if (tempResult) {
        result = new ExomiserRunResponse(tempResult);
      }
      const update = {};
      update['$unset'] = {};
      update['$unset'][deleteExomiserRunRequest.exomiser_run] = 1;
      await this.loggingHelperService.performanceLogAndUpdateManyMongo(
        variantModel,
        {},
        update,
        userInfo.preferred_username,
        deleteExomiserRunRequest.track_number,
        'delete_exomiser_run_variants',
        deleteExomiserRunRequest.selected_database,
        VARIANTS_MODEL_NAME,
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }

    return result;
  }

  private updateIsReadArray(
    isReadStatus: IsReadStatus,
    userInfo: UserInfo,
    existingRecord: VarUserInputs | Variants,
  ): boolean {
    let result = true;
    // TODO if share should put group?
    const is_read = isReadStatus.is_share
      ? userInfo.preferred_username
      : userInfo.preferred_username;
    if (isReadStatus.is_read) {
      if (existingRecord?.is_read?.length) {
        if (!existingRecord.is_read.includes(is_read)) {
          existingRecord.is_read.push(is_read);
        } else {
          result = false;
        }
      } else {
        existingRecord.is_read = [is_read];
      }
    } else if (existingRecord?.is_read?.length) {
      if (existingRecord.is_read.includes(is_read)) {
        existingRecord.is_read = existingRecord.is_read.filter(
          (user) => user !== userInfo.preferred_username,
        );
      } else {
        result = false;
      }
    }

    return result;
  }

  private updateNoteArray(
    updateNoteRequest: UpdateNoteRequest,
    userInfo: UserInfo,
    existingRecord: VarUserInputs | Variants,
  ): boolean {
    let result = true;
    // TODO if share should put group?
    const note_user = updateNoteRequest.is_share
      ? userInfo.preferred_username
      : userInfo.preferred_username;

    const note: Note = { user: note_user, note: updateNoteRequest.note };

    if (existingRecord?.note?.length) {
      if (existingRecord.note.some((noteObj) => noteObj.user === note_user)) {
        existingRecord.note = existingRecord.note.filter(
          (noteObj) => noteObj.user !== note_user,
        );
        existingRecord.note.push(note);
      } else {
        existingRecord.note.push(note);
        result = false;
      }
    } else {
      existingRecord.note = [note];
      result = false;
    }

    return result;
  }

  private async markEachVariantAsRead(
    existingVarUserInputs: VarUserInputs,
    markReadRequest: MarkReadRequest,
    isReadStatus: IsReadStatus,
    variant: Variants,
    userInfo: UserInfo,
    connection: Connection,
    collection: new (arg0: VarUserInputs) => any,
  ) {
    let result = null;
    const varUserInputs = existingVarUserInputs || new VarUserInputs(variant);
    this.updateIsReadArray(isReadStatus, userInfo, varUserInputs);
    const doc = new collection(varUserInputs);

    await this.loggingHelperService.performanceLogAndSaveMongo(
      doc,
      userInfo.preferred_username,
      markReadRequest.track_number,
      existingVarUserInputs ? 'update_read_status' : 'insert_read_status',
      markReadRequest.selected_database,
      VAR_USER_INPUTS_MODEL_NAME,
      varUserInputs,
      existingVarUserInputs,
    );

    // for statistics purpose saving in multiple collection
    const variantModel = connection.model(VARIANTS_MODEL_NAME, VariantsSchema);

    // Should be exist
    if (variant) {
      // deep clone for logging
      const origVariant = JSON.parse(JSON.stringify(variant));

      this.updateIsReadArray(isReadStatus, userInfo, variant);

      result = await this.loggingHelperService.performanceLogAndSaveMongo(
        new variantModel(variant),
        userInfo.preferred_username,
        markReadRequest.track_number,
        origVariant?.is_read?.length
          ? 'update_variants_read_status'
          : 'insert_variants_read_status',
        markReadRequest.selected_database,
        VARIANTS_MODEL_NAME,
        variant,
        origVariant,
      );
    }

    return result;
  }
}
