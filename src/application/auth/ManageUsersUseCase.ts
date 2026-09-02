import { User, UserStatus } from '../../domain/models/User';
import { SystemRoleType } from '../../domain/models/Role';
import { authProvider } from '../../infrastructure/auth/AuthenticationProvider';
import { AuditSecurityEventUseCase } from '../security/AuditSecurityEventUseCase';

export class ManageUsersUseCase {
  static getUsers(): User[] {
    return authProvider.getUsers();
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  static createUser(params: {
    name: string;
    email: string;
    role: SystemRoleType;
    ipsAssigned?: string[];
    specialty?: string;
    regMedica?: string;
    phone?: string;
    adminUser: User;
  }): User {
    const users = this.getUsers();
    
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      role: params.role,
      status: 'activo',
      ipsAssigned: params.ipsAssigned && params.ipsAssigned.length > 0 ? params.ipsAssigned : (params.role === 'Administrador' || params.role === 'Gerencia' ? ['all'] : []),
      specialty: params.specialty?.trim() || 'Auditoría Concurrente',
      regMedica: params.regMedica?.trim(),
      phone: params.phone?.trim(),
      createdAt: new Date().toISOString()
    };

    authProvider.updateUser(newUser);

    AuditSecurityEventUseCase.logSecurityEvent({
      action: 'UPDATE_USER',
      module: 'Usuarios',
      resource: `Usuario ${newUser.name}`,
      result: 'EXITOSO',
      userId: params.adminUser.id,
      userName: params.adminUser.name,
      userRole: params.adminUser.role,
      details: `Creación de nuevo usuario ${newUser.name} (${newUser.email}) con rol ${newUser.role} e IPS [${newUser.ipsAssigned.join(', ')}]`
    });

    return newUser;
  }

  static updateUser(user: User, adminUser: User): void {
    const existing = this.getUserById(user.id);
    authProvider.updateUser(user);

    AuditSecurityEventUseCase.logSecurityEvent({
      action: 'UPDATE_USER',
      module: 'Usuarios',
      resource: `Usuario ${user.name}`,
      result: 'EXITOSO',
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      previousValue: existing ? `${existing.role} | ${existing.status} | IPS: [${existing.ipsAssigned?.join(', ')}]` : undefined,
      newValue: `${user.role} | ${user.status} | IPS: [${user.ipsAssigned?.join(', ')}]`,
      details: `Modificación de parámetros del usuario ${user.name}`
    });
  }

  static changeUserStatus(userId: string, status: UserStatus, adminUser: User): void {
    const user = this.getUserById(userId);
    if (!user) return;

    const prevStatus = user.status;
    user.status = status;
    authProvider.updateUser(user);

    const action = status === 'suspendido' ? 'SUSPEND_USER' : (status === 'activo' ? 'REACTIVATE_USER' : 'UPDATE_USER');

    AuditSecurityEventUseCase.logSecurityEvent({
      action,
      module: 'Usuarios',
      resource: `Usuario ${user.name}`,
      result: 'EXITOSO',
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      previousValue: prevStatus,
      newValue: status,
      details: `Estado de cuenta cambiado a '${status}' para el usuario ${user.name}`
    });
  }

  static assignIPS(userId: string, ipsIds: string[], adminUser: User): void {
    const user = this.getUserById(userId);
    if (!user) return;

    const prevIps = user.ipsAssigned || [];
    user.ipsAssigned = ipsIds;
    authProvider.updateUser(user);

    AuditSecurityEventUseCase.logSecurityEvent({
      action: 'UPDATE_PERMISSIONS',
      module: 'Usuarios',
      resource: `Usuario ${user.name}`,
      result: 'EXITOSO',
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      previousValue: prevIps.join(', '),
      newValue: ipsIds.join(', '),
      details: `Asignación de alcance de IPS actualizada para ${user.name}: [${ipsIds.join(', ')}]`
    });
  }
}
