import { NestFactory } from '@nestjs/core';
import { ResponseFilter } from 'src/common';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppClusterService } from 'src/app-cluster.service';

jest.mock('helmet');

describe('App', () => {
  let app: any;
  let nestFactoryCreate: any;
  let appClusterServiceClusterize: any;

  beforeEach(() => {
    app = {
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      use: jest.fn(),
      listen: jest.fn(),
      get: jest.fn(),
    };

    appClusterServiceClusterize = jest.spyOn(AppClusterService, 'clusterize');
    appClusterServiceClusterize.mockImplementation(async (application) => {
      application();
    });
    nestFactoryCreate = jest.spyOn(NestFactory, 'create');
    nestFactoryCreate.mockResolvedValue(app);
    const swaggerModuleCreateDocumnet = jest.spyOn(
      SwaggerModule,
      'createDocument',
    );
    (<any>helmet).mockReturnValue(() => {});
    const swaggerModuleSetup = jest.spyOn(SwaggerModule, 'setup');
    swaggerModuleCreateDocumnet.mockReturnValue({} as any);
    swaggerModuleSetup.mockReturnValue({} as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('bootstrap', () => {
    it('should create Nest application with correct configuration', async () => {
      await require('src/main');
      expect(app).toBeDefined();
      expect(app.use).toHaveBeenCalledWith(expect.any(Function));
      expect(helmet).toHaveBeenCalledWith({
        crossOriginEmbedderPolicy: false,
        hidePoweredBy: true,
        contentSecurityPolicy: {
          directives: {
            imgSrc: [`'self'`, 'data:'],
            scriptSrc: [`'self'`],
            manifestSrc: [`'self'`],
            frameSrc: [`'self'`],
          },
        },
      });
      expect(app.useGlobalPipes).toHaveBeenCalledWith(
        expect.any(ValidationPipe),
      );
      expect(app.useGlobalFilters).toHaveBeenCalledWith(
        expect.any(ResponseFilter),
      );
      expect(app.listen).toHaveBeenCalledWith(8081);
    });

    it('should enable CORS in development mode', async () => {
      process.env.DEV_MODE = 'false';
      await require('src/main');
      expect(app.use).toHaveBeenCalledTimes(0);
    });
  });
});
