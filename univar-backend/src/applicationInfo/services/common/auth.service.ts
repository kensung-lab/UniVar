import { Injectable } from '@nestjs/common';
import { ACTION_TYPE, UserInfo } from 'src/common';
import { LoggingHelperService } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(private readonly loggingHelperService: LoggingHelperService) {}

  async logAuth(userInfo: UserInfo, type: string): Promise<void> {
    this.loggingHelperService.actionLog(
      userInfo.preferred_username,
      type,
      ACTION_TYPE.ACTION,
      type,
    );
  }
}
