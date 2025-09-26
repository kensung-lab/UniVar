import { Connection } from 'mongoose';
import { AppLogger, LoggingHelperService } from 'src/utils';
import { Cache } from 'cache-manager';
import {
  AuthService,
  DatabaseService,
  GenePanelService,
  GeneService,
} from 'src/applicationInfo';
import { AgendaService } from 'src/agenda';
import { S3Service } from 'src/s3linker';

export const mockLoggingHelperService: LoggingHelperService = {
  performanceLogAndFindOneMongo: jest.fn(),
  performanceLogAndCountMongo: jest.fn(),
  performanceLogAndSaveMongo: jest.fn(),
  performanceLogAndFindMongo: jest.fn(),
  performanceLogAndDeleteOneMongo: jest.fn(),
  errorLog: jest.fn(),
  actionLog: jest.fn(),
} as any;

export const mockLogger: AppLogger = {
  errorLog: jest.fn(),
  actionLog: jest.fn(),
} as any;
export const mockConnection: Connection = {
  asPromise: jest.fn().mockReturnValue({
    model: jest.fn().mockReturnValue({}),
    models: {},
  }),
  close: jest.fn(),
  destroy: jest.fn(),
} as any;

export const mockCacheManager: Cache = {
  set: jest.fn(),
  get: jest.fn(),
  connection: undefined,
} as any;

export const mockDatabaseService: DatabaseService = {
  findDatabaseList: jest.fn(),
} as any;

export const mockS3Service: S3Service = {
  uploadToS3: jest.fn(),
} as any;

const session = {
  startTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  endSession: jest.fn(),
};

export const mockModel = jest.fn().mockReturnValue({});

(<any>mockModel).startSession = jest.fn().mockReturnValue(session);

export const mockGenePanelService: GenePanelService = {
  getGenePanelList: jest.fn(),
  getLatestPanelList: jest.fn(),
} as any;

export const mockAgendaService: AgendaService = {
  agenda: {
    now: jest.fn(),
    define: jest.fn().mockImplementation(async (_jobName: string, fun) => {
      await fun();
    }),
    start: jest.fn(),
  },
  exportTsv: jest.fn(),
  exportVcf: jest.fn(),
  getExportResult: jest.fn(),
  deleteExportResult: jest.fn(),
} as any;

export const mockGeneService: GeneService = {
  findVersion: jest.fn(),
} as any;

export const mockAuthService: AuthService = {
  loggingHelperService: undefined,
  logAuth: jest.fn(),
} as any;
