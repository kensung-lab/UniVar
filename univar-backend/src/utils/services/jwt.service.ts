import { Injectable } from '@nestjs/common';
import { UserInfo } from 'src/common';

@Injectable()
export class JwtService {
  parseJwt(token: string): UserInfo {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  }
}
