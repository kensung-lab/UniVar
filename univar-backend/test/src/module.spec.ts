import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/module';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from 'src/utils';
import mongoose from 'mongoose';
import { PlainModule, mockConnection } from './mock';
import { AgendaModule } from 'src/agenda';
import { VariantInfoModule } from 'src/variantsInfo';

describe('AppModule', () => {
  let appModule: AppModule;
  beforeEach(async () => {
    const mockMongooseCreateConnection = jest.spyOn(
      mongoose,
      'createConnection',
    );
    mockMongooseCreateConnection.mockReturnValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(AgendaModule) // Mocking the AgendaModule
      .useModule(PlainModule) // Provide the mock implementation of AgendaModule
      .overrideModule(VariantInfoModule)
      .useModule(PlainModule)
      .compile();

    appModule = module.get<AppModule>(AppModule);
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });

  describe('configure', () => {
    it('should apply LoggerMiddleware for all routes and methods', () => {
      const middlewareConsumer: MiddlewareConsumer = {
        apply: jest.fn().mockReturnThis(),
        forRoutes: jest.fn().mockReturnThis(),
      } as any;

      appModule.configure(middlewareConsumer);

      expect(middlewareConsumer.apply).toHaveBeenCalledWith(LoggerMiddleware);
      expect((<any>middlewareConsumer).forRoutes).toHaveBeenCalledWith({
        path: '*',
        method: RequestMethod.ALL,
      });
    });
  });
});
