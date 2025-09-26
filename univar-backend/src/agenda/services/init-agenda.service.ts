import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { fork } from 'child_process';
import path from 'path';

/**
 * @module AgendaModule
 *
 * @typedef {service} module:InitAgendaService
 *
 * @description This service trigger on the main Nestjs bootstrap to create a process to init agenda
 *              @see {@link https://github.com/agenda/agenda} for export vcf & tsv
 */
@Injectable()
export class InitAgendaService implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    fork(path.resolve(__dirname, './child-agenda.service'));
  }
}
