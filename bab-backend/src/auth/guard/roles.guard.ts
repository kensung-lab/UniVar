import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { META_ROLES } from '../decorators/roles.decorator';
import { extractRequest } from '../functions';
import { RoleDecoratorOptionsInterface } from '../interfaces';
import { RoleMatchingMode } from 'src/common';

/**
 * A permissive type of role guard. Roles are set via `@Roles` decorator.
 * @since 1.0.0
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesMetaDatas: RoleDecoratorOptionsInterface[] = [];

    const mergedRoleMetaData =
      this.reflector.getAllAndOverride<RoleDecoratorOptionsInterface>(
        META_ROLES,
        [context.getClass(), context.getHandler()],
      );

    if (mergedRoleMetaData) {
      rolesMetaDatas.push(mergedRoleMetaData);
    }

    const combinedRoles = rolesMetaDatas.flatMap((x) => x.roles);

    if (combinedRoles.length === 0) {
      return true;
    }

    // Use matching mode of first item
    const roleMetaData = rolesMetaDatas[0];
    const roleMatchingMode = roleMetaData.mode
      ? roleMetaData.mode
      : RoleMatchingMode.ANY;

    // Extract request
    const [request] = extractRequest(context);
    const userRoles = request?.user?.roles;

    // For verbose logging, we store it instead of returning it immediately
    const granted =
      roleMatchingMode === RoleMatchingMode.ANY
        ? combinedRoles.some((r) => userRoles.includes(r))
        : combinedRoles.every((r) => userRoles.includes(r));

    return granted;
  }
}
