import { Test, TestingModule } from '@nestjs/testing';
import { AppLogger, LoggingHelperService, LoggingService } from 'src/utils';
import { CustomException } from 'src/common';
import * as Functions from 'src/common/functions/common';
import { PipelineVersion, PipelineVersionService } from 'src/applicationInfo';
import { mockConnection } from '../../../mock';

describe('PipelineVersionService', () => {
  let service: PipelineVersionService;
  const mockPipelineVersionModel: any = jest.fn();
  const mockLoggingHelperService = {
    performanceLogAndFindOneMongo: jest.fn(),
    performanceLogAndSaveMongo: jest.fn(),
    performanceLogAndFindMongo: jest.fn(),
    performanceLogAndDeleteOneMongo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineVersionService,
        LoggingService,
        AppLogger,
        {
          provide: LoggingHelperService,
          useValue: mockLoggingHelperService,
        },
        {
          provide: 'commonConnection/PipelineVersionModel',
          useValue: mockPipelineVersionModel,
        },
        {
          provide: 'loggingConnection/LogsModel',
          useValue: jest.fn(),
        },
        {
          provide: 'loggingConnection/ErrorLogsModel',
          useValue: jest.fn(),
        },
      ],
    }).compile();

    service = module.get<PipelineVersionService>(PipelineVersionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPipelineInfo', () => {
    const trackNumber = '123';
    const selectedDatabase = 'database';
    const userInfo = { preferred_username: 'user' };

    const mockSortFunction = jest.fn().mockReturnValue({
      exec: jest.fn(),
    });
    const mockFindOne = jest.fn().mockReturnValue({
      sort: mockSortFunction,
    });

    mockPipelineVersionModel.findOne = mockFindOne;
    const pipelineVersionModel = jest.fn().mockImplementation(() => {
      return {
        findOne: mockFindOne,
      };
    });

    const commonInfoDatabaseMock = [mockConnection, {}];
    (<any>commonInfoDatabaseMock[1]).findOne = mockFindOne;
    const resultMock: PipelineVersion = {
      version: '1.0.1',
      small_variant: {
        version: '1.0.1',
        tools: {
          MANE: '1.1',
          VEP: '110',
          exomiser: '12.1.0',
          'variant-import-tool': '1.0.0',
        },
        dbs: {
          cadd: '1.6',
          cgd: '04-05-2023',
          clinvar: '06-08-2023',
          flag_lrg: '30-03-2021',
          gnomad_v2: 'v2.1.1',
          gnomad_v3: 'v3.1.2',
          gnomad_gene_constraint: 'v2.1.1',
          revel: '1.3',
          splice_ai: '1.3',
          utr_annotator: '10-01-2021',
          exomiser: '2102',
        },
      },
      structural_variant: {
        version: '1.0.0',
        tools: {
          nirvana: '3.18.1',
          'variant-import-tool': '1.0.0',
        },
        dbs: {
          '1000_genomes_project': '1000 Genomes 30x on GRCh38',
          '1000_genomes_project (Inhouse caller)': '21-03-2023',
          birth_cohort_af: '1680 samples results (31-05-2023)',
          clinvar: '20-08-2023',
          dgv_gold: '15-06-2016',
          decipher: '01-09-2015',
          gnomad_sv: 'v2.1',
        },
      },
      univar_gene_version: {
        version: '1.0.0',
        detail: {
          ensembl: '110',
          phi: '04-08-2022',
          clingen: '07-08-2022',
          gnomad_lof_metrics: 'v2.1.1',
          MANE: 'v1.1',
        },
      },
    };

    const standaloneVersionMock: PipelineVersion = {
      version: '1.0.0',
      brand: 'univar',
      small_variant: {
        version: '1.0.1',
        tools: {
          MANE: '1.1',
          VEP: '110',
          exomiser: '12.1.0',
          'variant-import-tool': '1.0.0',
        },
        dbs: {
          cadd: '1.6',
          cgd: '04-05-2023',
          clinvar: '06-08-2023',
          flag_lrg: '30-03-2021',
          gnomad_v2: 'v2.1.1',
          gnomad_v3: 'v3.1.2',
          gnomad_gene_constraint: 'v2.1.1',
          revel: '1.3',
          splice_ai: '1.3',
          utr_annotator: '10-01-2021',
          exomiser: '2102',
        },
      },
      structural_variant: {
        version: '1.0.0',
        tools: {
          nirvana: '3.18.1',
          'variant-import-tool': '1.0.0',
        },
        dbs: {
          '1000_genomes_project': '1000 Genomes 30x on GRCh38',
          '1000_genomes_project (Inhouse caller)': '21-03-2023',
          birth_cohort_af: '1680 samples results (31-05-2023)',
          clinvar: '20-08-2023',
          dgv_gold: '15-06-2016',
          decipher: '01-09-2015',
          gnomad_sv: 'v2.1',
        },
      },
      univar_gene_version: {
        version: '1.0.0',
        detail: {
          ensembl: '110',
          phi: '04-08-2022',
          clingen: '07-08-2022',
          gnomad_lof_metrics: 'v2.1.1',
          MANE: 'v1.1',
        },
      },
    };

    it('should return the pipeline version', async () => {
      const mockGetDatabaseNModel = jest
        .spyOn(Functions, 'getDatabaseNModel')
        .mockResolvedValue(commonInfoDatabaseMock);
      mockSortFunction.mockReturnValue({
        exec: jest.fn().mockReturnValue(resultMock),
      });
      mockLoggingHelperService.performanceLogAndFindOneMongo.mockResolvedValue(
        resultMock,
      );
      mockPipelineVersionModel.mockResolvedValueOnce(pipelineVersionModel);

      const result = await service.findPipelineInfo(
        trackNumber,
        selectedDatabase,
        userInfo,
      );

      expect(result).toEqual(resultMock);
      expect(mockGetDatabaseNModel).toHaveBeenCalledTimes(1);
    });

    it('should return the standalone pipeline version', async () => {
      const mockGetDatabaseNModel = jest
        .spyOn(Functions, 'getDatabaseNModel')
        .mockResolvedValue(commonInfoDatabaseMock);

      mockSortFunction.mockReturnValue({
        exec: jest.fn().mockReturnValue(standaloneVersionMock),
      });
      mockLoggingHelperService.performanceLogAndFindOneMongo
        .mockResolvedValueOnce(standaloneVersionMock)
        .mockResolvedValueOnce(standaloneVersionMock);
      mockPipelineVersionModel.mockResolvedValueOnce(pipelineVersionModel);

      const result = await service.findPipelineInfo(
        trackNumber,
        selectedDatabase,
        userInfo,
      );

      expect(result).toEqual(standaloneVersionMock);
      expect(mockGetDatabaseNModel).toHaveBeenCalledTimes(1);
    });

    it('should return the standalone pipeline version', async () => {
      jest
        .spyOn(Functions, 'getDatabaseNModel')
        .mockResolvedValue(commonInfoDatabaseMock);

      mockSortFunction.mockReturnValue({
        exec: jest.fn().mockReturnValue(standaloneVersionMock),
      });
      mockLoggingHelperService.performanceLogAndFindOneMongo.mockResolvedValue(
        resultMock,
      );
      mockPipelineVersionModel.mockResolvedValueOnce(pipelineVersionModel);

      const result = await service.findPipelineInfo(
        trackNumber,
        selectedDatabase,
        userInfo,
        'univar',
      );

      expect(result).toEqual(resultMock);
      expect(
        mockLoggingHelperService.performanceLogAndFindOneMongo,
      ).toHaveBeenCalledTimes(1);
    });

    it('should throw CustomException if the selected database does not exist', async () => {
      const mockGetDatabaseNModel = jest
        .spyOn(Functions, 'getDatabaseNModel')
        .mockResolvedValueOnce([mockConnection, null]);

      await expect(
        service.findPipelineInfo(trackNumber, selectedDatabase, userInfo),
      ).rejects.toThrow(CustomException);

      expect(mockGetDatabaseNModel).toHaveBeenCalledTimes(1);
    });
  });
});
