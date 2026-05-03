import { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.type';

export interface RequestWithContext extends Request {
  correlationId?: string;
  user?: AuthenticatedUser;
}
