import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/auth';
import { createMongoDBConnection } from 'src/common';
import { MongoHealthIndicator } from '../indicators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongooseHealth: MongoHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  check() {
    return this.health.check([
      async () =>
        this.mongooseHealth.isHealthy(
          'common',
          await createMongoDBConnection('common'),
        ),
      async () =>
        this.mongooseHealth.isHealthy(
          'logging',
          await createMongoDBConnection('logging'),
        ),
      async () =>
        this.mongooseHealth.isHealthy(
          'gene',
          await createMongoDBConnection('gene'),
        ),
      () => this.memory.checkHeap('memory_heap', 7 * 1024 * 1024 * 1024),
    ]);
  }
}
