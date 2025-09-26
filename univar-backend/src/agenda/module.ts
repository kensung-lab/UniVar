import { Module } from '@nestjs/common';
import { AgendaService } from './services';
import { ApplicationModule } from 'src/applicationInfo';
import { UtilsModule } from 'src/utils';
import { InitAgendaService } from './services/init-agenda.service';
import { TEMP_EXPORTS_MODEL_NAME, TempExportsSchema } from './schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { COMMON_DATABASE } from 'src/common';
import { S3Module } from 'src/s3linker';
import { ServerModule } from 'src/serverlinker';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: TEMP_EXPORTS_MODEL_NAME, schema: TempExportsSchema }],
      COMMON_DATABASE,
    ),
    UtilsModule,
    ApplicationModule,
    S3Module,
    ServerModule,
  ],
  providers: [AgendaService, InitAgendaService],
  exports: [AgendaService, InitAgendaService],
})
export class AgendaModule {}
