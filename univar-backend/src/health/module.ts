import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers';
import { MongoHealthIndicator } from './indicators';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [MongoHealthIndicator],
})
export class HealthModule {}
