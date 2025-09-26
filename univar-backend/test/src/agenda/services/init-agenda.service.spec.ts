import { InitAgendaService } from 'src/agenda/services/init-agenda.service';

jest.mock('child_process');

describe('InitAgendaService', () => {
  let instance;

  beforeEach(() => {
    instance = new InitAgendaService();
  });

  it('instance should be an instanceof InitAgendaService', () => {
    expect(instance instanceof InitAgendaService).toBeTruthy();
  });

  it('should have a method onApplicationBootstrap()', () => {
    instance.onApplicationBootstrap();
  });
});
