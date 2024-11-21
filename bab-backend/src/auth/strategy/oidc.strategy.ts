import { PassportStrategy } from '@nestjs/passport';
import { Client, TokenSet } from 'openid-client';
import { UserInfo } from 'src/common';
import { Strategy } from 'passport-http-bearer';

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  client: Client;

  constructor(client: Client) {
    super({
      client: client,
      passReqToCallback: false,
      usePKCE: false,
    });
    this.client = client;
  }

  async validate(tokenset: TokenSet | string): Promise<UserInfo> {
    let userInfo: UserInfo = undefined;
    if (
      (typeof tokenset === 'string' &&
        tokenset.split('-').length == 2 &&
        tokenset.split('-')[0].length == 13 &&
        tokenset.split('-')[1].length == 12) ||
      (typeof tokenset === 'string' && tokenset == 'anyone')
    ) {
      userInfo = {} as any;
      userInfo.preferred_username = tokenset;
      userInfo.groups = [];
    } else {
      try {
        userInfo = await this.client.userinfo(tokenset);
      } catch (e) {}
    }

    return userInfo;
  }
}
