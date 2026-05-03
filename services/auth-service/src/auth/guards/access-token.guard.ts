import { Injectable } from '@nestjs/common';
import { BaseJwtGuard } from '@fincommerce/common';
import { AuthTokenService } from '../auth-token.service';

@Injectable()
export class AccessTokenGuard extends BaseJwtGuard {
  constructor(authTokenService: AuthTokenService) {
    super(authTokenService);
  }
}
