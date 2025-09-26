import { Test, TestingModule } from '@nestjs/testing';
import {
  BaseResponse,
  CramUrl,
  GetCramRequest,
  ResourceAccess,
  RoleAccess,
} from 'src/common';
import { S3Client } from '@aws-sdk/client-s3';
import { AppLogger, LoggingHelperService } from 'src/utils';
import { mockLogger, mockLoggingHelperService } from '../../mock';
import { S3Controller, S3Service } from 'src/s3linker';

describe('S3Controller', () => {
  let s3Controller: S3Controller;
  let s3Client: S3Client;
  const mockGetS3preSignedUrl = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'AWS_SDK_V3_MODULE#S3Client#',
          useValue: s3Client,
        },
        {
          provide: LoggingHelperService,
          useValue: mockLoggingHelperService,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
        {
          provide: S3Service,
          useValue: {
            getS3preSignedUrl: mockGetS3preSignedUrl,
          },
        },
      ],
      controllers: [S3Controller],
    }).compile();

    s3Controller = module.get<S3Controller>(S3Controller);
  });

  describe('getSignedUrl', () => {
    it('should return a signed URL', async () => {
      // Mock the necessary dependencies and methods based on your test scenarios.
      // For example:
      const getCramRequest: GetCramRequest = {
        track_number: 'univar-test01:714554236783',
        selected_database: 'family_solo_20230803_234937',
        samples: ['A0000550B01-001-LIB1'],
      };
      const userInfo = <any>{
        preferred_username: 'univar-test01',
        group: ['bteam'],
        exp: 0,
        iat: 0,
        auth_time: 0,
        jti: '',
        aud: '',
        sub: '',
        typ: '',
        azp: '',
        session_state: '',
        acr: '',
        realm_access: new RoleAccess(),
        resource_access: new ResourceAccess(),
        scope: '',
        sid: '',
        email_verified: false,
        name: '',
        given_name: '',
        family_name: '',
        email: '',
      };
      const mockCramUrls: CramUrl[] = [
        /* mock response data */
      ];
      mockGetS3preSignedUrl.mockResolvedValue(mockCramUrls);

      const expectedResult: BaseResponse<CramUrl[]> = new BaseResponse(
        mockCramUrls,
        getCramRequest.track_number,
      );

      const result = await s3Controller.getSignedUrl(getCramRequest, userInfo);

      expect(result).toEqual(expectedResult);

      // Check if the necessary methods of S3Service have been called with the correct arguments.
      expect(mockGetS3preSignedUrl).toHaveBeenCalledWith(
        getCramRequest,
        userInfo,
      );
    });
  });
});
