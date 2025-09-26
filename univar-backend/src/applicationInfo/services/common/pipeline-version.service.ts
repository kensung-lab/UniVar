import { Injectable } from '@nestjs/common';
import {
  COMMON_DATABASE,
  getDatabaseNModel,
  VERSION_INFO,
  EXCEPTION_CODE,
  CustomException,
} from 'src/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import { PIPELINE_MODEL_NAME } from 'src/applicationInfo/schemas';
import {
  COMMON_INFO_MODEL_NAME,
  CommonInfos,
  CommonInfosSchema,
} from 'src/variantsInfo/schemas/common-infos';
import { PipelineVersion } from 'src/applicationInfo/schemas/common/pipeline-version';

@Injectable()
export class PipelineVersionService {
  constructor(
    @InjectModel(PIPELINE_MODEL_NAME, COMMON_DATABASE)
    private PipelineVersion: Model<PipelineVersion>,
    private readonly loggingHelperService: LoggingHelperService,
  ) {}

  async findPipelineInfo(
    trackNumber: string,
    selected_database: string,
    userInfo,
    brand: string = null,
  ): Promise<PipelineVersion> {
    let result: PipelineVersion;
    if (!brand) {
      const commonInfoDatabase = await getDatabaseNModel(
        COMMON_INFO_MODEL_NAME,
        CommonInfosSchema,
        selected_database,
      );

      if (
        !commonInfoDatabase ||
        commonInfoDatabase.length < 1 ||
        !commonInfoDatabase[1]
      ) {
        throw new CustomException(
          EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST,
        );
      }

      const versionInfo: CommonInfos =
        await this.loggingHelperService.performanceLogAndFindOneMongo(
          commonInfoDatabase[1],
          { type: VERSION_INFO },
          {},
          userInfo.preferred_username,
          trackNumber,
          'find_version_info',
          selected_database,
        );
      const filters: any = {
        version: versionInfo.pipeline,
      };

      if (versionInfo.brand) {
        filters.brand = versionInfo.brand;
      }
      result = await this.loggingHelperService.performanceLogAndFindOneMongo(
        this.PipelineVersion,
        filters,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_pipeline_info',
        COMMON_DATABASE,
      );

      await commonInfoDatabase[0].destroy();
    } else {
      result = await this.loggingHelperService.performanceLogAndFindOneMongo(
        this.PipelineVersion,
        {
          brand: brand,
        },
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_pipeline_info',
        COMMON_DATABASE,
      );
    }

    return result;
  }
}
