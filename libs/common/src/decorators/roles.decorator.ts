import { SetMetadata } from '@nestjs/common';
import { ROLES_METADATA_KEY } from '../constants';
import { UserRole } from '../enums';

export const Roles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_METADATA_KEY, roles);
