import { User } from '../../domain/models/User';
import { Session } from '../../domain/models/Session';
import { Permission } from '../../domain/models/Permission';
import { SYSTEM_ROLES, SystemRoleType } from '../../domain/models/Role';

export type UserOrSession = User | Session | null | undefined;

export class AuthorizeActionUseCase {
  /**
   * Helper to normalize user role from either User or Session
   */
  private static getUserRole(subject: UserOrSession): SystemRoleType | null {
    if (!subject) return null;
    if ('role' in subject) return subject.role;
    if ('userRole' in subject) return subject.userRole;
    return null;
  }

  /**
   * Helper to normalize assigned IPS list
   */
  private static getAssignedIPS(subject: UserOrSession): string[] {
    if (!subject) return [];
    if ('ipsAssigned' in subject && Array.isArray(subject.ipsAssigned)) {
      return subject.ipsAssigned;
    }
    return [];
  }

  /**
   * Checks if user is in active status (not suspended or blocked)
   */
  static isUserActive(subject: UserOrSession): boolean {
    if (!subject) return false;
    if ('status' in subject) {
      return subject.status === 'activo' || subject.status === 'active';
    }
    return true;
  }

  /**
   * Central authorization rule for IPS Segregation
   * Rule: A user can only access authorized IPS.
   */
  static canAccessIPS(subject: UserOrSession, ipsId: string): boolean {
    if (!subject || !this.isUserActive(subject)) return false;
    if (!ipsId) return false;

    const assigned = this.getAssignedIPS(subject);
    const role = this.getUserRole(subject);

    // If 'all' is explicitly in assigned list
    if (assigned.includes('all')) return true;

    // Direct match (e.g. 'ips-bonadona')
    if (assigned.includes(ipsId)) return true;

    // If role has default behavior ALL and no restrictive assignment
    if (role && SYSTEM_ROLES[role]?.defaultIPSBehavior === 'ALL' && assigned.length === 0) {
      return true;
    }

    return false;
  }

  /**
   * Checks granular permission based on role and custom permissions
   */
  static hasPermission(subject: UserOrSession, permission: Permission): boolean {
    if (!subject || !this.isUserActive(subject)) return false;
    
    const role = this.getUserRole(subject);
    if (!role) return false;

    const roleDef = SYSTEM_ROLES[role];
    if (!roleDef) return false;

    // Check if role contains the permission
    if (roleDef.permissions.includes(permission)) return true;

    // Check custom permissions if user model
    if ('customPermissions' in subject && Array.isArray(subject.customPermissions)) {
      if (subject.customPermissions.includes(permission)) return true;
    }

    return false;
  }

  /**
   * Information Level 3 (Clínico): Full Clinical Record
   * Requirement: Gerencia and unauthorized roles MUST NOT have access to full HC.
   */
  static canReadHC(subject: UserOrSession, ipsId?: string): boolean {
    if (!this.hasPermission(subject, 'hc.read')) return false;
    
    const role = this.getUserRole(subject);
    if (!role) return false;

    // Strict Rule: If role explicitly forbids full HC (e.g. Gerencia, Consulta), deny
    if (SYSTEM_ROLES[role]?.canAccessFullHC === false && role !== 'Administrador' && role !== 'Auditor') {
      return false;
    }

    if (ipsId && !this.canAccessIPS(subject, ipsId)) {
      return false;
    }

    return true;
  }

  /**
   * Permission to upload new HC PDFs
   */
  static canUploadHC(subject: UserOrSession, ipsId?: string): boolean {
    if (!this.hasPermission(subject, 'hc.upload')) return false;
    if (ipsId && !this.canAccessIPS(subject, ipsId)) return false;
    return true;
  }

  /**
   * Information Level 2 (Auditoría): Audit Process & Findings
   */
  static canReadAudit(subject: UserOrSession, ipsId?: string): boolean {
    if (!this.hasPermission(subject, 'audit.read')) return false;
    if (ipsId && !this.canAccessIPS(subject, ipsId)) return false;
    return true;
  }

  static canUpdateAudit(subject: UserOrSession, ipsId?: string): boolean {
    if (!this.hasPermission(subject, 'audit.update')) return false;
    if (ipsId && !this.canAccessIPS(subject, ipsId)) return false;
    return true;
  }

  static canValidateFinding(subject: UserOrSession, ipsId?: string): boolean {
    if (!this.hasPermission(subject, 'findings.validate')) return false;
    if (ipsId && !this.canAccessIPS(subject, ipsId)) return false;
    return true;
  }

  static canManageActions(subject: UserOrSession, ipsId?: string): boolean {
    if (!this.hasPermission(subject, 'actions.update') && !this.hasPermission(subject, 'actions.create')) {
      return false;
    }
    if (ipsId && !this.canAccessIPS(subject, ipsId)) return false;
    return true;
  }

  /**
   * Information Level 1 (Gerencial): Aggregated Metrics & Dashboard
   */
  static canReadDashboard(subject: UserOrSession): boolean {
    return this.hasPermission(subject, 'dashboard.read');
  }

  static canManageUsers(subject: UserOrSession): boolean {
    return this.hasPermission(subject, 'users.update') || this.hasPermission(subject, 'users.create');
  }

  static canExportData(subject: UserOrSession, ipsScope?: string[]): boolean {
    if (!this.hasPermission(subject, 'reports.export') && !this.hasPermission(subject, 'dashboard.export')) {
      return false;
    }

    // If specific IPS scope is requested, verify user has access to all requested IPS
    if (ipsScope && ipsScope.length > 0) {
      for (const ipsId of ipsScope) {
        if (ipsId !== 'all' && !this.canAccessIPS(subject, ipsId)) {
          return false;
        }
      }
    }

    return true;
  }
}
