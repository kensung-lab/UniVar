import { PassportStrategy } from '@nestjs/passport';
import {
  Configuration,
  TokenEndpointResponse,
  fetchUserInfo,
  skipSubjectCheck,
} from 'openid-client';
import { UserInfo } from 'src/common';
import { Strategy } from 'passport-http-bearer';

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  client: Configuration;

  constructor(client: Configuration) {
    super({
      client: client,
      passReqToCallback: false,
      usePKCE: false,
    });
    this.client = client;
  }

  async validate(tokenSet: TokenEndpointResponse | string): Promise<UserInfo> {
    let userInfo: UserInfo = undefined;
    if (
      (typeof tokenSet === 'string' &&
        tokenSet.split('-').length == 2 &&
        tokenSet.split('-')[0].length == 13 &&
        tokenSet.split('-')[1].length == 12) ||
      (typeof tokenSet === 'string' && tokenSet == 'anyone') ||
      (typeof tokenSet === 'string' && tokenSet == 'variant-import-tool') ||
      (typeof tokenSet === 'string' && tokenSet == 'nextflow')
    ) {
      userInfo = {} as any;
      userInfo.preferred_username = tokenSet;
      userInfo.groups = [];
    } else {
      try {
        const token = !(typeof tokenSet === 'string')
          ? tokenSet.access_token
          : tokenSet;
        const userInfoResponse = await fetchUserInfo(
          this.client,
          token,
          skipSubjectCheck,
        );
        userInfo = {} as any;
        userInfo.preferred_username = userInfoResponse.preferred_username;
        userInfo.groups = userInfoResponse.groups as string[];
      } catch (e) {
        console.log('e: ', e);
      }
    }

    return userInfo;
  }
}
