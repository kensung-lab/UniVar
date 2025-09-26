import { Request, Response } from 'express';
import {
  ACTION_TYPE,
  AUDIT_LOG_TYPE,
  ActionLog,
  DataUpdateLog,
  EXCEPTION_LEVEL,
  EXCEPTION_TYPE,
  PerformanceLog,
  URL_BASED_ACTION_NAME,
  UserInfo,
} from 'src/common';
import jwt from 'jsonwebtoken';
import { ErrorLogs, Logs, PerformanceLogs } from 'src/utils';
import { generateKeyPairSync } from 'node:crypto';
import { S_TEAM_USERINFO } from '../../mock';

describe('Logs', () => {
  const application_name = 'univar-backend';

  describe('with request data', () => {
    const req: Request = {
      headers: {
        authorization: 'Bearer token',
      },
      originalUrl: '/bookmark/list',
      body: {
        track_number: '123',
      },
      ip: '127.0.0.1',
    } as Request;
    const curDate = new Date().getTime();
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: 'YZ1HWn33FrDmk9zSBeEfkCtsM2n0LbSEdu_9zLDHPlc',
    };
    const payload = {
      exp: curDate + 5 * 60 * 1000,
      iat: curDate,
      auth_time: curDate - 2000,
      jti: 'cddc934b-905f-40b4-a1b4-e67c1be52e07',
      iss: '*realms/univar',
      aud: 'account',
      sub: 'efedf063-c83d-40bc-8af7-1899ac12b083',
      typ: 'Bearer',
      azp: 'univar-frontend',
      nonce: '27021af0-bf53-4e36-8af7-026d9ac94d38',
      session_state: '2314479a-a557-4891-8ca9-b315f79247ea',
      'allowed-origins': ['http://localhost:5173/*', '*'],
      realm_access: {
        roles: ['default-roles', 'offline_access', 'uma_authorization'],
      },
      resource_access: {
        account: {
          roles: ['manage-account', 'manage-account-links', 'view-profile'],
        },
      },
      scope: 'openid email profile',
      sid: '2314479a-a557-4891-8ca9-b315f79247ea',
      email_verified: false,
      preferred_username: 'univar-test02',
      given_name: '',
      family_name: '',
      group: ['bteam'],
    };

    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    req.headers.authorization =
      'Bearer ' + jwt.sign(payload, privateKey, { header });
    const mockGetUserInfo = jest.spyOn(Logs.prototype as any, 'getUserInfo');
    const mockedUserInfo: UserInfo = S_TEAM_USERINFO;

    mockGetUserInfo.mockReturnValue(mockedUserInfo);

    it('should create a new Logs object with request data', () => {
      const logs = new Logs(req);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.REQUEST);
      expect(logs.headers).toEqual(req.headers);
      expect(logs.body).toEqual(req.body);
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.request_ip).toEqual(req.ip);
    });

    it('should create a new Logs object with response data', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody = '{ "message": "success", "track_number": "456" }';
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(JSON.parse(responseBody.toString()));
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });

    it('should create a new Logs object with different response data 1', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody = { message: 'success', track_number: '456' };
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(responseBody);
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });

    it('should create a new Logs object with different response data 2', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody = '';
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(undefined);
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });
    it('should create a new Logs object with different response data 3', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody = '{"data": "abc"}';
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(JSON.parse(responseBody));
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });

    it('should create a new Logs object with different response data 4', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody = '{"data": {"result": [{"abc":"a"}]}}';
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(JSON.parse(responseBody));
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });

    it('should create a new Logs object with different response data 5', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody = '{"data": {"result": 123}}';
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(JSON.parse(responseBody));
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });
    it('should create a new Logs object with different response data 6', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody = '{"data": {"result": {"abc":"123"}}}';
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(JSON.parse(responseBody));
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });

    it('should create a new Logs object with max length 300 of body', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody =
        '{ "message":"success", "track_number":"456", "data":{"result":[{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"}] } }';
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(
        JSON.parse(
          '{ "message":"success", "track_number":"456", "data":{"result":[{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"}] } }',
        ),
      );
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });

    it('should create a new Logs object with max length 301 of body', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody =
        '{ "message":"success", "track_number":"456", "data":{"result":[{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"}] } }';
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(
        JSON.parse(
          '{ "message":"success", "track_number":"456", "data":{"result":[{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"},{"a":"b"}] } }',
        ),
      );
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
    });

    it('should return tostring of the log object', () => {
      const res: Response = {
        statusCode: 200,
        getHeaders: () => ({
          'Content-Type': 'application/json',
        }),
        body: {
          track_number: '234',
        },
      } as unknown as Response;
      const responseBody = { message: 'success', track_number: '456' };
      const logs = new Logs(req, res, responseBody);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.RESPONSE);
      expect(logs.headers).toEqual(res.getHeaders());
      expect(logs.body).toEqual(responseBody);
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.original_url).toEqual(req.originalUrl);
      expect(logs.status_code).toEqual(res.statusCode);
      expect(logs.toString()).toContain(
        'User: univar-test02 Action Type: query Action Name: query_bookmarks Headers: {"Content-Type":"application/json"} Body: {"message":"success","track_number":"456"} Original Url: /bookmark/list Request IP: 127.0.0.1 Status Code: 200',
      );
    });

    it('should create a new ErrorLogs object with error data', () => {
      const error = new Error('test error');
      const logs = new ErrorLogs(
        req,
        error,
        EXCEPTION_TYPE.AUTH,
        EXCEPTION_LEVEL.NORMAL,
      );

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.ERROR);
      expect(logs.error_type).toBe(EXCEPTION_TYPE.AUTH);
      expect(logs.error_stack).toEqual(error);
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.level).toEqual(EXCEPTION_LEVEL.NORMAL);
      expect(logs.toString()).toEqual(JSON.stringify(logs));
    });

    it('should create a new ErrorLogs object with only request data', () => {
      const error = new Error('test error');
      const logs = new ErrorLogs(req, error);

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe(mockedUserInfo.preferred_username);
      expect(logs.action_type).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_type,
      );
      expect(logs.action_name).toBe(
        URL_BASED_ACTION_NAME.get(req.originalUrl).action_name,
      );
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.ERROR);
      expect(logs.error_type).toBe(EXCEPTION_TYPE.UNEXPECTED);
      expect(logs.error_stack).toEqual(error);
      expect(logs.track_number).toEqual(req.body.track_number);
      expect(logs.level).toEqual(EXCEPTION_LEVEL.CRITICAL);
      expect(logs.toString()).toEqual(JSON.stringify(logs));
    });

    it('should create a new Logs object with data update data', () => {
      const actionLog: ActionLog = {
        actionType: ACTION_TYPE.JS_TASK,
        actionName: 'test_insert_db',
        trackNumber: '123214325435643',
        username: 'univar-test01',
        customObject: { test: 2 },
      };

      const logs = new Logs(
        null,
        null,
        null,
        'test_user',
        'test_track_number',
        'test_action_type',
        'test_action_name',
        null,
        actionLog,
      );

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe('test_user');
      expect(logs.action_type).toBe('test_action_type');
      expect(logs.action_name).toBe('test_action_name');
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.USER_ACTION);
      expect(logs.extra_information).toEqual(actionLog.customObject);
      expect(logs.track_number).toEqual('test_track_number');
      expect(logs.toString()).toContain(
        'User: test_user Action Type: test_action_type Action Name: test_action_name Extra Information: {"test":2}',
      );
    });

    it('should create a new Logs object with data update data', () => {
      const updateLog: DataUpdateLog = {
        actionType: ACTION_TYPE.INSERT_DB,
        actionName: 'test_insert_db',
        trackNumber: '123214325435643',
        username: 'univar-test01',
        original_data: '{testing: 123}',
        modified_data: '{testing: 234}',
        database: 'C0000770B01-001-LIB1_duopat_20230105-152056',
        collection: 'variants',
      };

      const logs = new Logs(
        null,
        null,
        null,
        'test_user',
        'test_track_number',
        'test_action_type',
        'test_action_name',
        updateLog,
      );

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe('test_user');
      expect(logs.action_type).toBe('test_action_type');
      expect(logs.action_name).toBe('test_action_name');
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.DATA_UPDATE);
      expect(logs.original_data).toEqual(updateLog.original_data);
      expect(logs.modified_data).toEqual(updateLog.modified_data);
      expect(logs.database).toEqual(updateLog.database);
      expect(logs.table).toEqual(updateLog.collection);
      expect(logs.track_number).toEqual('test_track_number');
      expect(logs.toString()).toContain(
        'User: test_user Action Type: test_action_type Action Name: test_action_name Original Data: "{testing: 123}" Modified Data: "{testing: 234}" Database: "C0000770B01-001-LIB1_duopat_20230105-152056" Collection: "variants"',
      );
    });
  });

  describe('with performance data', () => {
    it('should create a new Logs object with performance data', () => {
      const performanceLog: PerformanceLog = {
        start: new Date(1689177600000),
        end: new Date(1689177920000),
        filters: { name: 'test' },
        sort: { createdAt: -1 },
        skip: 10,
        limit: 20,
        project: { name: 1 },
        database: 'test_db',
        actionType: ACTION_TYPE.FIND_DB,
        actionName: 'testing_find_db',
        trackNumber: '123214324',
        username: 'univar-test01',
        collection: 'family_duopat_20230105-152056',
        startLog: function (): void {
          throw new Error('Function not implemented.');
        },
        endLog: function (): void {
          throw new Error('Function not implemented.');
        },
      };

      const logs = new PerformanceLogs(
        'test_user',
        'test_track_number',
        'test_action_type',
        'test_action_name',
        performanceLog,
      );

      expect(logs.application_name).toBe(application_name);
      expect(logs.log_time).toBeInstanceOf(Date);
      expect(logs.user).toBe('test_user');
      expect(logs.action_type).toBe('test_action_type');
      expect(logs.action_name).toBe('test_action_name');
      expect(logs.log_type).toBe(AUDIT_LOG_TYPE.PERFORMANCE);
      expect(logs.start).toEqual(performanceLog.start);
      expect(logs.end).toEqual(performanceLog.end);
      expect(logs.duration).toEqual(320000);
      expect(logs.filters).toEqual(performanceLog.filters);
      expect(logs.sort).toEqual(performanceLog.sort);
      expect(logs.skip).toEqual(performanceLog.skip);
      expect(logs.limit).toEqual(performanceLog.limit);
      expect(logs.project).toEqual(performanceLog.project);
      expect(logs.database).toEqual(performanceLog.database);
      expect(logs.toString()).toContain(
        'User: test_user Action Type: test_action_type Action Name: test_action_name Start: Thu Jul 13 2023 00:00:00 GMT+0800 (Hong Kong Standard Time) End: Thu Jul 13 2023 00:05:20 GMT+0800 (Hong Kong Standard Time) Duration: 320000 Filters: {"name":"test"} Sort: {"createdAt":-1} Skip: 10 Limit: 20 Project: {"name":1} Database: test_db',
      );
    });
  });
});
