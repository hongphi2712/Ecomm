import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AUTH_SCHEME_BEARER } from '../constants';
import { AuthenticatedUser, RequestWithContext } from '../types';

export interface JwtVerifier {
  verifyAccessToken(token: string): Promise<AuthenticatedUser>;
}

@Injectable()
export abstract class BaseJwtGuard implements CanActivate {
  protected constructor(private readonly jwtVerifier: JwtVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException({
        message: 'Missing bearer token',
        errorCode: 'UNAUTHORIZED'
      });
    }

    request.user = await this.jwtVerifier.verifyAccessToken(token);
    return true;
  }

  private extractBearerToken(request: RequestWithContext): string | undefined {
    const authorization = request.header('authorization');

    if (!authorization) {
      return undefined;
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== AUTH_SCHEME_BEARER || !token) {
      return undefined;
    }

    return token;
  }
}
