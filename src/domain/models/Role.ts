import { Permission } from './Permission';

export type SystemRoleType =
  | 'Administrador'
  | 'Auditor'
  | 'Coordinador'
  | 'Gerencia'
  | 'Solo lectura';

export interface SystemRole {
  id: SystemRoleType;
  name: string;
  description: string;
  badgeColor: string;
  permissions: Permission[];
  canAccessFullHC: boolean;
  canManageUsers: boolean;
  defaultIPSBehavior: 'ALL' | 'ASSIGNED_ONLY';
}

/**
 * Standard Role Profiles configured according to the Principle of Least Privilege
 */
export const SYSTEM_ROLES: Record<SystemRoleType, SystemRole> = {
  Administrador: {
    id: 'Administrador',
    name: 'Administrador del Sistema',
    description: 'Control total de la plataforma, gestión de usuarios, roles, IPS, auditorías, configuración y trazabilidad integral.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    canAccessFullHC: true,
    canManageUsers: true,
    defaultIPSBehavior: 'ALL',
    permissions: [
      'users.read', 'users.create', 'users.update', 'users.delete',
      'ips.read', 'ips.manage',
      'hc.upload', 'hc.read', 'hc.delete',
      'audit.create', 'audit.read', 'audit.update', 'audit.close',
      'findings.read', 'findings.create', 'findings.update', 'findings.validate', 'findings.reject',
      'actions.read', 'actions.create', 'actions.update', 'actions.close',
      'reports.read', 'reports.generate', 'reports.export',
      'dashboard.read', 'dashboard.export',
      'settings.read', 'settings.update',
      'auditlog.read'
    ]
  },

  Auditor: {
    id: 'Auditor',
    name: 'Médico Auditor Concurrente',
    description: 'Carga y revisión de historias clínicas, ejecución de auditorías, validación/modificación de hallazgos, planes de acción 24h e informes asistenciales.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    canAccessFullHC: true,
    canManageUsers: false,
    defaultIPSBehavior: 'ASSIGNED_ONLY',
    permissions: [
      'ips.read',
      'hc.upload', 'hc.read',
      'audit.create', 'audit.read', 'audit.update',
      'findings.read', 'findings.create', 'findings.update', 'findings.validate', 'findings.reject',
      'actions.read', 'actions.create', 'actions.update', 'actions.close',
      'reports.read', 'reports.generate', 'reports.export',
      'dashboard.read',
      'settings.read'
    ]
  },

  Coordinador: {
    id: 'Coordinador',
    name: 'Coordinador de Auditoría en Salud',
    description: 'Supervisión de auditorías, seguimiento de compromisos 24h, consulta de indicadores de calidad y generación de informes oficiales consolidados.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    canAccessFullHC: false, // Access to HC is restricted or requires specific permission
    canManageUsers: false,
    defaultIPSBehavior: 'ALL',
    permissions: [
      'ips.read',
      'hc.read',
      'audit.read', 'audit.update', 'audit.close',
      'findings.read', 'findings.update', 'findings.validate',
      'actions.read', 'actions.create', 'actions.update', 'actions.close',
      'reports.read', 'reports.generate', 'reports.export',
      'dashboard.read', 'dashboard.export',
      'settings.read',
      'auditlog.read'
    ]
  },

  Gerencia: {
    id: 'Gerencia',
    name: 'Directiva y Gerencia FOMAG',
    description: 'Acceso a tableros gerenciales, indicadores consolidados, comparativos multicéntricos de IPS, tendencias e informes ejecutivos. Sin acceso a HC completa.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    canAccessFullHC: false, // Strict Rule: Gerencia cannot see full raw clinical record
    canManageUsers: false,
    defaultIPSBehavior: 'ALL',
    permissions: [
      'ips.read',
      'audit.read',
      'findings.read',
      'actions.read',
      'reports.read', 'reports.generate', 'reports.export',
      'dashboard.read', 'dashboard.export'
    ]
  },

  'Solo lectura': {
    id: 'Solo lectura',
    name: 'Consulta / Auditoría Externa',
    description: 'Visualización de indicadores, consolidados e informes autorizados en modo lectura estricta. Sin permisos de modificación ni carga.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    canAccessFullHC: false,
    canManageUsers: false,
    defaultIPSBehavior: 'ASSIGNED_ONLY',
    permissions: [
      'ips.read',
      'audit.read',
      'findings.read',
      'actions.read',
      'reports.read',
      'dashboard.read'
    ]
  }
};
