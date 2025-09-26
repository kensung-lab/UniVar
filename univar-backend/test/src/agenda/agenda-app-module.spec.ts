import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from 'src/utils';
import mongoose from 'mongoose';
import { PlainModule, mockConnection } from '../mock';
import { AgendaModule } from 'src/agenda';
import { AgendaAppModule } from 'src/agenda/agenda-app-module';

describe('AgendaAppModule', () => {
  let agendaAppModule: AgendaAppModule;
  beforeEach(async () => {
    const mockMongooseCreateConnection = jest.spyOn(
      mongoose,
      'createConnection',
    );
    mockMongooseCreateConnection.mockReturnValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      imports: [AgendaAppModule],
    })
      .overrideModule(AgendaModule) // Mocking the AgendaModule
      .useModule(PlainModule) // Provide the mock implementation of AgendaModule
      .compile();

    agendaAppModule = module.get<AgendaAppModule>(AgendaAppModule);
  });

  it('should be defined', () => {
    expect(agendaAppModule).toBeDefined();
  });

  describe('configure', () => {
    it('should apply LoggerMiddleware for all routes and methods', () => {
      const middlewareConsumer: MiddlewareConsumer = {
        apply: jest.fn().mockReturnThis(),
        forRoutes: jest.fn().mockReturnThis(),
      } as any;

      agendaAppModule.configure(middlewareConsumer);

      expect(middlewareConsumer.apply).toHaveBeenCalledWith(LoggerMiddleware);
      expect((<any>middlewareConsumer).forRoutes).toHaveBeenCalledWith({
        path: '*',
        method: RequestMethod.ALL,
      });
    });
  });
});
