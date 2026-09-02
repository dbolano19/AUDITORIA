import { SystemRoleType } from './Role';

export type UserStatus = 'activo' | 'suspendido' | 'bloqueado' | 'eliminado';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: SystemRoleType;
  status: UserStatus;
  ipsAssigned: string[]; // e.g. ['all'] or ['ips-bonadona', 'ips-misericordia']
  specialty?: string;
  regMedica?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  failedLoginAttempts?: number;
  passwordHash?: string;
  customPermissions?: string[];
}

export type UserRole = SystemRoleType;
