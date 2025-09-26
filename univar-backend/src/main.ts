import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import { ResponseFilter } from './common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppLogger } from './utils';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppClusterService } from './app-cluster.service';

let app: INestApplication = null;
async function bootstrap() {
  const nestConfig: any = {
    logger: ['error', 'warn', 'log'],
  };

  if (process.env.DEV_MODE == 'true') {
    nestConfig['cors'] = true;
  }

  app = await NestFactory.create(AppModule, nestConfig);

  // swagger config
  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
  };
  const config = new DocumentBuilder()
    .setTitle('Bioinformatics Analysis Browser')
    .setDescription("Bioinformatics Analysis Browser's API")
    .setVersion(process.env.npm_package_version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);

  // auto validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // create global response filter
  const logger = app.get<AppLogger>(AppLogger);
  app.useGlobalFilters(new ResponseFilter(logger));

  if (process.env.DEV_MODE == 'true') {
    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        hidePoweredBy: true,
        contentSecurityPolicy: {
          directives: {
            imgSrc: [`'self'`, 'data:', '*'],
            scriptSrc: [`'self'`],
            manifestSrc: [`'self'`],
            frameSrc: [`'self'`],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        },
      }),
    );
  }

  // For speed, we turn off compression
  // app.use(compression());

  // await app.listen(8081);
  await app.listen(process.env.NEST_PORT);
}

console.log('main.ts => PORT: ', process.env.NEST_PORT);
bootstrap();
// AppClusterService.clusterize(bootstrap);
