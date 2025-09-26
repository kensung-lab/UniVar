import { Test, TestingModule } from '@nestjs/testing';
import { LoggingHelperService } from 'src/utils';
import { Model } from 'mongoose';
import {
  DatabaseFilter,
  DatabaseData,
  COMMON_DATABASE,
  SUPER_GROUP,
  QueryRequest,
  CustomException,
  DatabaseInfo,
} from 'src/common';
import { DATABASE_MODEL_NAME, Databases } from 'src/applicationInfo/schemas';
import { getModelToken } from '@nestjs/mongoose';
import { DatabaseService } from 'src/applicationInfo';
import {
  B_TEAM_USERINFO,
  S_TEAM_USERINFO,
  mockCacheManager,
} from '../../../mock';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ObjectId } from 'mongodb';

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let databasesModel: Model<Databases>;
  let loggingHelperService: LoggingHelperService;

  const mockDatabasesModel: any = jest
    .fn()
    .mockImplementation((databases: Databases): Databases => {
      return databases;
    });
  mockDatabasesModel.find = jest.fn();

  const mockLoggingHelperService = {
    performanceLogAndFindOneMongo: jest.fn(),
    performanceLogAndSaveMongo: jest.fn(),
    performanceLogAndFindMongo: jest.fn(),
    performanceLogAndDeleteOneMongo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: getModelToken(DATABASE_MODEL_NAME, COMMON_DATABASE),
          useValue: mockDatabasesModel,
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

    databaseService = module.get<DatabaseService>(DatabaseService);
    databasesModel = module.get<Model<Databases>>(
      getModelToken(DATABASE_MODEL_NAME, COMMON_DATABASE),
    );
    loggingHelperService =
      module.get<LoggingHelperService>(LoggingHelperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findDatabaseList', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return an array of database data', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
        group: ['steam'],
      };
      const filters: DatabaseFilter = {};
      const mockDatabases = [
        {
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        },
        {
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        },
      ];
      const expectedDatabaseData = [
        new DatabaseData(<any>{
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        }),
        new DatabaseData(<any>{
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        }),
      ];

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );
      // .mockResolvedValue(mockDatabases);

      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedDatabaseData);
      expect(databasesModel.find).toHaveBeenCalledWith({
        access_group: {
          $in: ['default', 'user'],
        },
        is_ready: true,
      });
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          access_group: {
            $in: ['default', 'user'],
          },
          is_ready: true,
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_databases',
        COMMON_DATABASE,
      );
    });

    it('should return an array of database data with normal user group', async () => {
      const trackNumber = '123';
      const userInfo = S_TEAM_USERINFO;
      const filters: DatabaseFilter = {};
      const mockDatabases = [
        {
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        },
        {
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        },
      ];
      const expectedDatabaseData = [
        new DatabaseData(<any>{
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        }),
        new DatabaseData(<any>{
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        }),
      ];

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );
      // .mockResolvedValue(mockDatabases);

      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedDatabaseData);
      expect(databasesModel.find).toHaveBeenCalledWith({
        access_group: {
          $in: ['default', 'univar-test02'],
        },
        is_ready: true,
      });
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          access_group: {
            $in: ['default', 'univar-test02'],
          },
          is_ready: true,
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_databases',
        COMMON_DATABASE,
      );
    });

    it('should return an array of database data with cache', async () => {
      const trackNumber = '123';
      const userInfo = S_TEAM_USERINFO;
      const filters: DatabaseFilter = {};
      const mockDatabases = [
        {
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        },
        {
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        },
      ];
      const expectedDatabaseData = [
        new DatabaseData(<any>{
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        }),
        new DatabaseData(<any>{
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        }),
      ];

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );
      // .mockResolvedValue(mockDatabases);
      mockCacheManager.get = jest
        .fn()
        .mockResolvedValueOnce(expectedDatabaseData);

      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedDatabaseData);
    });

    it('should return an empty array if no databases are found', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
        group: ['/group1', '/group2'],
      };
      const filters: DatabaseFilter = {};
      const mockDatabases: Databases[] = [];
      const expectedDatabaseData: DatabaseData[] = [];

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );
      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedDatabaseData);
      expect(databasesModel.find).toHaveBeenCalledWith({
        access_group: {
          $in: ['default', 'user'],
        },
        is_ready: true,
      });
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          access_group: {
            $in: ['default', 'user'],
          },
          is_ready: true,
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_databases',
        COMMON_DATABASE,
      );
    });

    it('should return an empty array if user doesnot have group', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
        group: [],
      };
      const filters: DatabaseFilter = {};
      const mockDatabases: Databases[] = [];
      const expectedDatabaseData: DatabaseData[] = [];

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );
      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
        filters,
      );

      expect(result).toEqual(expectedDatabaseData);
      expect(databasesModel.find).toHaveBeenCalledWith({
        access_group: {
          $in: ['default', 'user'],
        },
        is_ready: true,
      });
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          access_group: {
            $in: ['default', 'user'],
          },
          is_ready: true,
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_databases',
        COMMON_DATABASE,
      );
    });

    it('should return an array of database data with default filters', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
        group: ['/group1', '/group2'],
      };
      const mockDatabases = [
        {
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['group2'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        },
        {
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['group1'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        },
      ];
      const expectedDatabaseData = [
        new DatabaseData(<any>{
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['group2'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        }),
        new DatabaseData(<any>{
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['group1'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        }),
      ];

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );

      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
      );

      expect(result).toEqual(expectedDatabaseData);
      expect(databasesModel.find).toHaveBeenCalledWith({
        access_group: {
          $in: ['default', 'user'],
        },
        is_ready: true,
      });
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          access_group: {
            $in: ['default', 'user'],
          },
          is_ready: true,
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_databases',
        COMMON_DATABASE,
      );
    });

    it('should return an array of database data with all data', async () => {
      const trackNumber = '123';
      const userInfo = {
        preferred_username: 'user',
        group: [SUPER_GROUP],
      };
      const mockDatabases = [
        {
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['group2'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        },
        {
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['group1'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        },
      ];
      const expectedDatabaseData = [
        new DatabaseData(<any>{
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['group2'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        }),
        new DatabaseData(<any>{
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['group1'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        }),
      ];

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );

      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
      );

      expect(result).toEqual(expectedDatabaseData);
      expect(databasesModel.find).toHaveBeenCalledWith({
        access_group: {
          $in: ['default', 'user'],
        },
        is_ready: true,
      });
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          access_group: {
            $in: ['default', 'user'],
          },
          is_ready: true,
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_databases',
        COMMON_DATABASE,
      );
    });

    it('should return all database data for that user', async () => {
      const trackNumber = '123';
      const userInfo = S_TEAM_USERINFO;
      const filters: DatabaseFilter = {};
      const mockDatabases = [
        {
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        },
        {
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        },
      ];
      const expectedDatabaseData = [
        new DatabaseData(<any>{
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
        }),
        new DatabaseData(<any>{
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: true,
        }),
      ];

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );
      // .mockResolvedValue(mockDatabases);

      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
        filters,
        false,
      );

      expect(result).toEqual(expectedDatabaseData);
      expect(databasesModel.find).toHaveBeenCalledWith({
        access_group: {
          $in: ['default', 'univar-test02'],
        },
        is_ready: true,
      });
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          access_group: {
            $in: ['default', 'univar-test02'],
          },
          is_ready: true,
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_databases',
        COMMON_DATABASE,
      );
    });

    it('should return pending database data', async () => {
      const trackNumber = '123';
      const userInfo = S_TEAM_USERINFO;
      const filters: DatabaseFilter = {};
      const mockDatabases = [
        {
          _id: {
            $oid: '6492c7fb3bccb6bcf53d641c',
          },
          create_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          modify_time: {
            $date: '2023-06-21T09:50:51.920Z',
          },
          samples: [
            {
              ID: 'B0000851B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'B0000852B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
            {
              ID: 'B0000853B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'B0000851B01-001-LIB1',
              Father: 'B0000852B01-001-LIB1',
              Mother: 'B0000853B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'B0000851B01-001-LIB1_trio_20230105-110345',
          display_name:
            'B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1_20230105-110345',
          is_ready: true,
          tool_complete_infos: [
            {
              tool_name: 'vcf2db',
              completed_time: {
                $date: '2023-10-21T01:55:04.778Z',
              },
              spent_time: 560.9415051937103,
            },
            {
              tool_name: 'sv2mongo',
              completed_time: {
                $date: '2023-10-21T01:55:34.219Z',
              },
              spent_time: 25.428768396377563,
              inserted_variant: 462,
              source: 'cnvkit',
            },
            {
              tool_name: 'sv2mongo',
              completed_time: {
                $date: '2023-10-21T02:00:44.584Z',
              },
              spent_time: 306.68284940719604,
              inserted_variant: 13594,
              source: 'reformat',
            },
          ],
        } as any as Databases,
        {
          _id: {
            $oid: '6494e28235218c66439ae4f6',
          },
          create_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          modify_time: {
            $date: '2023-06-23T00:08:34.612Z',
          },
          samples: [
            {
              ID: 'C0000770B01-001-LIB1',
              Sex: 'Female',
              Phenotype: 'Affected',
              type: 'sample',
            },
            {
              ID: 'C0000771B01-001-LIB1',
              Sex: 'Male',
              Phenotype: 'Unaffected',
              type: 'sample',
            },
          ],
          pedigree: [
            {
              Child: 'C0000770B01-001-LIB1',
              Father: 'C0000771B01-001-LIB1',
              type: 'pedigree',
            },
          ],
          access_group: ['steam'],
          database_name: 'C0000770B01-001-LIB1_duopat_20230105-152056',
          display_name:
            'C0000770B01-001-LIB1_duopat_C0000771B01-001-LIB1_20230105-152056',
          is_ready: false,
        } as any as Databases,
      ];
      const expectedDatabaseData = mockDatabases.map((database: Databases) => {
        return new DatabaseInfo(database);
      });

      mockDatabasesModel.find.mockResolvedValue(mockDatabases);
      mockLoggingHelperService.performanceLogAndFindMongo.mockImplementation(
        (mockDatabasesModel, filters) => {
          mockDatabasesModel.find(filters);
          return mockDatabases;
        },
      );
      // .mockResolvedValue(mockDatabases);

      const result = await databaseService.findDatabaseList(
        trackNumber,
        userInfo,
        filters,
        true,
      );

      const expected_access_group = {
        $in: ['univar-test02'],
      };

      expect(result).toEqual(expectedDatabaseData);
      expect(databasesModel.find).toHaveBeenCalledWith({
        access_group: expected_access_group,
      });
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          access_group: expected_access_group,
        },
        {
          create_time: -1,
        },
        null,
        null,
        {},
        userInfo.preferred_username,
        trackNumber,
        'find_databases',
        COMMON_DATABASE,
      );
    });
  });

  describe('getCallersByDatabase', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return an array of callers', async () => {
      const queryRequest: QueryRequest = {
        track_number: '123',
        selected_database: '234',
      };
      const mockDatabases: Databases[] = [
        {
          _id: new ObjectId('656991bce85c55ac4afc0d1f'),
          samples: {
            detail: [
              {
                sample_id: 'A0000607B01-001-LIB1',
                index: 0,
                has_father: false,
                has_mother: false,
                sex: '1',
                family_id: 'P0000607',
                phenotype: '2',
                info: 'proband',
              },
            ],
            has_father: false,
            has_mother: false,
            sample_id: ['A0000607B01-001-LIB1'],
            proband: {
              sample_id: 'A0000607B01-001-LIB1',
              index: 0,
              has_father: false,
              has_mother: false,
              sex: '1',
              family_id: 'P0000607',
              phenotype: '2',
              info: 'proband',
            },
          },
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          create_time: {
            $date: '2023-12-01T07:56:44.241Z',
          },
          modify_time: {
            $date: '2023-12-01T07:57:36.110Z',
          },
          is_ready: true,
          access_group: ['development'],
          tool_complete_infos: [
            {
              tool_name: 'SNPVCF2JSON',
              tool_version: '1.0.0',
              completed_time: new Date(),
              spent_time: 175.79712104797363,
            },
            {
              tool_name: 'SVJSON2JSON',
              tool_version: '1.0.0',
              completed_time: new Date(),
              spent_time: 12.489380359649658,
              source: 'cnvkit',
            },
            {
              tool_name: 'SVJSON2JSON',
              tool_version: '1.0.0',
              completed_time: new Date(),
              spent_time: 30.699636697769165,
              source: 'reformat',
            },
          ],
        } as any,
      ];

      const expectedResult = ['cnvkit', 'reformat'];

      mockLoggingHelperService.performanceLogAndFindMongo.mockResolvedValue(
        mockDatabases,
      );

      const result = await databaseService.getCallersByDatabase(
        queryRequest,
        B_TEAM_USERINFO,
      );

      expect(result).toEqual(expectedResult);
      expect(
        mockLoggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          database_name: '234',
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        B_TEAM_USERINFO.preferred_username,
        queryRequest.track_number,
        'get_callers_by_database',
        COMMON_DATABASE,
      );
    });

    it('should throw exception', async () => {
      const queryRequest: QueryRequest = {
        track_number: '123',
        selected_database: '234',
      };

      mockLoggingHelperService.performanceLogAndFindMongo.mockResolvedValue(
        undefined,
      );

      await expect(
        databaseService.getCallersByDatabase(queryRequest, B_TEAM_USERINFO),
      ).rejects.toThrow(CustomException);
      expect(
        mockLoggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        databasesModel,
        {
          database_name: '234',
        },
        {
          display_name: 1,
        },
        null,
        null,
        {},
        B_TEAM_USERINFO.preferred_username,
        queryRequest.track_number,
        'get_callers_by_database',
        COMMON_DATABASE,
      );
    });
  });
});
