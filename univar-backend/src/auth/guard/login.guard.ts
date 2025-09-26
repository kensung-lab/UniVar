import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  META_SKIP_AUTH,
  META_UNPROTECTED,
} from '../decorators/public.decorator';

@Injectable()
export class LoginGuard extends AuthGuard('oidc') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isUnprotected = this.reflector.getAllAndOverride<boolean>(
      META_UNPROTECTED,
      [context.getClass(), context.getHandler()],
    );
    const skipAuth = this.reflector.getAllAndOverride<boolean>(META_SKIP_AUTH, [
      context.getClass(),
      context.getHandler(),
    ]);

    // If unprotected is set skip authentication
    if (isUnprotected && skipAuth) {
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
