import { AuthorizeActionUseCase, UserOrSession } from '../../application/auth/AuthorizeActionUseCase';
import { Permission } from '../../domain/models/Permission';
import { AuditSecurityEventUseCase } from '../../application/security/AuditSecurityEventUseCase';

export class AuthorizationService {
  private static getUserName(subject: UserOrSession): string {
    if ('name' in subject && subject.name) return subject.name;
    if ('userName' in subject && subject.userName) return subject.userName;
    return 'Usuario';
  }

  private static getUserRole(subject: UserOrSession): string {
    if ('role' in subject && subject.role) return subject.role;
    if ('userRole' in subject && subject.userRole) return subject.userRole;
    return 'Sin rol';
  }

  private static getUserId(subject: UserOrSession): string {
    if ('id' in subject && subject.id) return subject.id;
    if ('userId' in subject && subject.userId) return subject.userId;
    return 'anon';
  }

  /**
   * Authorizes an action and records a log if denied
   */
  static checkPermission(subject: UserOrSession, permission: Permission, resource: string = 'General'): boolean {
    const isAllowed = AuthorizeActionUseCase.hasPermission(subject, permission);
    
    if (!isAllowed && subject) {
      AuditSecurityEventUseCase.logSecurityEvent({
        action: 'ACCESS_DENIED',
        module: 'Seguridad',
        resource: `${resource} [${permission}]`,
        result: 'DENEGADO',
        userId: this.getUserId(subject),
        userName: this.getUserName(subject),
        userRole: this.getUserRole(subject),
        details: `Intento no autorizado de ejecutar permiso '${permission}' sobre ${resource}`
      });
    }

    return isAllowed;
  }

  static canAccessIPS(subject: UserOrSession, ipsId: string, resource: string = 'IPS Data'): boolean {
    const isAllowed = AuthorizeActionUseCase.canAccessIPS(subject, ipsId);

    if (!isAllowed && subject) {
      AuditSecurityEventUseCase.logSecurityEvent({
        action: 'ACCESS_DENIED',
        module: 'Seguridad',
        resource: `${resource} [${ipsId}]`,
        result: 'DENEGADO',
        ipsId,
        userId: this.getUserId(subject),
        userName: this.getUserName(subject),
        userRole: this.getUserRole(subject),
        details: `Acceso bloqueado: El usuario no tiene asignada la IPS '${ipsId}'`
      });
    }

    return isAllowed;
  }

  static canReadHC(subject: UserOrSession, ipsId?: string): boolean {
    return AuthorizeActionUseCase.canReadHC(subject, ipsId);
  }
}
