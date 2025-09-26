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
import { ServerModule } from 'src/serverlinker';

@Module({
  imports: [
    S3Module,
    ServerModule,
    UtilsModule,
    ApplicationModule,
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
