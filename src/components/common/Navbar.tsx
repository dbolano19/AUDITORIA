import React from 'react';
import { Menu, Bell, Shield, RefreshCw } from 'lucide-react';
import { User, UserRole } from '../../types';
import { storageService } from '../../services/storageService';

interface NavbarProps {
  activeUser: User;
  onRoleChange: (role: UserRole) => void;
  onOpenMobileMenu: () => void;
  title: string;
  onResetData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeUser,
  onRoleChange,
  onOpenMobileMenu,
  title,
  onResetData
}) => {
  const roles: UserRole[] = ['Administrador', 'Auditor', 'Coordinador', 'Supervisor', 'Consulta'];

  return (
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
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
            IPS: Bonadona · Misericordia · Costa
          </span>
        </div>
      </div>

      {/* Right Controls: Role switcher & User */}
      <div className="flex items-center gap-3">
        {/* Reset Mock Data (Helpful for demo) */}
        {onResetData && (
          <button
            onClick={onResetData}
            title="Restablecer datos de prueba"
            className="hidden md:flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reiniciar datos</span>
          </button>
        )}

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-xs">
          <Shield className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
          <span className="text-slate-500 hidden md:inline">Rol:</span>
          <select
            value={activeUser.role}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
          >
            {roles.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {activeUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
              {activeUser.name}
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {activeUser.specialty || activeUser.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
