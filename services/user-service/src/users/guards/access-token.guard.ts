import { Injectable } from '@nestjs/common';
import { BaseJwtGuard } from '@fincommerce/common';
import { AccessTokenVerifierService } from '../../auth/access-token-verifier.service';

@Injectable()
export class AccessTokenGuard extends BaseJwtGuard {
  constructor(accessTokenVerifierService: AccessTokenVerifierService) {
    super(accessTokenVerifierService);
  }
}
