export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
}
