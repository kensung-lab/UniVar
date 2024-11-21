import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OidcStrategyFactory } from './factory';
import { UserInfoSerializer } from './serializer';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'oidc' })],
  providers: [OidcStrategyFactory, UserInfoSerializer],
  exports: [PassportModule],
})
export class AuthModule {}
