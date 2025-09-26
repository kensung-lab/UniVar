import {
  VARIANTS_MODEL_NAME,
  VariantService,
  VariantsSchema,
} from 'src/variantsInfo';
import {
  B_TEAM_USERINFO,
  mockAgendaService,
  mockConnection,
  mockDatabaseService,
  mockGenePanelService,
  mockGeneService,
  mockLoggingHelperService,
  mockS3Service,
  mockVariant1,
  mockVariants1,
} from '../../mock';
import { Paging, PagingRequest, VariantData } from 'src/common';
import * as Functions from 'src/common/functions/common';

describe('DatabaseService', () => {
  let variantService: VariantService;

  beforeEach(async () => {
    variantService = new VariantService(
      mockDatabaseService,
      mockGenePanelService,
      mockLoggingHelperService,
      mockAgendaService,
      mockGeneService,
      mockS3Service,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('VariantService.findVariants', () => {
    it('should find variants and return VariantData', async () => {
      // Start mocking data
      const mockPageRequest = {
        selected_database: 'family_duo_20230206-180313',
        track_number: 'univar-test02:783532886316',
        page: 0,
        per_page: 300,
        sort: [],
        filter: {},
        samples: [
          {
            i: 0,
            name: 'sample1',
            sample_id: 1,
            family_id: 'family_duo_20230206-180313',
            mother_id: 'sample3',
            father_id: 'sample2',
            sex: 'M',
            phenotype: '2',
            group: 'affected',
            active: true,
          },
          {
            i: 1,
            name: 'sample4',
            sample_id: 2,
            family_id: 'family_duo_20230206-180313',
            mother_id: 'sample3',
            father_id: 'sample2',
            sex: 'F',
            phenotype: '2',
            group: 'affected',
            active: true,
          },
        ],
        panels: [],
      } as PagingRequest;

      (<any>mockDatabaseService.findDatabaseList).mockResolvedValue({});
      (<any>(
        mockLoggingHelperService.performanceLogAndFindMongo
      )).mockResolvedValue([mockVariants1]);

      const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
      getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);
      (<any>mockLoggingHelperService.performanceLogAndCountMongo)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(1);

      const mockResult = new VariantData();
      const mockPagingInformation = new Paging(mockPageRequest);
      mockPagingInformation.total_count = 100;
      mockPagingInformation.filtered_total_count = 1;
      mockPagingInformation.total_page =
        mockPagingInformation.filtered_total_count % mockPageRequest.per_page ==
        0
          ? mockPagingInformation.filtered_total_count /
            mockPageRequest.per_page
          : Math.floor(
              mockPagingInformation.filtered_total_count /
                mockPageRequest.per_page,
            ) + 1;

      mockResult.page_info = mockPagingInformation;
      mockResult.result = [mockVariant1];
      // END mocking data
      const result = await variantService.findVariants(
        mockPageRequest,
        B_TEAM_USERINFO,
      );

      expect(mockDatabaseService.findDatabaseList).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.findDatabaseList).toHaveBeenCalledWith(
        mockPageRequest.track_number,
        B_TEAM_USERINFO,
        {
          database_name: mockPageRequest.selected_database,
        },
      );
      expect(getDatabaseNModelMock).toHaveBeenCalledTimes(1);
      expect(getDatabaseNModelMock).toHaveBeenCalledWith(
        VARIANTS_MODEL_NAME,
        VariantsSchema,
        mockPageRequest.selected_database,
      );
      expect(
        mockLoggingHelperService.performanceLogAndCountMongo,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockLoggingHelperService.performanceLogAndCountMongo,
      ).toHaveBeenNthCalledWith(
        1,
        {},
        {},
        B_TEAM_USERINFO.preferred_username,
        mockPageRequest.track_number,
        'count_total_variant',
        mockPageRequest.selected_database,
      );
      expect(
        mockLoggingHelperService.performanceLogAndCountMongo,
      ).toHaveBeenNthCalledWith(
        2,
        {},
        {},
        B_TEAM_USERINFO.preferred_username,
        mockPageRequest.track_number,
        'count_total_filtered_variant',
        mockPageRequest.selected_database,
      );
      expect(result).toEqual(mockResult);
    });
    it('should throw error with totalCount reject', async () => {
      // Start mocking data
      const mockPageRequest = {
        selected_database: 'family_duo_20230206-180313',
        track_number: 'univar-test02:783532886316',
        page: 0,
        per_page: 300,
        sort: [],
        filter: {},
        samples: [
          {
            i: 0,
            name: 'sample1',
            sample_id: 1,
            family_id: 'family_duo_20230206-180313',
            mother_id: 'sample3',
            father_id: 'sample2',
            sex: 'M',
            phenotype: '2',
            group: 'affected',
            active: true,
          },
          {
            i: 1,
            name: 'sample4',
            sample_id: 2,
            family_id: 'family_duo_20230206-180313',
            mother_id: 'sample3',
            father_id: 'sample2',
            sex: 'F',
            phenotype: '2',
            group: 'affected',
            active: true,
          },
        ],
        panels: [],
      } as PagingRequest;

      (<any>mockDatabaseService.findDatabaseList).mockResolvedValue({});
      (<any>(
        mockLoggingHelperService.performanceLogAndFindMongo
      )).mockResolvedValue([mockVariants1]);

      const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
      getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);
      (<any>(
        mockLoggingHelperService.performanceLogAndCountMongo
      )).mockRejectedValue(new Error());

      const mockResult = new VariantData();
      const mockPagingInformation = new Paging(mockPageRequest);
      mockPagingInformation.total_count = 100;
      mockPagingInformation.filtered_total_count = 1;
      mockPagingInformation.total_page =
        mockPagingInformation.filtered_total_count % mockPageRequest.per_page ==
        0
          ? mockPagingInformation.filtered_total_count /
            mockPageRequest.per_page
          : Math.floor(
              mockPagingInformation.filtered_total_count /
                mockPageRequest.per_page,
            ) + 1;

      mockResult.page_info = mockPagingInformation;
      mockResult.result = [mockVariant1];
      // END mocking data

      await expect(
        variantService.findVariants(mockPageRequest, B_TEAM_USERINFO),
      ).rejects.toThrow(Error);
    });
    it('should throw error with totalFilteredCount reject', async () => {
      // Start mocking data
      const mockPageRequest = {
        selected_database: 'family_duo_20230206-180313',
        track_number: 'univar-test02:783532886316',
        page: 0,
        per_page: 300,
        sort: [],
        filter: {},
        samples: [
          {
            i: 0,
            name: 'sample1',
            sample_id: 1,
            family_id: 'family_duo_20230206-180313',
            mother_id: 'sample3',
            father_id: 'sample2',
            sex: 'M',
            phenotype: '2',
            group: 'affected',
            active: true,
          },
          {
            i: 1,
            name: 'sample4',
            sample_id: 2,
            family_id: 'family_duo_20230206-180313',
            mother_id: 'sample3',
            father_id: 'sample2',
            sex: 'F',
            phenotype: '2',
            group: 'affected',
            active: true,
          },
        ],
        panels: [],
      } as PagingRequest;

      (<any>mockDatabaseService.findDatabaseList).mockResolvedValue({});
      (<any>(
        mockLoggingHelperService.performanceLogAndFindMongo
      )).mockResolvedValue([mockVariants1]);

      const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
      getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);
      (<any>mockLoggingHelperService.performanceLogAndCountMongo)
        .mockResolvedValueOnce(100)
        .mockRejectedValue(new Error());

      const mockResult = new VariantData();
      const mockPagingInformation = new Paging(mockPageRequest);
      mockPagingInformation.total_count = 100;
      mockPagingInformation.filtered_total_count = 1;
      mockPagingInformation.total_page =
        mockPagingInformation.filtered_total_count % mockPageRequest.per_page ==
        0
          ? mockPagingInformation.filtered_total_count /
            mockPageRequest.per_page
          : Math.floor(
              mockPagingInformation.filtered_total_count /
                mockPageRequest.per_page,
            ) + 1;

      mockResult.page_info = mockPagingInformation;
      mockResult.result = [mockVariant1];
      // END mocking data

      await expect(
        variantService.findVariants(mockPageRequest, B_TEAM_USERINFO),
      ).rejects.toThrow(Error);
    });
    it('should throw error with variant find reject', async () => {
      // Start mocking data
      const mockPageRequest = {
        selected_database: 'family_duo_20230206-180313',
        track_number: 'univar-test02:783532886316',
        page: 0,
        per_page: 300,
        sort: [],
        filter: {},
        samples: [
          {
            i: 0,
            name: 'sample1',
            sample_id: 1,
            family_id: 'family_duo_20230206-180313',
            mother_id: 'sample3',
            father_id: 'sample2',
            sex: 'M',
            phenotype: '2',
            group: 'affected',
            active: true,
          },
          {
            i: 1,
            name: 'sample4',
            sample_id: 2,
            family_id: 'family_duo_20230206-180313',
            mother_id: 'sample3',
            father_id: 'sample2',
            sex: 'F',
            phenotype: '2',
            group: 'affected',
            active: true,
          },
        ],
        panels: [],
      } as PagingRequest;

      (<any>mockDatabaseService.findDatabaseList).mockResolvedValue({});
      (<any>(
        mockLoggingHelperService.performanceLogAndFindMongo
      )).mockRejectedValue(new Error());

      const getDatabaseNModelMock = jest.spyOn(Functions, 'getDatabaseNModel');
      getDatabaseNModelMock.mockResolvedValue([mockConnection, {}]);
      (<any>mockLoggingHelperService.performanceLogAndCountMongo)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(1);

      const mockResult = new VariantData();
      const mockPagingInformation = new Paging(mockPageRequest);
      mockPagingInformation.total_count = 100;
      mockPagingInformation.filtered_total_count = 1;
      mockPagingInformation.total_page =
        mockPagingInformation.filtered_total_count % mockPageRequest.per_page ==
        0
          ? mockPagingInformation.filtered_total_count /
            mockPageRequest.per_page
          : Math.floor(
              mockPagingInformation.filtered_total_count /
                mockPageRequest.per_page,
            ) + 1;

      mockResult.page_info = mockPagingInformation;
      mockResult.result = [mockVariant1];
      // END mocking data

      await expect(
        variantService.findVariants(mockPageRequest, B_TEAM_USERINFO),
      ).rejects.toThrow(Error);
    });
  });
});
