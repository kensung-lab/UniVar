import { NestFactory } from '@nestjs/core';
import { AgendaModule } from '../module';
import { AgendaService } from './agenda.service';
import { AgendaAppModule } from '../agenda-app-module';
import { Job } from '@hokify/agenda';

let service = null;
async function bootstrap() {
  const app = await NestFactory.create(AgendaAppModule);
  service = app.select(AgendaModule).get(AgendaService, { strict: true });
  service.agenda.define(
    'export-tsv',
    async (job: Job<any>, done: (error?: Error) => void) => {
      await service.exportTsv(job, done);
    },
  );
  service.agenda.define(
    'export-vcf',
    async (job: Job<any>, done: (error?: Error) => void) => {
      await service.exportVcf(job, done);
    },
  );
  try {
    await service.agenda.start();
  } catch (e) {
    console.error('Agenda Process Error: ', e);
    await service.agenda.start();
  }
}
bootstrap().catch((e) => {
  console.error('Agenda Nestjs Error: ', e);
  bootstrap();
});
