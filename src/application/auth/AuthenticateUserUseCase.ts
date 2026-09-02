import { AuthenticationProvider, authProvider } from '../../infrastructure/auth/AuthenticationProvider';
import { AuthCredentials, AuthResult, Session } from '../../domain/models/Session';
import { AuditSecurityEventUseCase } from '../security/AuditSecurityEventUseCase';

export class AuthenticateUserUseCase {
  constructor(private provider: AuthenticationProvider = authProvider) {}

  async executeLogin(credentials: AuthCredentials): Promise<AuthResult> {
    const result = await this.provider.login(credentials);

    if (result.success && result.user && result.session) {
      AuditSecurityEventUseCase.logSecurityEvent({
        action: 'LOGIN',
        module: 'Autenticación',
        resource: 'Portal FOMAG',
        result: 'EXITOSO',
        userId: result.user.id,
        userName: result.user.name,
        userRole: result.user.role,
        details: `Inicio de sesión exitoso como ${result.user.name} (${result.user.role}).`
      });
    } else {
      AuditSecurityEventUseCase.logSecurityEvent({
        action: 'LOGIN',
        module: 'Autenticación',
        resource: 'Portal FOMAG',
        result: 'DENEGADO',
        userId: 'usr-unauthenticated',
        userName: credentials.email || 'Desconocido',
        userRole: credentials.demoRole || 'Sin Rol',
        details: `Fallo de autenticación: ${result.errorMessage || 'Credenciales no válidas'}`
      });
    }

    return result;
  }

  async executeLogout(currentSession?: Session | null): Promise<void> {
    if (currentSession) {
      AuditSecurityEventUseCase.logSecurityEvent({
        action: 'LOGOUT',
        module: 'Autenticación',
        resource: 'Portal FOMAG',
        result: 'EXITOSO',
        userId: currentSession.userId,
        userName: currentSession.userName,
        userRole: currentSession.userRole,
        details: `Cierre de sesión seguro y terminación de sesión ${currentSession.sessionId}.`
      });
    }
    await this.provider.logout();
  }

  getCurrentSession(): Session | null {
    return this.provider.getCurrentSession();
  }

  validateSession(): boolean {
    return this.provider.validateSession();
  }

  refreshSession(): Session | null {
    return this.provider.refreshSession();
  }
}

export const authenticateUserUseCase = new AuthenticateUserUseCase();
