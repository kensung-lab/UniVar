import { AuthService } from 'src/applicationInfo/services/common/auth.service';
import { ACTION_TYPE } from 'src/common';
import { B_TEAM_USERINFO, mockLoggingHelperService } from '../../../mock';

describe('AuthService', () => {
  let instance;

  beforeEach(() => {
    instance = new AuthService(mockLoggingHelperService);
  });

  it('instance should be an instanceof AuthService', () => {
    expect(instance instanceof AuthService).toBeTruthy();
  });

  it('should have a method logAuth()', async () => {
    await instance.logAuth(B_TEAM_USERINFO, 'login');
    expect(mockLoggingHelperService.actionLog).toHaveBeenCalledTimes(1);
    expect(mockLoggingHelperService.actionLog).toHaveBeenCalledWith(
      B_TEAM_USERINFO.preferred_username,
      'login',
      ACTION_TYPE.ACTION,
      'login',
    );
  });
});
