import React, { useState } from 'react';
import {
  Users,
  Shield,
  Plus,
  Edit2,
  Lock,
  Unlock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { User, UserStatus } from '../../domain/models/User';
import { SYSTEM_ROLES, SystemRoleType } from '../../domain/models/Role';
import { ManageUsersUseCase } from '../../application/auth/ManageUsersUseCase';
import { storageService } from '../../services/storageService';
import { AuthorizeActionUseCase } from '../../application/auth/AuthorizeActionUseCase';

interface UserManagementViewProps {
  activeUser: User;
  onUserUpdated?: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  activeUser,
  onUserUpdated
}) => {
  const [users, setUsers] = useState<User[]>(() => ManageUsersUseCase.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: SystemRoleType;
    specialty: string;
    regMedica: string;
    phone: string;
    ipsAssigned: string[];
    status: UserStatus;
  }>({
    name: '',
    email: '',
    role: 'Auditor',
    specialty: 'Auditoría Concurrente',
    regMedica: '',
    phone: '',
    ipsAssigned: ['ips-bonadona'],
    status: 'activo'
  });

  const [notification, setNotification] = useState<string | null>(null);

  const availableIPS = storageService.getIPS();
  const canManage = AuthorizeActionUseCase.canManageUsers(activeUser);

  const refreshList = () => {
    const fresh = ManageUsersUseCase.getUsers();
    setUsers(fresh);
    if (onUserUpdated) onUserUpdated();
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Auditor',
      specialty: 'Médico Auditor Concurrente',
      regMedica: '',
      phone: '',
      ipsAssigned: ['ips-bonadona'],
      status: 'activo'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: user.specialty || '',
      regMedica: user.regMedica || '',
      phone: user.phone || '',
      ipsAssigned: user.ipsAssigned || [],
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        specialty: formData.specialty.trim(),
        regMedica: formData.regMedica.trim(),
        phone: formData.phone.trim(),
        ipsAssigned: formData.ipsAssigned,
        status: formData.status
      };
      ManageUsersUseCase.updateUser(updated, activeUser);
      setNotification(`Usuario "${updated.name}" actualizado exitosamente.`);
    } else {
      const created = ManageUsersUseCase.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        specialty: formData.specialty,
        regMedica: formData.regMedica,
        phone: formData.phone,
        ipsAssigned: formData.ipsAssigned,
        adminUser: activeUser
      });
      setNotification(`Usuario "${created.name}" registrado en la plataforma.`);
    }

    setIsModalOpen(false);
    refreshList();
    setTimeout(() => setNotification(null), 3500);
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus: UserStatus = user.status === 'activo' ? 'suspendido' : 'activo';
    ManageUsersUseCase.changeUserStatus(user.id, nextStatus, activeUser);
    setNotification(`Estado del usuario "${user.name}" cambiado a ${nextStatus.toUpperCase()}.`);
    refreshList();
    setTimeout(() => setNotification(null), 3500);
  };

  const handleToggleIPS = (ipsId: string) => {
    if (ipsId === 'all') {
      setFormData(prev => ({
        ...prev,
        ipsAssigned: prev.ipsAssigned.includes('all') ? [] : ['all']
      }));
      return;
    }

    setFormData(prev => {
      let next = prev.ipsAssigned.filter(id => id !== 'all');
      if (next.includes(ipsId)) {
        next = next.filter(id => id !== ipsId);
      } else {
        next.push(ipsId);
      }
      return { ...prev, ipsAssigned: next };
    });
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.specialty && u.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  if (!canManage) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-rose-900">Acceso Restringido - Control de Seguridad</h2>
          <p className="text-sm text-rose-700">
            El módulo de <strong>Administración de Usuarios y Roles</strong> requiere el rol de <strong>Administrador</strong> con permisos <code className="bg-rose-200/60 px-1.5 py-0.5 rounded text-xs">users.update</code>.
          </p>
          <p className="text-xs text-slate-500">
            Su sesión actual está autenticada como: <span className="font-bold">{activeUser.name} ({activeUser.role})</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Administración de Usuarios y Control de Acceso</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Segregación Estricta
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Gestión centralizada de cuentas, asignación de roles, segregación por IPS de Barranquilla y permisos granulares.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Usuario</span>
        </button>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Roles & Permissions Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(SYSTEM_ROLES) as SystemRoleType[]).map(roleKey => {
          const roleDef = SYSTEM_ROLES[roleKey];
          const count = users.filter(u => u.role === roleKey).length;
          return (
            <div key={roleKey} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">{roleDef.name.split(' ')[0]}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${roleDef.badgeColor}`}>
                  {count} {count === 1 ? 'usr' : 'usrs'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{roleDef.description}</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex items-center justify-between">
                <span>HC Completa:</span>
                <strong className={roleDef.canAccessFullHC ? 'text-emerald-700' : 'text-slate-500'}>
                  {roleDef.canAccessFullHC ? 'Sí' : 'Restringida'}
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o especialidad..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 text-[11px]">Rol:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
            >
              <option value="ALL">Todos los roles</option>
              {(Object.keys(SYSTEM_ROLES) as SystemRoleType[]).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 text-[11px]">Estado:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
            >
              <option value="ALL">Todos</option>
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Usuario / Profesional</th>
                <th className="p-3.5">Rol y Perfil</th>
                <th className="p-3.5">IPS Autorizadas</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Último Acceso</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(u => {
                const roleDef = SYSTEM_ROLES[u.role] || SYSTEM_ROLES['Auditor'];
                const isAllIPS = u.ipsAssigned?.includes('all');
                
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                          {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.id === activeUser.id && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          {u.specialty && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{u.specialty} {u.regMedica ? `· ${u.regMedica}` : ''}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${roleDef.badgeColor}`}>
                        <Shield className="w-3 h-3 shrink-0" />
                        {u.role}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {roleDef.canAccessFullHC ? 'Acceso a HC habilitado' : 'Sin acceso a HC completa'}
                      </div>
                    </td>

                    <td className="p-3.5">
                      {isAllIPS ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                          <Building2 className="w-3 h-3" />
                          Todas las IPS (Barranquilla)
                        </span>
                      ) : u.ipsAssigned && u.ipsAssigned.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {u.ipsAssigned.map(ipsId => {
                            const ips = availableIPS.find(i => i.id === ipsId);
                            return (
                              <span
                                key={ipsId}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200"
                              >
                                {ips ? ips.name.replace('Clínica ', '') : ipsId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                          Sin IPS asignada
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.status === 'suspendido'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'activo' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      }) : 'Pendiente primer login'}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar usuario y permisos"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.status === 'activo'
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'activo' ? 'Suspender usuario' : 'Reactivar usuario'}
                        >
                          {u.status === 'activo' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-700" />
                <span>{editingUser ? 'Editar Usuario y Alcance' : 'Registrar Nuevo Usuario'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Dr. Mario Conde"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Correo Electrónico Institucional *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="m.conde@auditoria.co"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Rol del Sistema *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as SystemRoleType })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    {(Object.keys(SYSTEM_ROLES) as SystemRoleType[]).map(r => (
                      <option key={r} value={r}>
                        {r} - {SYSTEM_ROLES[r].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Estado de la Cuenta</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Especialidad / Cargo</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Ej. Medicina Interna / Auditoría"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Registro Médico (Opcional)</label>
                  <input
                    type="text"
                    value={formData.regMedica}
                    onChange={e => setFormData({ ...formData, regMedica: e.target.value })}
                    placeholder="RM-08-XXXXX"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Segregación de IPS Assignment */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-cyan-700" />
                    <span>Alcance y Segregación de IPS (Barranquilla)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Control Obligatorio</span>
                </div>

                <p className="text-[11px] text-slate-500">
                  El usuario solo podrá visualizar historias clínicas, hallazgos y auditorías de las IPS seleccionadas.
                </p>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 p-1">
                    <input
                      type="checkbox"
                      checked={formData.ipsAssigned.includes('all')}
                      onChange={() => handleToggleIPS('all')}
                      className="rounded text-cyan-700 focus:ring-cyan-700"
                    />
                    <span>Acceso a TODAS las IPS (Directivo / Coordinación General)</span>
                  </label>

                  {!formData.ipsAssigned.includes('all') && (
                    <div className="pl-6 pt-1 space-y-1.5">
                      {availableIPS.map(ips => (
                        <label key={ips.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.ipsAssigned.includes(ips.id)}
                            onChange={() => handleToggleIPS(ips.id)}
                            className="rounded text-cyan-700 focus:ring-cyan-700"
                          />
                          <span>{ips.name} ({ips.city})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
