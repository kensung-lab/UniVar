import { Injectable } from '@nestjs/common';
import { COMMON_DATABASE, UserInfo, HPORequest } from 'src/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import { HPOTerms, HPO_TERMS_MODEL_NAME } from 'src/applicationInfo/schemas';

@Injectable()
export class HPOTermService {
  constructor(
    @InjectModel(HPO_TERMS_MODEL_NAME, COMMON_DATABASE)
    private HPOTerms: Model<HPOTerms>,
    private readonly loggingHelperService: LoggingHelperService,
  ) {}

  async findHPOTermVersions(
    trackNumber: string,
    userInfo: UserInfo,
  ): Promise<string[]> {
    const versionInfo: HPOTerms[] =
      await this.loggingHelperService.performanceLogAndFindMongo(
        this.HPOTerms,
        {},
        {},
        0,
        999999,
        { hpos: 0 },
        userInfo.preferred_username,
        trackNumber,
        'find_hpo_terms_versions',
        COMMON_DATABASE,
      );

    return versionInfo.map((eachHpoTerms: HPOTerms) => eachHpoTerms.version);
  }

  async findHPOTerms(hpoRequest: HPORequest, userInfo): Promise<HPOTerms> {
    const hpoTerms: HPOTerms =
      await this.loggingHelperService.performanceLogAndFindOneMongo(
        this.HPOTerms,
        { version: hpoRequest.version },
        {},
        userInfo.preferred_username,
        hpoRequest.track_number,
        'find_hpo_terms',
        COMMON_DATABASE,
      );

    return hpoTerms;
  }
}
