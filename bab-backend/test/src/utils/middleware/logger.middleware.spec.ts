import { LoggerMiddleware, AppLogger } from 'src/utils';
import * as httpMocks from 'node-mocks-http';

describe('LoggerMiddleware', () => {
  let loggerMiddleware: LoggerMiddleware;
  let appLogger: AppLogger;

  beforeEach(() => {
    appLogger = {
      requestLog: jest.fn(),
      responseLog: jest.fn(),
    } as any;
    loggerMiddleware = new LoggerMiddleware(appLogger);
  });

  describe('use', () => {
    it('should call requestLog method with the correct parameters', () => {
      const req = { originalUrl: '/sample/list' } as any;
      const res = {} as any;
      const next = jest.fn();
      loggerMiddleware.use(req, res, next);

      expect(appLogger.requestLog).toHaveBeenCalledWith(req);
    });

    it('should not call requestLog method when there is NO_LOG url', () => {
      const req = { originalUrl: '/health' } as any;
      const res = {} as any;
      const next = jest.fn();
      loggerMiddleware.use(req, res, next);

      expect(appLogger.requestLog).toHaveBeenCalledTimes(0);
    });

    it('should call getResponseLog method with the correct parameters', () => {
      const req = { originalUrl: '/bookmark/list' } as any;
      const res = {} as any;
      const next = jest.fn();
      loggerMiddleware['getResponseLog'] = jest.fn();
      loggerMiddleware.use(req, res, next);

      expect(loggerMiddleware['getResponseLog']).toHaveBeenCalledWith(req, res);
    });

    it('should call the next middleware function if it is provided', () => {
      const req = {} as any;
      const res = {} as any;
      const next = jest.fn();
      loggerMiddleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should not call the next middleware function if it is not provided', () => {
      const req = {} as any;
      const res = {} as any;
      loggerMiddleware.use(req, res, null);

      expect(true).toBe(true);
      // No assertion needed since we are just testing that the function does not throw an error
    });
  });

  describe('getResponseLog', () => {
    it('should call responseLog method with the correct parameters', () => {
      const req = {} as any;
      const res = {
        write: jest.fn(),
        end: jest.fn(),
        setHeader: jest.fn(),
      } as any;
      loggerMiddleware['getResponseLog'](req, res);
      res.end('');

      expect(appLogger.responseLog).toHaveBeenCalledWith(req, res, '');
    });

    it('should override res.write and res.end methods', () => {
      const req = {} as Request;
      const res = (<any>{
        write: jest.fn(),
        end: jest.fn(),
      }) as Response;
      const rawResponse = (<any>res).write;
      const rawResponseEnd = (<any>res).end;

      loggerMiddleware.getResponseLog(<any>req, <any>res);

      expect((<any>res).write).not.toBe(rawResponse);
      expect((<any>res).end).not.toBe(rawResponseEnd);
    });

    it('should call logger.responseLog when res.end is called', () => {
      const body = 'response body';
      const req = {} as Request;
      const res = (<any>{
        write: jest.fn(),
        end: jest.fn(),
      }) as Response;

      loggerMiddleware.getResponseLog(<any>req, <any>res);

      (<any>res).end(body);

      expect(appLogger.responseLog).toHaveBeenCalledWith(req, res, body);
    });

    it('mock http request and response to test the logging ', () => {
      const body = 'response body';
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/some/url',
      });

      const response = httpMocks.createResponse();

      loggerMiddleware.getResponseLog(<any>request, <any>response);
      response.write('');
      response.write(body);

      response.end();

      expect(appLogger.responseLog).toHaveBeenCalledWith(
        request,
        response,
        body,
      );
    });
  });
});
