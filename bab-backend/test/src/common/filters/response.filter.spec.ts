import { AppLogger } from 'src/utils';
import { Request, Response } from 'express';
import {
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ResponseFilter,
  EXCEPTION_TYPE,
  EXCEPTION_LEVEL,
  CustomException,
  BaseRequest,
  EXCEPTION_CODE,
} from 'src/common';

describe('ResponseFilter', () => {
  let responseFilter: ResponseFilter;
  let mockLogger: AppLogger;
  let mockArgumentsHost: ArgumentsHost;
  let mockRequest: Request;
  let mockResponse: Response;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockLogger = {
      errorLog: jest.fn(),
    } as any;

    mockRequest = {
      body: {},
    } as any;

    mockJson = jest.fn();

    mockResponse = {
      status: jest.fn(() => ({
        json: mockJson,
      })),
    } as any;

    mockArgumentsHost = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => mockRequest),
        getResponse: jest.fn(() => mockResponse),
      })),
    } as any;

    responseFilter = new ResponseFilter(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch', () => {
    it('should catch an HttpException and return the correct response', () => {
      const errorCode = 400;
      const errorMsg = 'Test Error';
      const mockException = new HttpException(errorMsg, errorCode);

      responseFilter.catch(mockException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(errorCode);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
          error_code: errorCode,
          error_message: errorMsg,
        }),
      );
      expect(mockLogger.errorLog).toHaveBeenCalledWith(
        mockRequest,
        mockException,
        EXCEPTION_TYPE.UNEXPECTED,
        EXCEPTION_LEVEL.CRITICAL,
      );
    });

    it('should catch an UnauthorizedException and return the correct response', () => {
      const mockException = new UnauthorizedException();

      responseFilter.catch(mockException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
          error_code: 401,
          error_message: 'Unauthorized',
        }),
      );
      expect(mockLogger.errorLog).toHaveBeenCalledWith(
        mockRequest,
        mockException,
        EXCEPTION_TYPE.AUTH,
        EXCEPTION_LEVEL.NORMAL,
      );
    });

    it('should catch a CustomException and return the correct response', () => {
      const mockException = new CustomException(
        EXCEPTION_CODE.NOT_SELECTED_DATABASE,
      );

      responseFilter.catch(mockException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
          error_code: 4003,
          error_message: 'Please select Database',
        }),
      );
      expect(mockLogger.errorLog).toHaveBeenCalledWith(
        mockRequest,
        mockException,
        EXCEPTION_TYPE.REQUEST_ERROR,
        EXCEPTION_LEVEL.NORMAL,
      );
    });

    it('should catch an error and return the correct response', () => {
      const mockException = new Error('Test Error');

      responseFilter.catch(mockException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error_code: 500,
          error_message: 'Error occurred. Please contact admin.',
          data: null,
          track_number: null,
        }),
      );
      expect(mockLogger.errorLog).toHaveBeenCalledWith(
        mockRequest,
        mockException,
        EXCEPTION_TYPE.UNEXPECTED,
        EXCEPTION_LEVEL.CRITICAL,
      );
    });

    it('should extract the track number from the request body', () => {
      mockRequest.body = { track_number: '123' } as BaseRequest;

      const mockException = new Error('Test Error');

      responseFilter.catch(mockException, mockArgumentsHost);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          track_number: '123',
        }),
      );
    });
  });
});
