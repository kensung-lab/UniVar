import { Module } from '@nestjs/common';
import { PipelineController } from './controllers';
import { S3Module } from 'src/s3linker';
import { PipelineService } from './services';
import { UtilsModule } from 'src/utils';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ApplicationModule,
  DATABASE_MODEL_NAME,
  DatabasesSchema,
  GENE_PANEL_MODEL_NAME,
  GenePanelsSchema,
} from 'src/applicationInfo';
import { COMMON_DATABASE } from 'src/common';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    S3Module,
    UtilsModule,
    ApplicationModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        headers: {
          Authorization: `Bearer ${process.env.ARGO_TOKEN}`,
        },
      }),
    }),
    MongooseModule.forFeature(
      [
        { name: DATABASE_MODEL_NAME, schema: DatabasesSchema },
        { name: GENE_PANEL_MODEL_NAME, schema: GenePanelsSchema },
      ],
      COMMON_DATABASE,
    ),
  ],
  controllers: [PipelineController],
  providers: [PipelineService],
})
export class PipelineModule {}
