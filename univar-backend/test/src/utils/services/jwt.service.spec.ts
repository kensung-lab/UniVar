import { JwtService } from 'src/utils';

describe('JwtService', () => {
  const jwtService = new JwtService();
  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE2MjYyNDE4MzUsImV4cCI6MTYyNjI0MjQzNX0.8yZc9JqZGmXToRmQnJvJYvY4kHNG4qZQUWqgkTkFbH8';
  const testUserInfo = {
    username: 'test',
    iat: 1626241835,
    exp: 1626242435,
  };

  it('should parse a JWT token and return the user info', () => {
    const userInfo = jwtService.parseJwt(testToken);

    expect(userInfo).toEqual(testUserInfo);
  });
});
