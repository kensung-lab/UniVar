import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/common';
import { AuthenticatedUser } from 'src/auth';
import { AuthService } from '../services';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 204,
    description: 'log login',
  })
  @HttpCode(204)
  @Get('/login')
  async login(@AuthenticatedUser() userInfo: UserInfo) {
    this.authService.logAuth(userInfo, 'login');
  }

  @ApiResponse({
    status: 204,
    description: 'log logout',
  })
  @HttpCode(204)
  @Get('/logout')
  async logout(@AuthenticatedUser() userInfo: UserInfo) {
    this.authService.logAuth(userInfo, 'logout');
  }
}
