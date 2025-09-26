import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  TerminusModule,
} from '@nestjs/terminus';
import { HealthController } from 'src/health';
import { MongoHealthIndicator } from 'src/health/indicators';
import { mockConnection } from '../../mock';
import * as Functions from 'src/common/functions/common';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: HealthCheckService;
  let mongoHealthIndicator: MongoHealthIndicator = <any>{};
  const isHealthyMethod = jest.fn();
  mongoHealthIndicator.isHealthy = isHealthyMethod;
  let memoryHealthIndicator: MemoryHealthIndicator = <any>{};
  const checkHeapMethod = jest.fn();
  memoryHealthIndicator.checkHeap = checkHeapMethod;
  const checkMethod = jest.fn();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerminusModule,
        {
          provide: MemoryHealthIndicator,
          useValue: memoryHealthIndicator,
        },
        {
          provide: MongoHealthIndicator,
          useValue: mongoHealthIndicator,
        },
        {
          provide: HealthCheckService,
          useValue: {
            check: checkMethod,
          },
        },
      ],
      controllers: [HealthController],
    }).compile();

    healthCheckService = module.get(HealthCheckService);
    healthController = module.get<HealthController>(HealthController);
    mongoHealthIndicator =
      module.get<MongoHealthIndicator>(MongoHealthIndicator);
    memoryHealthIndicator = module.get<MemoryHealthIndicator>(
      MemoryHealthIndicator,
    );
  });

  describe('check', () => {
    it('should return health check results', async () => {
      healthCheckService.check = checkMethod.mockImplementationOnce(
        (args: any[]) => {
          args.forEach(async (x) => await x());
          return true;
        },
      );
      const mockCreateMongoDBConnection = jest
        .spyOn(Functions, 'createMongoDBConnection')
        .mockResolvedValue(mockConnection);

      await healthController.check();

      expect(checkMethod).toHaveBeenCalledTimes(1);

      expect(checkHeapMethod).toHaveBeenCalledWith(
        'memory_heap',
        7 * 1024 * 1024 * 1024,
      );
      expect(mockCreateMongoDBConnection).toHaveBeenCalledTimes(3);
      // Check if the necessary methods of MongooseHealthIndicator and MemoryHealthIndicator
      // have been called with the correct arguments.
      expect(isHealthyMethod).toHaveBeenNthCalledWith(
        1,
        'common',
        mockConnection,
      );
      expect(isHealthyMethod).toHaveBeenNthCalledWith(
        2,
        'logging',
        mockConnection,
      );
      expect(isHealthyMethod).toHaveBeenNthCalledWith(
        3,
        'gene',
        mockConnection,
      );
    });
  });
});
