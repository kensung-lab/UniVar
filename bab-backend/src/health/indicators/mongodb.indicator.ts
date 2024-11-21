import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { Connection } from 'mongoose';

@Injectable()
export class MongoHealthIndicator extends HealthIndicator {
  async isHealthy(key: string, connection: Connection) {
    const isHealthy = connection.readyState == 1;
    const result = this.getStatus(key + '_connection_health', isHealthy);
    if (connection.readyState == 1) {
      await connection.destroy();
      return result;
    }
    await connection.destroy();
    throw new HealthCheckError('mongoose health failed', result);
  }
}
