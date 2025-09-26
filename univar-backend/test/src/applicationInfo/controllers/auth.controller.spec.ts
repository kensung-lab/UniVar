import { AuthController } from 'src/applicationInfo/controllers/auth.controller';
import { B_TEAM_USERINFO, S_TEAM_USERINFO, mockAuthService } from '../../mock';

describe('AuthController', () => {
  let instance;

  beforeEach(() => {
    instance = new AuthController(mockAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('instance should be an instanceof AuthController', () => {
    expect(instance instanceof AuthController).toBeTruthy();
  });

  it('should have a method login()', async () => {
    await instance.login(B_TEAM_USERINFO);
    expect(mockAuthService.logAuth).toHaveBeenCalledTimes(1);
    expect(mockAuthService.logAuth).toHaveBeenCalledWith(
      B_TEAM_USERINFO,
      'login',
    );
  });

  it('should have a method logout()', async () => {
    await instance.logout(S_TEAM_USERINFO);
    expect(mockAuthService.logAuth).toHaveBeenCalledTimes(1);
    expect(mockAuthService.logAuth).toHaveBeenCalledWith(
      S_TEAM_USERINFO,
      'logout',
    );
  });
});
