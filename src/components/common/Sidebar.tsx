import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users2,
  ClipboardList,
  FileSearch,
  AlertOctagon,
  CheckSquare,
  BarChart3,
  FileText,
  Settings,
  BookOpen,
  ActivitySquare,
  Sparkles,
  ChevronRight,
  X,
  Users,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { User } from '../../types';
import { AuthorizeActionUseCase } from '../../application/auth/AuthorizeActionUseCase';

export type MainNavView =
  | 'dashboard'
  | 'ips'
  | 'multi_ips'
  | 'patients'
  | 'audits'
  | 'audit-hc'
  | 'findings'
  | 'actions'
  | 'indicators'
  | 'reports'
  | 'knowledge'
  | 'contextual_tests'
  | 'ingestion_tests'
  | 'users'
  | 'security_logs'
  | 'security_tests'
  | 'settings';

interface SidebarProps {
  currentView: MainNavView;
  onNavigate: (view: MainNavView) => void;
  activeUser: User;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  overdueActionsCount?: number;
  criticalFindingsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeUser,
  isOpenMobile,
  onCloseMobile,
  overdueActionsCount = 0,
  criticalFindingsCount = 0
}) => {
  const canManageUsers = AuthorizeActionUseCase.canManageUsers(activeUser as any);
  const canViewSecurityLogs = AuthorizeActionUseCase.hasPermission(activeUser as any, 'auditlog.read');

  const menuItems = [
    {
      id: 'dashboard' as MainNavView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      visible: true
    },
    {
      id: 'ips' as MainNavView,
      label: 'IPS',
      icon: Building2,
      badge: '3',
      visible: true
    },
    {
      id: 'multi_ips' as MainNavView,
      label: 'Comparativa IPS',
      icon: ActivitySquare,
      badge: 'Barranquilla',
      badgeColor: 'bg-indigo-600 text-white',
      visible: true
    },
    {
      id: 'patients' as MainNavView,
      label: 'Pacientes',
      icon: Users2,
      badge: null,
      visible: true
    },
    {
      id: 'audits' as MainNavView,
      label: 'Auditorías',
      icon: ClipboardList,
      badge: null,
      visible: true
    },
    {
      id: 'audit-hc' as MainNavView,
      label: 'Auditar HC',
      icon: FileSearch,
      highlight: true,
      badge: 'PDF',
      visible: AuthorizeActionUseCase.hasPermission(activeUser as any, 'hc.upload')
    },
    {
      id: 'findings' as MainNavView,
      label: 'Hallazgos',
      icon: AlertOctagon,
      badge: criticalFindingsCount > 0 ? `${criticalFindingsCount} crít.` : null,
      badgeColor: 'bg-rose-500 text-white',
      visible: true
    },
    {
      id: 'actions' as MainNavView,
      label: 'Acciones y seguimiento',
      icon: CheckSquare,
      badge: overdueActionsCount > 0 ? `${overdueActionsCount} venc.` : null,
      badgeColor: 'bg-amber-500 text-white',
      visible: true
    },
    {
      id: 'indicators' as MainNavView,
      label: 'Indicadores',
      icon: BarChart3,
      badge: null,
      visible: true
    },
    {
      id: 'reports' as MainNavView,
      label: 'Informes',
      icon: FileText,
      badge: null,
      visible: true
    },
    {
      id: 'users' as MainNavView,
      label: 'Usuarios y Roles',
      icon: Users,
      badge: null,
      visible: canManageUsers
    },
    {
      id: 'security_logs' as MainNavView,
      label: 'Historial de Seguridad',
      icon: ShieldAlert,
      badge: null,
      visible: canViewSecurityLogs
    },
    {
      id: 'security_tests' as MainNavView,
      label: 'Pruebas de Seguridad',
      icon: ShieldCheck,
      badge: '25 Casos',
      badgeColor: 'bg-emerald-600 text-white',
      visible: true
    },
    {
      id: 'knowledge' as MainNavView,
      label: 'Biblioteca Normativa',
      icon: BookOpen,
      badge: '40+',
      badgeColor: 'bg-indigo-600 text-white',
      visible: true
    },
    {
      id: 'ingestion_tests' as MainNavView,
      label: 'Pruebas Ingestión (PDF/OCR)',
      icon: FileSearch,
      badge: '12 Casos',
      badgeColor: 'bg-cyan-600 text-white',
      visible: true
    },
    {
      id: 'contextual_tests' as MainNavView,
      label: 'Suite Pruebas Clínicas',
      icon: Sparkles,
      badge: '20 Casos',
      badgeColor: 'bg-slate-700 text-slate-200',
      visible: true
    },
    {
      id: 'settings' as MainNavView,
      label: 'Configuración',
      icon: Settings,
      badge: null,
      visible: true
    }
  ].filter(i => i.visible);

  const handleNav = (view: MainNavView) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <ActivitySquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                AUDITORÍA IA
                <span className="text-[10px] font-semibold uppercase bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-400/30">
                  FOMAG
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">Concurrente Hospitalaria</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Scope Capsule */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Rol activo:</span>
            <span className="font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              {activeUser.role}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium truncate mt-1">
            {activeUser.name}
          </div>
          <div className="text-[10px] text-slate-400">
            Barranquilla · Atlántico (3 IPS)
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${item.highlight && !isActive ? 'ring-1 ring-cyan-500/30 bg-cyan-950/30 text-cyan-200' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || (isActive ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom AI Readiness Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="rounded-lg p-2.5 bg-slate-900 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Arquitectura IA Lista</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Carga y expediente estructurado activo para el motor clínico experto.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
