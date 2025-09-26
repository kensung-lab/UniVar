import { SetMetadata } from '@nestjs/common';
import { RoleDecoratorOptionsInterface } from '../interfaces';

export const META_ROLES = 'roles';

/**
 * Keycloak user roles.
 * @param roleMetaData - meta data for roles and matching mode
 * @since 1.1.0
 */
export const Roles = (roleMetaData: RoleDecoratorOptionsInterface) =>
  SetMetadata(META_ROLES, roleMetaData);
