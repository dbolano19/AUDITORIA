/**
 * Granular Permissions for FOMAG Intelligent Document Audit System
 */
export type Permission =
  // User Management
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  
  // IPS Management & Scope
  | 'ips.read'
  | 'ips.manage'
  
  // Clinical History & Evidence Documents
  | 'hc.upload'
  | 'hc.read'
  | 'hc.delete'
  
  // Concurrent & Retrospective Audits
  | 'audit.create'
  | 'audit.read'
  | 'audit.update'
  | 'audit.close'
  
  // Clinical Findings & Validation
  | 'findings.read'
  | 'findings.create'
  | 'findings.update'
  | 'findings.validate'
  | 'findings.reject'
  
  // Action Plans & 24h Commitments
  | 'actions.read'
  | 'actions.create'
  | 'actions.update'
  | 'actions.close'
  
  // Official Reports
  | 'reports.read'
  | 'reports.generate'
  | 'reports.export'
  
  // Executive Dashboard & Indicators
  | 'dashboard.read'
  | 'dashboard.export'
  
  // System Settings & Knowledge Library
  | 'settings.read'
  | 'settings.update'
  
  // Security History & Audit Logs
  | 'auditlog.read';

export interface PermissionDefinition {
  code: Permission;
  name: string;
  category: 'Usuarios' | 'IPS' | 'Historia Clínica' | 'Auditoría' | 'Hallazgos' | 'Acciones' | 'Informes' | 'Dashboard' | 'Configuración' | 'Seguridad';
  description: string;
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  { code: 'users.read', name: 'Consultar Usuarios', category: 'Usuarios', description: 'Permite ver el censo y perfiles de usuarios' },
  { code: 'users.create', name: 'Crear Usuarios', category: 'Usuarios', description: 'Permite registrar nuevos usuarios en el sistema' },
  { code: 'users.update', name: 'Modificar Usuarios', category: 'Usuarios', description: 'Permite editar roles, estados e IPS asignadas' },
  { code: 'users.delete', name: 'Eliminar/Suspender Usuarios', category: 'Usuarios', description: 'Permite dar de baja o suspender usuarios' },

  { code: 'ips.read', name: 'Consultar IPS', category: 'IPS', description: 'Permite ver el directorio y sedes de IPS autorizadas' },
  { code: 'ips.manage', name: 'Administrar IPS', category: 'IPS', description: 'Permite configurar y parametrizar sedes hospitalarias' },

  { code: 'hc.upload', name: 'Cargar Historia Clínica', category: 'Historia Clínica', description: 'Permite subir expedientes clínicos en formato PDF' },
  { code: 'hc.read', name: 'Consultar Historia Clínica Completa', category: 'Historia Clínica', description: 'Acceso a folios y texto clínico sensible' },
  { code: 'hc.delete', name: 'Eliminar Expedientes', category: 'Historia Clínica', description: 'Permite revocar o archivar documentos clínicos' },

  { code: 'audit.create', name: 'Crear Auditoría', category: 'Auditoría', description: 'Permite aperturar nuevos procesos de auditoría' },
  { code: 'audit.read', name: 'Consultar Auditorías', category: 'Auditoría', description: 'Permite ver listas y estados de auditorías autorizadas' },
  { code: 'audit.update', name: 'Modificar Auditoría', category: 'Auditoría', description: 'Permite editar notas de evolución y valoraciones' },
  { code: 'audit.close', name: 'Cerrar Auditoría', category: 'Auditoría', description: 'Permite formalizar y finalizar auditorías concurrentes' },

  { code: 'findings.read', name: 'Consultar Hallazgos', category: 'Hallazgos', description: 'Permite ver hallazgos clínicos detectados' },
  { code: 'findings.create', name: 'Crear Hallazgos', category: 'Hallazgos', description: 'Permite registrar hallazgos de forma manual o asistida' },
  { code: 'findings.update', name: 'Modificar Hallazgos', category: 'Hallazgos', description: 'Permite editar descripciones, criterios y prioridades' },
  { code: 'findings.validate', name: 'Validar/Confirmar Hallazgos', category: 'Hallazgos', description: 'Autoridad clínica para confirmar hallazgos' },
  { code: 'findings.reject', name: 'Rechazar/Desestimar Hallazgos', category: 'Hallazgos', description: 'Permite descartar observaciones que no constituyen no conformidad' },

  { code: 'actions.read', name: 'Consultar Acciones', category: 'Acciones', description: 'Permite visualizar compromisos y planes de acción 24h' },
  { code: 'actions.create', name: 'Crear Acciones 24h', category: 'Acciones', description: 'Permite generar planes de acción correctiva y preventiva' },
  { code: 'actions.update', name: 'Actualizar Seguimiento', category: 'Acciones', description: 'Permite registrar notas de seguimiento y responsables' },
  { code: 'actions.close', name: 'Cerrar Acciones', category: 'Acciones', description: 'Permite dar por cumplidos los compromisos asistenciales' },

  { code: 'reports.read', name: 'Consultar Informes', category: 'Informes', description: 'Permite consultar informes oficiales generados' },
  { code: 'reports.generate', name: 'Generar Informes', category: 'Informes', description: 'Permite emitir reportes de auditoría y gerenciales' },
  { code: 'reports.export', name: 'Exportar Informes (PDF/Excel)', category: 'Informes', description: 'Permite descargar archivos formales' },

  { code: 'dashboard.read', name: 'Consultar Dashboard Gerencial', category: 'Dashboard', description: 'Acceso a tableros, indicadores consolidados y comparativo' },
  { code: 'dashboard.export', name: 'Exportar Métricas', category: 'Dashboard', description: 'Permite descargar matrices de datos del dashboard' },

  { code: 'settings.read', name: 'Consultar Parámetros', category: 'Configuración', description: 'Permite consultar bibliotecas normativas y parámetros' },
  { code: 'settings.update', name: 'Actualizar Parámetros', category: 'Configuración', description: 'Permite modificar configuración y reglas institucionales' },

  { code: 'auditlog.read', name: 'Consultar Historial de Seguridad', category: 'Seguridad', description: 'Acceso a registros de trazabilidad y eventos de seguridad' }
];
