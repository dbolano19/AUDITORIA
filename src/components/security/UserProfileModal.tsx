import React from 'react';
import { User } from '../../domain/models/User';
import { SYSTEM_ROLES, SystemRoleType } from '../../domain/models/Role';
import { SYSTEM_PERMISSIONS } from '../../domain/models/Permission';
import { storageService } from '../../services/storageService';
import { Shield, Building2, Lock, UserCheck, Calendar, Clock, Key } from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSwitchUser?: (newUser: User) => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSwitchUser,
  onLogout
}) => {
  if (!isOpen) return null;

  const roleDef = SYSTEM_ROLES[user.role] || SYSTEM_ROLES['Auditor'];
  const allIps = storageService.getIPS();
  const allUsers = storageService.getUsers();

  const isAllIPS = user.ipsAssigned?.includes('all');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status and Role badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Rol del Sistema
            </span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-700" />
              <span className="text-xs font-bold text-slate-900">{user.role}</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-2">{roleDef.description}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Estado de la Cuenta
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              user.status === 'activo'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'activo' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              {user.status ? user.status.toUpperCase() : 'ACTIVO'}
            </span>
            <div className="text-[10px] text-slate-400">
              {roleDef.canAccessFullHC ? 'Acceso a HC completa habilitado' : 'Acceso a HC completa restringido'}
            </div>
          </div>
        </div>

        {/* Assigned IPS Scope */}
        <div className="space-y-2">
          <label className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyan-700" />
            <span>Sedes e IPS Autorizadas (Segregación Barranquilla)</span>
          </label>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5">
            {isAllIPS ? (
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                Todas las IPS (Bonadona, Misericordia, Clínica Costa)
              </span>
            ) : user.ipsAssigned && user.ipsAssigned.length > 0 ? (
              user.ipsAssigned.map(ipsId => {
                const found = allIps.find(i => i.id === ipsId);
                return (
                  <span key={ipsId} className="px-2 py-0.5 bg-white text-slate-800 rounded text-xs font-semibold border border-slate-200">
                    {found ? found.name : ipsId}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-amber-700">Sin IPS asignada</span>
            )}
          </div>
        </div>

        {/* Quick User Switcher for Testing (Requirement 46) */}
        {onSwitchUser && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-cyan-700" />
              <span>Cambiar Usuario de Prueba Rápido (Verificación de Segregación)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
              {allUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u);
                    onClose();
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer text-xs ${
                    u.id === user.id
                      ? 'bg-cyan-50 border-cyan-300 font-bold text-cyan-900'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold truncate">{u.name}</div>
                  <div className="text-[10px] text-slate-500">{u.role} · {u.ipsAssigned?.includes('all') ? 'Todas IPS' : u.ipsAssigned?.join(', ')}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {onLogout ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer"
            >
              Cerrar Sesión Segura
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
          >
            Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};
