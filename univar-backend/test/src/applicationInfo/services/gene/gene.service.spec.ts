import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import { getModelToken } from '@nestjs/mongoose';
import {
  GeneService,
  VERSIONS_MODEL_NAME,
  Versions,
} from 'src/applicationInfo';
import { GENE_DATABASE } from 'src/common';

describe('GeneService', () => {
  let geneService: GeneService;
  let versionsModel: Model<Versions>;
  let loggingHelperService: LoggingHelperService;

  const mockVersionsModel: any = jest
    .fn()
    .mockImplementation((versions: Versions): Versions => {
      return versions;
    });
  mockVersionsModel.find = jest.fn();
  mockVersionsModel.findOne = jest.fn();

  const mockLoggingHelperService = {
    performanceLogAndFindOneMongo: jest.fn(),
    performanceLogAndSaveMongo: jest.fn(),
    performanceLogAndFindMongo: jest.fn(),
    performanceLogAndDeleteOneMongo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneService,
        {
          provide: getModelToken(VERSIONS_MODEL_NAME, GENE_DATABASE),
          useValue: mockVersionsModel,
        },
        {
          provide: LoggingHelperService,
          useValue: mockLoggingHelperService,
        },
      ],
    }).compile();

    geneService = module.get<GeneService>(GeneService);
    versionsModel = module.get<Model<Versions>>(
      getModelToken(VERSIONS_MODEL_NAME, GENE_DATABASE),
    );
    loggingHelperService =
      module.get<LoggingHelperService>(LoggingHelperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findVersion', () => {
    it('should return a version of the gene database', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
      };
      const filters = {};
      const mockVersion = {
        id: 'version1',
        name: 'Version 1',
      };
      const expectedVersion = mockVersion;

      mockVersionsModel.findOne.mockResolvedValue(mockVersion);
      mockLoggingHelperService.performanceLogAndFindOneMongo.mockImplementation(
        (mockVersionsModel, filters, sort) => {
          mockVersionsModel.findOne(filters, sort);
          return mockVersion;
        },
      );

      const result = await geneService.findVersion(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedVersion);
      expect(versionsModel.findOne).toHaveBeenCalledWith(filters, {});
      expect(
        loggingHelperService.performanceLogAndFindOneMongo,
      ).toHaveBeenCalledWith(
        versionsModel,
        filters,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_detail_version_gene_db',
        GENE_DATABASE,
      );
    });

    it('should return a version of the gene database without filter', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
      };
      const mockVersion = {
        id: 'version1',
        name: 'Version 1',
      };
      const expectedVersion = mockVersion;

      mockVersionsModel.findOne.mockResolvedValue(mockVersion);
      mockLoggingHelperService.performanceLogAndFindOneMongo.mockImplementation(
        (mockVersionsModel, filters, sort) => {
          mockVersionsModel.findOne(filters, sort);
          return mockVersion;
        },
      );

      const result = await geneService.findVersion(trackNumber, userInfo);

      expect(result).toEqual(expectedVersion);
      expect(versionsModel.findOne).toHaveBeenCalledWith({}, {});
      expect(
        loggingHelperService.performanceLogAndFindOneMongo,
      ).toHaveBeenCalledWith(
        versionsModel,
        {},
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_detail_version_gene_db',
        GENE_DATABASE,
      );
    });

    it('should return null if no version are found', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
      };
      const filters = {};
      const mockVersion: Versions = null;
      const expectedVersion: Versions = null;

      mockVersionsModel.findOne.mockResolvedValue(mockVersion);
      mockLoggingHelperService.performanceLogAndFindOneMongo.mockImplementation(
        (mockVersionsModel, filters, sort) => {
          mockVersionsModel.findOne(filters, sort);
          return mockVersion;
        },
      );
      const result = await geneService.findVersion(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedVersion);
      expect(versionsModel.findOne).toHaveBeenCalledWith(filters, {});
      expect(
        loggingHelperService.performanceLogAndFindOneMongo,
      ).toHaveBeenCalledWith(
        versionsModel,
        filters,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_detail_version_gene_db',
        GENE_DATABASE,
      );
    });
  });
});
