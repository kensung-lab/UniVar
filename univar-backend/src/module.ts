import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ApplicationModule } from './applicationInfo';
import { VariantInfoModule } from './variantsInfo';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppLogger, LoggerMiddleware, UtilsModule } from './utils';
import { MongooseModule } from '@nestjs/mongoose';
import {
  COMMON_DATABASE,
  GENE_DATABASE,
  LOGGING_DATABASE,
  createMongoDBOption,
} from './common';
import { S3Module } from './s3linker';
import { AgendaModule } from './agenda';
import { HealthModule } from './health';
import { AuthModule, LoginGuard, RoleGuard } from './auth';
import { EmailModule } from './email';
import { CacheModule } from '@nestjs/cache-manager';
import { PipelineModule } from './pipeline';
import { ServerModule } from './serverlinker';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      max: 100,
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_BASE_URL,
      createMongoDBOption(COMMON_DATABASE, COMMON_DATABASE),
    ),
    MongooseModule.forRoot(
      process.env.MONGO_BASE_URL,
      createMongoDBOption(LOGGING_DATABASE, LOGGING_DATABASE),
    ),
    MongooseModule.forRoot(
      process.env.MONGO_BASE_URL,
      createMongoDBOption(GENE_DATABASE, GENE_DATABASE),
    ),
    AuthModule,
    ApplicationModule,
    VariantInfoModule,
    AgendaModule,
    UtilsModule,
    S3Module,
    ServerModule,
    EmailModule,
    HealthModule,
    PipelineModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    AppLogger,
    Logger,
  ],
  exports: [AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
