import { User } from '../../domain/models/User';
import { Session, AuthCredentials, AuthResult } from '../../domain/models/Session';
import { SecureStorage } from '../security/SecureStorage';
import { SYSTEM_ROLES } from '../../domain/models/Role';

export interface AuthenticationProvider {
  login(credentials: AuthCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentSession(): Session | null;
  validateSession(): boolean;
  refreshSession(): Session | null;
  getUsers(): User[];
  updateUser(user: User): void;
}

/**
 * Default decoupled Client/Demo Authentication Provider
 * Prepared for plug-and-play connection with backend OAuth / OIDC / Firebase.
 */
export class DefaultAuthenticationProvider implements AuthenticationProvider {
  private static readonly SESSION_KEY = 'current_session';
  private static readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

  async login(credentials: AuthCredentials): Promise<AuthResult> {
    const users = this.getUsers();
    
    // Find user by email or demoRole
    let user = credentials.email 
      ? users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase())
      : null;

    if (!user && credentials.demoRole) {
      user = users.find(u => u.role === credentials.demoRole) || null;
    }

    if (!user) {
      return {
        success: false,
        errorCode: 'USER_NOT_FOUND',
        errorMessage: 'Usuario o correo electrónico no registrado en el sistema FOMAG.'
      };
    }

    // Check account status
    if (user.status === 'suspendido') {
      return {
        success: false,
        errorCode: 'USER_SUSPENDED',
        errorMessage: 'La cuenta de usuario se encuentra SUSPENDIDA. Contacte al Administrador.'
      };
    }

    if (user.status === 'bloqueado' || user.status === 'eliminado') {
      return {
        success: false,
        errorCode: 'USER_BLOCKED',
        errorMessage: 'Acceso denegado: cuenta inactiva o bloqueada por seguridad.'
      };
    }

    // Create secure session
    const now = new Date();
    const expiresAt = new Date(now.getTime() + DefaultAuthenticationProvider.SESSION_TIMEOUT_MS);
    
    const session: Session = {
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      ipsAssigned: user.ipsAssigned || (SYSTEM_ROLES[user.role]?.defaultIPSBehavior === 'ALL' ? ['all'] : []),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActivity: now.toISOString(),
      status: 'active',
      ipMetadata: '190.24.180.12 (Barranquilla, CO)'
    };

    SecureStorage.setItem(DefaultAuthenticationProvider.SESSION_KEY, session);
    
    // Update user last login
    user.lastLogin = now.toISOString();
    this.updateUser(user);

    return {
      success: true,
      user,
      session
    };
  }

  async logout(): Promise<void> {
    SecureStorage.clearSessionData();
  }

  getCurrentSession(): Session | null {
    const session = SecureStorage.getItem<Session | null>(DefaultAuthenticationProvider.SESSION_KEY, null);
    if (!session) return null;

    // Check if expired
    const now = new Date().getTime();
    const expiry = new Date(session.expiresAt).getTime();
    if (now > expiry || session.status !== 'active') {
      this.logout();
      return null;
    }

    return session;
  }

  validateSession(): boolean {
    const session = this.getCurrentSession();
    return session !== null && session.status === 'active';
  }

  refreshSession(): Session | null {
    const session = this.getCurrentSession();
    if (!session) return null;

    const now = new Date();
    session.lastActivity = now.toISOString();
    session.expiresAt = new Date(now.getTime() + DefaultAuthenticationProvider.SESSION_TIMEOUT_MS).toISOString();
    
    SecureStorage.setItem(DefaultAuthenticationProvider.SESSION_KEY, session);
    return session;
  }

  getUsers(): User[] {
    return SecureStorage.getItem<User[]>('registered_users', [
      {
        id: 'usr-admin-1',
        name: 'Dr. Alejandro Restrepo',
        email: 'admin.auditoria@minsalud.gov.co',
        role: 'Administrador',
        status: 'activo',
        specialty: 'Medicina Interna / Auditoría en Salud',
        regMedica: 'RM-08-44921',
        ipsAssigned: ['all'],
        createdAt: '2025-01-01'
      },
      {
        id: 'usr-auditor-1',
        name: 'Dra. Patricia Charry',
        email: 'p.charry@auditoria.co',
        role: 'Auditor',
        status: 'activo',
        specialty: 'Epidemiología y Auditoría Clínica',
        regMedica: 'RM-08-31204',
        ipsAssigned: ['ips-bonadona', 'ips-misericordia'],
        createdAt: '2025-01-15'
      },
      {
        id: 'usr-coord-1',
        name: 'Dr. Gabriel Echeverri',
        email: 'g.echeverri@auditoria.co',
        role: 'Coordinador',
        status: 'activo',
        specialty: 'Gerencia Hospitalaria',
        regMedica: 'RM-08-19882',
        ipsAssigned: ['all'],
        createdAt: '2025-01-20'
      },
      {
        id: 'usr-gerencia-1',
        name: 'Dra. María Jimena Santos',
        email: 'mj.santos@superintendencia.gov.co',
        role: 'Gerencia',
        status: 'activo',
        specialty: 'Dirección Médica y Garantía de Calidad',
        ipsAssigned: ['all'],
        createdAt: '2025-01-25'
      },
      {
        id: 'usr-consulta-1',
        name: 'Lic. Andrés Buelvas',
        email: 'a.buelvas@analitica.co',
        role: 'Solo lectura',
        status: 'activo',
        specialty: 'Analista de Datos Clínicos',
        ipsAssigned: ['ips-clinica-costa'],
        createdAt: '2025-02-01'
      },
      {
        id: 'usr-suspendido-1',
        name: 'Dr. Carlos Mendoza (Suspendido)',
        email: 'c.mendoza.susp@auditoria.co',
        role: 'Auditor',
        status: 'suspendido',
        specialty: 'Auditoría Médica',
        ipsAssigned: ['ips-bonadona'],
        createdAt: '2025-01-10'
      }
    ]);
  }

  updateUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    SecureStorage.setItem('registered_users', users);
  }
}

export const authProvider = new DefaultAuthenticationProvider();
