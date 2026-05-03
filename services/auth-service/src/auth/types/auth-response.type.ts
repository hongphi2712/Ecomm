import { UserRole, UserStatus } from '@prisma/client';

export interface AuthUserResponse {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends Partial<TokenPair> {
  otpRequired?: boolean;
  user?: AuthUserResponse;
}
