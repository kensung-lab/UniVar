import { Test, TestingModule } from '@nestjs/testing';
import {
  PipelineVersion,
  PipelineVersionController,
  PipelineVersionService,
} from 'src/applicationInfo';
import { BaseRequest, BaseResponse, QueryRequest } from 'src/common';
import { S_TEAM_USERINFO } from '../../mock';

describe('PipelineVersionController', () => {
  let controller: PipelineVersionController;
  let service: PipelineVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelineVersionController],
      providers: [
        {
          provide: PipelineVersionService,
          useValue: {
            findPipelineInfo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PipelineVersionController>(
      PipelineVersionController,
    );
    service = module.get<PipelineVersionService>(PipelineVersionService);
  });

  describe('findPipelineInfo', () => {
    const queryRequest: QueryRequest = {
      track_number: '123',
      selected_database: 'database',
    };

    const userInfo = { id: 'user-id', username: 'user' };

    const pipelineInfo: PipelineVersion = {
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
          cgd: '2023-05-04',
          clinvar: '2023-08-06',
          flag_lrg: '2021-03-30',
          gnomad_v2: 'v2.1.1',
          gnomad_v3: 'v3.1.2',
          gnomad_gene_constraint: 'v2.1.1',
          revel: '1.3',
          splice_ai: '1.3',
          utr_annotator: '2021-01-10',
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
          '1000_genomes_project (Inhouse caller)': '2023-03-21',
          birth_cohort_af: '1680 samples results (2023-10-19)',
          clinvar: '2023-08-03',
          dgv_gold: '2016-06-15',
          decipher: '2015-09-01',
          gnomad_sv: 'v2.1',
        },
      },
      univar_gene_version: {
        version: '1.0.0',
        detail: {
          ensembl: '110',
          'probability of Haplo and Triplo scores': '2022-08-04',
          clingen: '2022-08-07',
          gnomad_lof_metrics: 'v2.1.1',
          MANE: 'v1.1',
        },
      },
    };

    it('should return a BaseResponse with pipeline info', async () => {
      jest
        .spyOn(service, 'findPipelineInfo')
        .mockResolvedValueOnce(pipelineInfo);

      const expectedResult = new BaseResponse(
        pipelineInfo,
        queryRequest.track_number,
      );

      const result = await controller.findPipelineInfo(queryRequest, userInfo);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findStandalonePipelineInfo', () => {
    const baseRequest: BaseRequest = {
      track_number: '123',
    };

    const pipelineInfo: PipelineVersion = {
      version: '1.0.0',
      brand: 'univar',
      small_variant: {
        version: '1.0.0',
        tools: {
          MANE: '1.1',
          VEP: '110',
          exomiser: '12.1.0',
          'variant-import-tool': '1.0.0',
        },
        dbs: {
          cadd: '1.6',
          cgd: '2023-05-04',
          clinvar: '2023-08-06',
          flag_lrg: '2021-03-30',
          gnomad_v2: 'v2.1.1',
          gnomad_v3: 'v3.1.2',
          gnomad_gene_constraint: 'v2.1.1',
          revel: '1.3',
          splice_ai: '1.3',
          utr_annotator: '2021-01-10',
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
          '1000_genomes_project (Inhouse caller)': '2023-03-21',
          clinvar: '2023-08-03',
          dgv_gold: '2016-06-15',
          decipher: '2015-09-01',
          gnomad_sv: 'v2.1',
        },
      },
      univar_gene_version: {
        version: '1.0.0',
        detail: {
          ensembl: '110',
          'probability of Haplo and Triplo scores': '2022-08-04',
          clingen: '2022-08-07',
          gnomad_lof_metrics: 'v2.1.1',
          MANE: 'v1.1',
        },
      },
    };

    it('should return a BaseResponse with pipeline info', async () => {
      jest
        .spyOn(service, 'findPipelineInfo')
        .mockResolvedValueOnce(pipelineInfo);

      const expectedResult = new BaseResponse(
        pipelineInfo,
        baseRequest.track_number,
      );

      const result = await controller.findStandalonePipelineInfo(
        baseRequest,
        S_TEAM_USERINFO,
      );

      expect(result).toEqual(expectedResult);
    });
  });
});
