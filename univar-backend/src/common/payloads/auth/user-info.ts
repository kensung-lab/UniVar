import { ResourceAccess } from './resource-access';
import { RoleAccess } from './role-access';

export class UserInfo {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  realm_access: RoleAccess;
  resource_access: ResourceAccess;
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
  group: string[];
  groups: string[];
}
