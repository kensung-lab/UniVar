import { Injectable } from '@nestjs/common';
import { GENE_DATABASE } from 'src/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import {
  GenePanels,
  VERSIONS_MODEL_NAME,
  Versions,
} from 'src/applicationInfo/schemas';

@Injectable()
export class GeneService {
  constructor(
    @InjectModel(VERSIONS_MODEL_NAME, GENE_DATABASE)
    private Versions: Model<Versions>,
    private readonly loggingHelperService: LoggingHelperService,
  ) {}

  async findVersion(
    track_number: string,
    userInfo,
    filters: any = {},
  ): Promise<GenePanels[]> {
    return await this.loggingHelperService.performanceLogAndFindOneMongo(
      this.Versions,
      filters,
      {},
      userInfo.preferred_username,
      track_number,
      'find_detail_version_gene_db',
      GENE_DATABASE,
    );
  }
}
