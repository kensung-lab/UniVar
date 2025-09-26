import { Inject, Injectable } from '@nestjs/common';
import {
  COMMON_DATABASE,
  GenePanel,
  GenePanelList,
  UserInfo,
} from 'src/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import {
  GENE_PANEL_MODEL_NAME,
  GENE_PANEL_VERSION_MODEL_NAME,
  GenePanelVersions,
  GenePanels,
} from 'src/applicationInfo/schemas';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class GenePanelService {
  constructor(
    @InjectModel(GENE_PANEL_MODEL_NAME, COMMON_DATABASE)
    private GenePanels: Model<GenePanels>,
    @InjectModel(GENE_PANEL_VERSION_MODEL_NAME, COMMON_DATABASE)
    private GenePanelVersions: Model<GenePanelVersions>,
    private readonly loggingHelperService: LoggingHelperService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getLatestPanelList(
    track_number: string,
    userInfo: UserInfo,
  ): Promise<GenePanelList> {
    try {
      const latestVersion: GenePanelVersions =
        await this.loggingHelperService.performanceLogAndFindOneMongo(
          this.GenePanelVersions,
          {},
          { create_date: -1 },
          userInfo.preferred_username,
          track_number,
          'find_latest_gene_panel_versions',
          COMMON_DATABASE,
        );
      let result: GenePanelList = null;

      const cacheResult: GenePanelList = await this.cacheManager.get(
        'panel' + latestVersion.version,
      );

      if (cacheResult) {
        result = cacheResult;
      } else {
        result = new GenePanelList();
        result.lastModifyDate = latestVersion.create_date;

        const genePanels = await this.getGenePanelList(track_number, userInfo, {
          panel_version: latestVersion.version,
          'genes.0': { $exists: true },
        });

        result.genePanels = genePanels.map((result) => new GenePanel(result));
        await this.cacheManager.set(
          'panel' + latestVersion.version,
          result,
          24 * 60 * 60 * 1000,
        );
      }

      return result;
    } catch (err) {
      console.log('err', err);
      return null;
    }
  }

  async getGenePanelList(
    track_number: string,
    userInfo,
    filters: any = {},
  ): Promise<GenePanels[]> {
    return await this.loggingHelperService.performanceLogAndFindMongo(
      this.GenePanels,
      filters,
      {},
      null,
      null,
      {},
      userInfo.preferred_username,
      track_number,
      'find_gene_panels',
      COMMON_DATABASE,
    );
  }
}
