import { AgendaService } from 'src/agenda';
import { GenePanelService } from 'src/applicationInfo';
import {
  B_TEAM_USERINFO,
  S_TEAM_USERINFO,
  mockConnection,
  mockDatabaseService,
  mockLoggingHelperService,
  mockModel,
  mockS3Service,
  mockVariants1,
} from '../../mock';
import * as VariantCommon from 'src/common/functions/variants-common';
import * as Functions from 'src/common/functions/common';
import { Agenda } from '@hokify/agenda';
jest.mock('@hokify/agenda');

describe('AgendaService', () => {
  let agendaService: AgendaService;

  beforeEach(() => {
    (<any>Agenda).mockClear();
    // Mock dependencies
    const genePanelServiceMock: GenePanelService = jest.fn() as any;

    agendaService = new AgendaService(
      mockModel as any,
      mockLoggingHelperService as any,
      mockDatabaseService as any,
      genePanelServiceMock,
      mockS3Service as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of AgendaService', () => {
    expect(agendaService).toBeInstanceOf(AgendaService);
  });

  it('exportTsv: should export TSV and upload it to S3', async () => {
    // Mock necessary variables and dependencies for the test
    const job = {
      attrs: {
        data: {
          exportRequest: {
            track_number: '123',
            selected_database: 'test_db',
            filter: {},
            panels: [],
            samples: [],
          },
          userInfo: S_TEAM_USERINFO,
        },
      },
    } as any;
    const done = jest.fn();

    // Mock necessary function calls and dependencies
    const checkSelectedDatabaseExistMock = jest.spyOn(
      VariantCommon,
      'checkSelectedDatabaseExist',
    );
    checkSelectedDatabaseExistMock.mockResolvedValue(undefined);

    const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
    getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);

    const filterModifierMock = jest.spyOn(VariantCommon, 'filterModifier');
    filterModifierMock.mockResolvedValue({});

    (<any>(
      mockLoggingHelperService.performanceLogAndCountMongo
    )).mockResolvedValue(300000);
    (<any>(
      mockLoggingHelperService.performanceLogAndFindMongo
    )).mockResolvedValue([
      {
        toJSON: jest.fn().mockReturnValue({}),
      },
    ]);
    (<any>(
      mockLoggingHelperService.performanceLogAndSaveMongo
    )).mockResolvedValue(undefined);
    (<any>mockS3Service.uploadToS3).mockResolvedValue(undefined);

    // Call the exportTsv method
    await agendaService.exportTsv(job, done);

    // Assert that the necessary functions and dependencies were called
    expect(checkSelectedDatabaseExistMock).toHaveBeenCalledTimes(1);
    expect(getDatabaseNModelMock).toHaveBeenCalledTimes(1);
    expect(filterModifierMock).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndCountMongo,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindMongo,
    ).toHaveBeenCalledTimes(20);
    expect(mockS3Service.uploadToS3).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndSaveMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockConnection.destroy).toHaveBeenCalledTimes(1);

    // Assert that the done function was called
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('exportTsv: should export TSV and upload it to S3 with values', async () => {
    // Mock necessary variables and dependencies for the test
    const job = {
      attrs: {
        data: {
          exportRequest: {
            track_number: '123',
            selected_database: 'test_db',
            filter: {},
            panels: [],
            samples: [
              {
                i: 0,
                name: 'sample1',
                sample_id: 1,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: 'sample3',
                father_id: 'sample2',
                sex: 'F',
                phenotype: '2',
                group: 'affected',
                active: true,
              },
              {
                i: 1,
                name: 'sample2',
                sample_id: 2,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'M',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
              {
                i: 2,
                name: 'sample3',
                sample_id: 3,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'F',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
            ],
            columns: { samples_genotypes: 1, location: 1, chrom: 1 },
          },
          userInfo: S_TEAM_USERINFO,
        },
      },
    } as any;
    const done = jest.fn();

    // Mock necessary function calls and dependencies
    const checkSelectedDatabaseExistMock = jest.spyOn(
      VariantCommon,
      'checkSelectedDatabaseExist',
    );
    checkSelectedDatabaseExistMock.mockResolvedValue(undefined);

    const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
    getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);

    const filterModifierMock = jest.spyOn(VariantCommon, 'filterModifier');
    filterModifierMock.mockResolvedValue({});

    (<any>(
      mockLoggingHelperService.performanceLogAndCountMongo
    )).mockResolvedValue(10);
    (<any>(
      mockLoggingHelperService.performanceLogAndFindMongo
    )).mockResolvedValue([
      {
        toJSON: jest.fn().mockReturnValue({}),
      },
    ]);
    (<any>(
      mockLoggingHelperService.performanceLogAndSaveMongo
    )).mockResolvedValue(undefined);
    (<any>mockS3Service.uploadToS3).mockResolvedValue(undefined);

    // Call the exportTsv method
    await agendaService.exportTsv(job, done);

    // Assert that the necessary functions and dependencies were called
    expect(checkSelectedDatabaseExistMock).toHaveBeenCalledTimes(1);
    expect(getDatabaseNModelMock).toHaveBeenCalledTimes(1);
    expect(filterModifierMock).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndCountMongo,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockS3Service.uploadToS3).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndSaveMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockConnection.destroy).toHaveBeenCalledTimes(1);

    // Assert that the done function was called
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('exportTsv: should reject and log errors', async () => {
    // Mock necessary variables and dependencies for the test
    const job = {
      attrs: {
        data: {
          exportRequest: {
            track_number: '123',
            selected_database: 'test_db',
            filter: {},
            panels: [],
            samples: [
              {
                i: 0,
                name: 'sample1',
                sample_id: 1,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: 'sample3',
                father_id: 'sample2',
                sex: 'F',
                phenotype: '2',
                group: 'affected',
                active: true,
              },
              {
                i: 1,
                name: 'sample2',
                sample_id: 2,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'M',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
              {
                i: 2,
                name: 'sample3',
                sample_id: 3,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'F',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
            ],
            columns: { samples_genotypes: 1, location: 1, chrom: 1 },
          },
          userInfo: S_TEAM_USERINFO,
        },
      },
    } as any;
    const done = jest.fn();

    // Mock necessary function calls and dependencies
    const checkSelectedDatabaseExistMock = jest.spyOn(
      VariantCommon,
      'checkSelectedDatabaseExist',
    );
    checkSelectedDatabaseExistMock.mockResolvedValue(undefined);

    const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
    getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);

    const filterModifierMock = jest.spyOn(VariantCommon, 'filterModifier');
    filterModifierMock.mockResolvedValue({});

    (<any>(
      mockLoggingHelperService.performanceLogAndCountMongo
    )).mockResolvedValue(10);
    (<any>(
      mockLoggingHelperService.performanceLogAndFindMongo
    )).mockResolvedValue([
      {
        toJSON: jest.fn().mockReturnValue({}),
      },
    ]);
    (<any>(
      mockLoggingHelperService.performanceLogAndSaveMongo
    )).mockRejectedValue(new Error());
    (<any>mockS3Service.uploadToS3).mockResolvedValue(undefined);

    // Call the exportTsv method
    await agendaService.exportTsv(job, done);

    // Assert that the necessary functions and dependencies were called
    expect(checkSelectedDatabaseExistMock).toHaveBeenCalledTimes(1);
    expect(getDatabaseNModelMock).toHaveBeenCalledTimes(1);
    expect(filterModifierMock).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndCountMongo,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockS3Service.uploadToS3).toHaveBeenCalledTimes(1);
    expect(mockConnection.destroy).toHaveBeenCalledTimes(1);
    expect(mockLoggingHelperService.errorLog).toHaveBeenCalledTimes(1);

    // Assert that the done function was called
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('exportVcf: should export VCF and upload it to S3', async () => {
    // Mock necessary variables and dependencies for the test
    const job = {
      attrs: {
        data: {
          exportRequest: {
            track_number: '123',
            selected_database: 'test_db',
            filter: {},
            panels: [],
            samples: [],
            columns: {},
          },
          userInfo: S_TEAM_USERINFO,
        },
      },
    } as any;
    const done = jest.fn();

    // Mock necessary function calls and dependencies
    const checkSelectedDatabaseExistMock = jest.spyOn(
      VariantCommon,
      'checkSelectedDatabaseExist',
    );
    checkSelectedDatabaseExistMock.mockResolvedValue(undefined);

    const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
    getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);

    const filterModifierMock = jest.spyOn(VariantCommon, 'filterModifier');
    filterModifierMock.mockResolvedValue({});
    (<any>(
      mockLoggingHelperService.performanceLogAndFindOneMongo
    )).mockResolvedValue({
      vcf_header: '123',
    });
    (<any>(
      mockLoggingHelperService.performanceLogAndFindMongo
    )).mockResolvedValue([
      {
        toJSON: jest.fn().mockReturnValue({}),
      },
    ]);
    (<any>(
      mockLoggingHelperService.performanceLogAndSaveMongo
    )).mockResolvedValue(undefined);
    (<any>mockS3Service.uploadToS3).mockResolvedValue(undefined);

    // Call the exportTsv method
    await agendaService.exportVcf(job, done);

    // Assert that the necessary functions and dependencies were called
    expect(checkSelectedDatabaseExistMock).toHaveBeenCalledTimes(1);
    expect(getDatabaseNModelMock).toHaveBeenCalledTimes(2);
    expect(filterModifierMock).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindOneMongo,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockS3Service.uploadToS3).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndSaveMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockConnection.destroy).toHaveBeenCalledTimes(1);

    // Assert that the done function was called
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('exportVcf: should export VCF and upload it to S3 with values', async () => {
    // Mock necessary variables and dependencies for the test
    const job = {
      attrs: {
        data: {
          exportRequest: {
            track_number: '123',
            selected_database: 'test_db',
            filter: {},
            panels: [],
            samples: [
              {
                i: 0,
                name: 'sample1',
                sample_id: 1,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: 'sample3',
                father_id: 'sample2',
                sex: 'F',
                phenotype: '2',
                group: 'affected',
                active: true,
              },
              {
                i: 1,
                name: 'sample2',
                sample_id: 2,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'M',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
              {
                i: 2,
                name: 'sample3',
                sample_id: 3,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'F',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
            ],
            columns: { samples_genotypes: 1, location: 1, chrom: 1 },
          },
          userInfo: S_TEAM_USERINFO,
        },
      },
    } as any;
    const done = jest.fn();

    // Mock necessary function calls and dependencies
    const checkSelectedDatabaseExistMock = jest.spyOn(
      VariantCommon,
      'checkSelectedDatabaseExist',
    );
    checkSelectedDatabaseExistMock.mockResolvedValue(undefined);

    const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
    getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);

    const filterModifierMock = jest.spyOn(VariantCommon, 'filterModifier');
    filterModifierMock.mockResolvedValue({});
    (<any>(
      mockLoggingHelperService.performanceLogAndFindOneMongo
    )).mockResolvedValue({
      vcf_header: '123',
    });
    mockVariants1.genotypes_index[0] = [null, null];
    (<any>(
      mockLoggingHelperService.performanceLogAndFindMongo
    )).mockResolvedValue([mockVariants1]);
    (<any>(
      mockLoggingHelperService.performanceLogAndSaveMongo
    )).mockResolvedValue(undefined);
    (<any>mockS3Service.uploadToS3).mockResolvedValue(undefined);

    // Call the exportTsv method
    await agendaService.exportVcf(job, done);

    // Assert that the necessary functions and dependencies were called
    expect(checkSelectedDatabaseExistMock).toHaveBeenCalledTimes(1);
    expect(getDatabaseNModelMock).toHaveBeenCalledTimes(2);
    expect(filterModifierMock).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindOneMongo,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockS3Service.uploadToS3).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndSaveMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockConnection.destroy).toHaveBeenCalledTimes(1);

    // Assert that the done function was called
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('exportVcf: should export empty vcf file', async () => {
    // Mock necessary variables and dependencies for the test
    const job = {
      attrs: {
        data: {
          exportRequest: {
            track_number: '123',
            selected_database: 'test_db',
            filter: {},
            panels: [],
            samples: [
              {
                i: 0,
                name: 'sample1',
                sample_id: 1,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: 'sample3',
                father_id: 'sample2',
                sex: 'F',
                phenotype: '2',
                group: 'affected',
                active: true,
              },
              {
                i: 1,
                name: 'sample2',
                sample_id: 2,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'M',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
              {
                i: 2,
                name: 'sample3',
                sample_id: 3,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'F',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
            ],
            columns: { samples_genotypes: 1, location: 1, chrom: 1 },
          },
          userInfo: S_TEAM_USERINFO,
        },
      },
    } as any;
    const done = jest.fn();

    // Mock necessary function calls and dependencies
    const checkSelectedDatabaseExistMock = jest.spyOn(
      VariantCommon,
      'checkSelectedDatabaseExist',
    );
    checkSelectedDatabaseExistMock.mockResolvedValue(undefined);

    const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
    getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);

    const filterModifierMock = jest.spyOn(VariantCommon, 'filterModifier');
    filterModifierMock.mockResolvedValue({});
    (<any>(
      mockLoggingHelperService.performanceLogAndFindOneMongo
    )).mockResolvedValue(undefined);
    (<any>(
      mockLoggingHelperService.performanceLogAndFindMongo
    )).mockResolvedValue([mockVariants1]);
    (<any>(
      mockLoggingHelperService.performanceLogAndSaveMongo
    )).mockResolvedValue(undefined);
    (<any>mockS3Service.uploadToS3).mockResolvedValue(undefined);

    // Call the exportTsv method
    await agendaService.exportVcf(job, done);

    // Assert that the necessary functions and dependencies were called
    expect(checkSelectedDatabaseExistMock).toHaveBeenCalledTimes(1);
    expect(getDatabaseNModelMock).toHaveBeenCalledTimes(2);
    expect(filterModifierMock).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindOneMongo,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindMongo,
    ).toHaveBeenCalledTimes(0);
    expect(mockS3Service.uploadToS3).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndSaveMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockConnection.destroy).toHaveBeenCalledTimes(1);

    // Assert that the done function was called
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('exportVcf: should reject and log errors', async () => {
    // Mock necessary variables and dependencies for the test
    const job = {
      attrs: {
        data: {
          exportRequest: {
            track_number: '123',
            selected_database: 'test_db',
            filter: {},
            panels: [],
            samples: [
              {
                i: 0,
                name: 'sample1',
                sample_id: 1,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: 'sample3',
                father_id: 'sample2',
                sex: 'F',
                phenotype: '2',
                group: 'affected',
                active: true,
              },
              {
                i: 1,
                name: 'sample2',
                sample_id: 2,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'M',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
              {
                i: 2,
                name: 'sample3',
                sample_id: 3,
                family_id: 'family_trio_20230105-110345-1',
                mother_id: '-9',
                father_id: '-9',
                sex: 'F',
                phenotype: '1',
                group: 'not_affected',
                active: true,
              },
            ],
            columns: { samples_genotypes: 1, location: 1, chrom: 1 },
          },
          userInfo: S_TEAM_USERINFO,
        },
      },
    } as any;
    const done = jest.fn();

    // Mock necessary function calls and dependencies
    const checkSelectedDatabaseExistMock = jest.spyOn(
      VariantCommon,
      'checkSelectedDatabaseExist',
    );
    checkSelectedDatabaseExistMock.mockResolvedValue(undefined);

    const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
    getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);

    const filterModifierMock = jest.spyOn(VariantCommon, 'filterModifier');
    filterModifierMock.mockResolvedValue(undefined);
    (<any>(
      mockLoggingHelperService.performanceLogAndFindOneMongo
    )).mockResolvedValue({});
    (<any>(
      mockLoggingHelperService.performanceLogAndFindMongo
    )).mockResolvedValue([mockVariants1]);
    (<any>(
      mockLoggingHelperService.performanceLogAndSaveMongo
    )).mockRejectedValue(new Error());
    (<any>mockS3Service.uploadToS3).mockResolvedValue(undefined);

    // Call the exportTsv method
    await agendaService.exportVcf(job, done);

    // Assert that the necessary functions and dependencies were called
    expect(checkSelectedDatabaseExistMock).toHaveBeenCalledTimes(1);
    expect(getDatabaseNModelMock).toHaveBeenCalledTimes(2);
    expect(filterModifierMock).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindOneMongo,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndFindMongo,
    ).toHaveBeenCalledTimes(0);
    expect(mockS3Service.uploadToS3).toHaveBeenCalledTimes(1);
    expect(
      mockLoggingHelperService.performanceLogAndSaveMongo,
    ).toHaveBeenCalledTimes(1);
    expect(mockLoggingHelperService.errorLog).toHaveBeenCalledTimes(1);
    expect(mockConnection.destroy).toHaveBeenCalledTimes(1);

    // Assert that the done function was called
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('getExportResult: should able to get export result', async () => {
    const expectedResult = { test: 123 };
    (<any>(
      mockLoggingHelperService.performanceLogAndFindOneMongo
    )).mockResolvedValue(expectedResult);

    // Call the exportTsv method
    const result = await agendaService.getExportResult(
      'vcf',
      '123',
      '234',
      B_TEAM_USERINFO,
    );

    // Assert that the necessary functions and dependencies were called
    expect(
      mockLoggingHelperService.performanceLogAndFindOneMongo,
    ).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });

  it('deleteExportResult: should able to delete export result', async () => {
    const expectedResult = { test: 123 };
    (<any>(
      mockLoggingHelperService.performanceLogAndDeleteOneMongo
    )).mockResolvedValue(expectedResult);

    // Call the exportTsv method
    const result = await agendaService.deleteExportResult(
      '123',
      '234',
      B_TEAM_USERINFO,
    );

    // Assert that the necessary functions and dependencies were called
    expect(
      mockLoggingHelperService.performanceLogAndDeleteOneMongo,
    ).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });
});
