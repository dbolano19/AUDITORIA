import { SystemRoleType } from './Role';

export type SessionStatus = 'active' | 'expired' | 'terminated';

export interface Session {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: SystemRoleType;
  ipsAssigned: string[];
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  ipMetadata?: string;
  userAgent?: string;
  status: SessionStatus;
  token?: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
  demoRole?: SystemRoleType;
}

export interface AuthResult {
  success: boolean;
  user?: import('./User').User;
  session?: Session;
  errorMessage?: string;
  errorCode?: 'INVALID_CREDENTIALS' | 'USER_SUSPENDED' | 'USER_BLOCKED' | 'USER_NOT_FOUND' | 'SESSION_EXPIRED';
}
