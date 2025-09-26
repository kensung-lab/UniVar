import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import {
  GENE_PANEL_MODEL_NAME,
  GENE_PANEL_VERSION_MODEL_NAME,
  GenePanelVersions,
  GenePanels,
} from 'src/applicationInfo/schemas';
import { GenePanelService } from 'src/applicationInfo';
import { getModelToken } from '@nestjs/mongoose';
import { COMMON_DATABASE, GenePanel } from 'src/common';
import { B_TEAM_USERINFO, mockCacheManager } from '../../../mock';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('GenePanelService', () => {
  let genePanelService: GenePanelService;
  let genePanelsModel: Model<GenePanels>;
  let loggingHelperService: LoggingHelperService;

  const mockGenePanelsModel: any = jest
    .fn()
    .mockImplementation((genePanels: GenePanels): GenePanels => {
      return genePanels;
    });
  mockGenePanelsModel.find = jest.fn();

  const mockGenePanelVersionsModel: any = jest
    .fn()
    .mockImplementation(
      (genePanelVersions: GenePanelVersions): GenePanelVersions => {
        return genePanelVersions;
      },
    );
  mockGenePanelVersionsModel.find = jest.fn();

  const mockLoggingHelperService = {
    performanceLogAndFindOneMongo: jest.fn(),
    performanceLogAndSaveMongo: jest.fn(),
    performanceLogAndFindMongo: jest.fn(),
    performanceLogAndDeleteOneMongo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenePanelService,
        {
          provide: getModelToken(GENE_PANEL_MODEL_NAME, COMMON_DATABASE),
          useValue: mockGenePanelsModel,
        },
        {
          provide: getModelToken(
            GENE_PANEL_VERSION_MODEL_NAME,
            COMMON_DATABASE,
          ),
          useValue: mockGenePanelVersionsModel,
        },
        {
          provide: LoggingHelperService,
          useValue: mockLoggingHelperService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    genePanelService = module.get<GenePanelService>(GenePanelService);
    genePanelsModel = module.get<Model<GenePanels>>(
      getModelToken(GENE_PANEL_MODEL_NAME, COMMON_DATABASE),
    );
    loggingHelperService =
      module.get<LoggingHelperService>(LoggingHelperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLatestPanelList', () => {
    it('should return an array of gene panels', async () => {
      const trackNumber = '123';
      const mockGenePanels = [
        {
          id: 'panel1',
          name: 'Panel 1',
          _id: {
            $oid: '653db9766bdfb04a2e8eb123',
            toString: jest.fn().mockReturnValue('653db9766bdfb04a2e8eb123'),
          },
        },
        {
          id: 'panel2',
          name: 'Panel 2',
          _id: {
            $oid: '653db9766bdfb04a2e8eb234',
            toString: jest.fn().mockReturnValue('653db9766bdfb04a2e8eb234'),
          },
        },
      ];
      const expectedResult = mockGenePanels.map(
        (result) => new GenePanel(result as any),
      );

      mockGenePanelsModel.find.mockResolvedValue(mockGenePanels);

      mockLoggingHelperService.performanceLogAndFindOneMongo.mockResolvedValue({
        _id: {
          $oid: '653db9766bdfb04a2e8eb654',
          toString: jest.fn().mockReturnValue('653db9766bdfb04a2e8eb654'),
        },
        version: '1.0.1',
        clingen: '05-05-2023',
        panel_au: '05-05-2023',
        panel_uk: '05-05-2023',
        s_team: '1.0.0',
        create_date: {
          $date: '2023-10-29T01:46:30.912Z',
        },
        __v: 0,
      } as any as GenePanelVersions);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockGenePanelsModel, filters, sort) => {
          mockGenePanelsModel.find(filters, sort);
          return mockGenePanels;
        },
      );

      const result = await genePanelService.getLatestPanelList(
        trackNumber,
        B_TEAM_USERINFO,
      );

      expect(result.genePanels).toEqual(expectedResult);
      expect(genePanelsModel.find).toHaveBeenCalledWith(
        { panel_version: '1.0.1', 'genes.0': { $exists: true } },
        {},
      );
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        genePanelsModel,
        { panel_version: '1.0.1', 'genes.0': { $exists: true } },
        {},
        null,
        null,
        {},
        B_TEAM_USERINFO.preferred_username,
        trackNumber,
        'find_gene_panels',
        COMMON_DATABASE,
      );
    });

    it('should return an array of gene panels with cached result', async () => {
      const trackNumber = '123';
      const mockGenePanels = [
        {
          id: 'panel1',
          name: 'Panel 1',
          _id: {
            $oid: '653db9766bdfb04a2e8eb123',
            toString: jest.fn().mockReturnValue('653db9766bdfb04a2e8eb123'),
          },
        },
        {
          id: 'panel2',
          name: 'Panel 2',
          _id: {
            $oid: '653db9766bdfb04a2e8eb234',
            toString: jest.fn().mockReturnValue('653db9766bdfb04a2e8eb234'),
          },
        },
      ];
      const expectedResult = mockGenePanels.map(
        (result) => new GenePanel(result as any),
      );

      mockGenePanelsModel.find.mockResolvedValue(mockGenePanels);

      mockLoggingHelperService.performanceLogAndFindOneMongo.mockResolvedValue({
        _id: {
          $oid: '653db9766bdfb04a2e8eb654',
          toString: jest.fn().mockReturnValue('653db9766bdfb04a2e8eb654'),
        },
        version: '1.0.1',
        clingen: '05-05-2023',
        panel_au: '05-05-2023',
        panel_uk: '05-05-2023',
        s_team: '1.0.0',
        create_date: {
          $date: '2023-10-29T01:46:30.912Z',
        },
        __v: 0,
      } as any as GenePanelVersions);
      mockCacheManager.get = jest
        .fn()
        .mockResolvedValueOnce({ genePanels: expectedResult });

      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockGenePanelsModel, filters, sort) => {
          mockGenePanelsModel.find(filters, sort);
          return mockGenePanels;
        },
      );

      const result = await genePanelService.getLatestPanelList(
        trackNumber,
        B_TEAM_USERINFO,
      );

      expect(result.genePanels).toEqual(expectedResult);
      expect(genePanelsModel.find).toHaveBeenCalledTimes(0);
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledTimes(0);
    });
  });

  describe('getGenePanelList', () => {
    it('should return an array of gene panels', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
      };
      const filters = {};
      const mockGenePanels = [
        {
          id: 'panel1',
          name: 'Panel 1',
        },
        {
          id: 'panel2',
          name: 'Panel 2',
        },
      ];
      const expectedGenePanels = mockGenePanels;

      mockGenePanelsModel.find.mockResolvedValue(mockGenePanels);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockGenePanelsModel, filters, sort) => {
          mockGenePanelsModel.find(filters, sort);
          return mockGenePanels;
        },
      );

      const result = await genePanelService.getGenePanelList(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedGenePanels);
      expect(genePanelsModel.find).toHaveBeenCalledWith(filters, {});
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        genePanelsModel,
        filters,
        {},
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_gene_panels',
        COMMON_DATABASE,
      );
    });

    it('should return an array of gene panels without any filter', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
      };
      const mockGenePanels = [
        {
          id: 'panel1',
          name: 'Panel 1',
        },
        {
          id: 'panel2',
          name: 'Panel 2',
        },
      ];
      const expectedGenePanels = mockGenePanels;

      mockGenePanelsModel.find.mockResolvedValue(mockGenePanels);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockGenePanelsModel, filters, sort) => {
          mockGenePanelsModel.find(filters, sort);
          return mockGenePanels;
        },
      );

      const result = await genePanelService.getGenePanelList(
        trackNumber,
        userInfo,
      );

      expect(result).toEqual(expectedGenePanels);
      expect(genePanelsModel.find).toHaveBeenCalledWith({}, {});
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        genePanelsModel,
        {},
        {},
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_gene_panels',
        COMMON_DATABASE,
      );
    });

    it('should return an empty array if no gene panels are found', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
      };
      const filters = {};
      const mockGenePanels: GenePanels[] = [];
      const expectedGenePanels: GenePanels[] = [];

      mockGenePanelsModel.find.mockResolvedValue(mockGenePanels);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockGenePanelsModel, filters, sort) => {
          mockGenePanelsModel.find(filters, sort);
          return mockGenePanels;
        },
      );

      const result = await genePanelService.getGenePanelList(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedGenePanels);
      expect(genePanelsModel.find).toHaveBeenCalledWith(filters, {});
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        genePanelsModel,
        filters,
        {},
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_gene_panels',
        COMMON_DATABASE,
      );
    });
  });
});
