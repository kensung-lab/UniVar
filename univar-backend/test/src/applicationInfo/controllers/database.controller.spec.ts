import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseController, DatabaseService } from 'src/applicationInfo';
import { BRAND_UNIVAR, BaseResponse, QueryRequest } from 'src/common';
import { B_TEAM_USERINFO } from '../../mock';

describe('DatabaseController', () => {
  let controller: DatabaseController;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseController],
      providers: [
        {
          provide: DatabaseService,
          useValue: {
            findDatabaseList: jest.fn(),
            getCallersByDatabase: jest.fn().mockResolvedValue(['a', 'b']),
          },
        },
      ],
    }).compile();

    controller = module.get<DatabaseController>(DatabaseController);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  describe('findAllDatabaseList', () => {
    it('should find database list', async () => {
      const baseRequest = {
        track_number: '1231421432432',
      };
      const userInfo = {};

      await controller.findDatabaseList(baseRequest, userInfo);

      expect(databaseService.findDatabaseList).toHaveBeenCalledWith(
        baseRequest.track_number,
        userInfo,
      );
    });
  });

  describe('findAllDatabaseList', () => {
    it('should find all database list', async () => {
      const baseRequest = {
        track_number: '1231421432432',
      };
      const userInfo = {};

      await controller.findAllDatabaseList(baseRequest, userInfo);

      expect(databaseService.findDatabaseList).toHaveBeenCalledWith(
        baseRequest.track_number,
        userInfo,
        { brand: BRAND_UNIVAR },
        true,
      );
    });
  });

  describe('getCallersByDatabase', () => {
    it('should get callers by database', async () => {
      const queryRequest: QueryRequest = {
        track_number: '1231421432432',
        selected_database: '123',
      };

      const result = await controller.getCallersByDatabase(
        queryRequest,
        B_TEAM_USERINFO,
      );

      expect(databaseService.getCallersByDatabase).toHaveBeenCalledWith(
        queryRequest,
        B_TEAM_USERINFO,
      );
      expect(result).toEqual(
        new BaseResponse(['a', 'b'], queryRequest.track_number),
      );
    });
  });
});
