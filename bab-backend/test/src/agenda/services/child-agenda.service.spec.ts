import { NestFactory } from '@nestjs/core';
import { mockAgendaService } from '../../mock';

describe('bootstrap', () => {
  let app: any;
  let nestFactoryCreate: any;
  let agendaDefine: any;
  let agendaStart: any;
  let mockCustomAgendaService: any;

  beforeEach(() => {
    mockCustomAgendaService = mockAgendaService;
    agendaDefine = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error();
      })
      .mockImplementation(async (_jobName, fun) => {
        await (<any>fun)();
      });
    mockCustomAgendaService.agenda.define = agendaDefine;
    agendaStart = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });
    mockCustomAgendaService.agenda.start = agendaStart;
    app = {
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      use: jest.fn(),
      listen: jest.fn(),
      get: jest.fn().mockReturnValue(mockCustomAgendaService),
      select: jest.fn().mockReturnThis(),
    };
    nestFactoryCreate = jest.spyOn(NestFactory, 'create');
    nestFactoryCreate.mockResolvedValue(app);
  });

  it('test bootstrap function', async () => {
    await require('src/agenda/services/child-agenda.service');
    expect(nestFactoryCreate).toHaveBeenCalledTimes(1);
    expect(mockCustomAgendaService.agenda.define).toHaveBeenCalledTimes(1);
    expect(mockCustomAgendaService.agenda.start).toHaveBeenCalledTimes(0);
  });
});
