import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser, JwtVerifier } from '@fincommerce/common';

@Injectable()
export class AccessTokenVerifierService implements JwtVerifier {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    try {
      return await this.jwtService.verifyAsync<AuthenticatedUser>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')
      });
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid access token',
        errorCode: 'UNAUTHORIZED'
      });
    }
  }
}
