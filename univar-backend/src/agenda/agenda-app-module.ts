import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationModule } from 'src/applicationInfo';
import {
  createMongoDBOption,
  COMMON_DATABASE,
  LOGGING_DATABASE,
  GENE_DATABASE,
} from 'src/common';
import { UtilsModule, LoggerMiddleware } from 'src/utils';
import { AgendaModule } from './module';
import { S3Module } from 'src/s3linker';
import { CacheModule } from '@nestjs/cache-manager';
import { ServerModule } from 'src/serverlinker';

/**
 * @module AgendaAppModule
 *
 * @remarks This module is using agenda @see {@link https://github.com/agenda/agenda} to handle the queue for exporting TSV/VCF.
 * And it is start with a fork function in @see {AgendaModule:InitAgendaService}
 *
 * @description Create an separate module to handle cpu heavy process for file export. This file is to inject the required dependency for AgendaAppModule,
 * also added a layer for logging purpose
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      max: 20,
    }),
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
    ApplicationModule,
    AgendaModule,
    UtilsModule,
    S3Module,
    ServerModule,
  ],
  providers: [Logger],
})
export class AgendaAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
