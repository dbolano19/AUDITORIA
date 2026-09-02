import React, { useState } from 'react';
import { Menu, Bell, Shield, RefreshCw, Building2, User as UserIcon, Lock } from 'lucide-react';
import { User, UserRole } from '../../types';
import { SYSTEM_ROLES, SystemRoleType } from '../../domain/models/Role';
import { UserProfileModal } from '../security/UserProfileModal';

interface NavbarProps {
  activeUser: User;
  onRoleChange: (role: UserRole) => void;
  onOpenMobileMenu: () => void;
  title: string;
  onResetData?: () => void;
  onSwitchUser?: (newUser: any) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeUser,
  onRoleChange,
  onOpenMobileMenu,
  title,
  onResetData,
  onSwitchUser,
  onLogout
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const roles: UserRole[] = ['Administrador', 'Auditor', 'Coordinador', 'Gerencia', 'Solo lectura'];

  const isAllIps = activeUser.ipsAssigned?.includes('all');

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
            <span className="hidden sm:inline-block text-slate-300">|</span>
            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 border border-slate-200">
                {isAllIps ? 'Todas las IPS (Barranquilla)' : `Sede: ${activeUser.ipsAssigned?.join(', ') || 'Sin Asignar'}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Role switcher & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reset Mock Data */}
          {onResetData && (
            <button
              onClick={onResetData}
              title="Restablecer datos de prueba"
              className="hidden md:flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          )}

          {/* Quick Role Switcher Pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
            <Shield className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
            <span className="text-slate-500 hidden md:inline font-medium">Rol:</span>
            <select
              value={activeUser.role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {roles.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* User Button / Modal Trigger */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:bg-slate-50 p-1 rounded-xl transition-colors cursor-pointer text-left"
            title="Ver perfil de usuario y alcance de seguridad"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {activeUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                {activeUser.name}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {activeUser.role}
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        user={activeUser as any}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSwitchUser={onSwitchUser}
        onLogout={onLogout}
      />
    </>
  );
};
