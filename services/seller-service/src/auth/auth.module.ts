import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenVerifierService } from './access-token-verifier.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [AccessTokenVerifierService],
  exports: [AccessTokenVerifierService]
})
export class AuthModule {}
