export type SecurityActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'UPLOAD_HC'
  | 'VIEW_HC'
  | 'DELETE_HC'
  | 'CREATE_AUDIT'
  | 'EXECUTE_AUDIT'
  | 'UPDATE_AUDIT'
  | 'CLOSE_AUDIT'
  | 'CREATE_FINDING'
  | 'UPDATE_FINDING'
  | 'VALIDATE_FINDING'
  | 'REJECT_FINDING'
  | 'CREATE_ACTION'
  | 'UPDATE_ACTION_STATUS'
  | 'CLOSE_ACTION'
  | 'GENERATE_REPORT'
  | 'EXPORT_DATA'
  | 'UPDATE_CONFIG'
  | 'UPDATE_PERMISSIONS'
  | 'UPDATE_USER'
  | 'SUSPEND_USER'
  | 'REACTIVATE_USER'
  | 'ACCESS_DENIED'
  | 'SECURITY_ALERT';

export type SecurityEventResult = 'EXITOSO' | 'DENEGADO' | 'ADVERTENCIA' | 'ERROR';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: SecurityActionType;
  module: 'Autenticación' | 'Historia Clínica' | 'Auditoría Concurrente' | 'Hallazgos' | 'Acciones 24h' | 'Informes' | 'Dashboard' | 'Usuarios' | 'Configuración' | 'Seguridad';
  resource: string;
  result: SecurityEventResult;
  ipsId?: string;
  ipsName?: string;
  auditId?: string;
  findingId?: string;
  patientInternalId?: string; // Anonymized, e.g. PAC-000123
  details: string;
  ipAddress?: string;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
}

export interface FindingTraceabilityRecord {
  id: string;
  findingId: string;
  previousStatus?: string;
  newStatus: string;
  previousValue?: string;
  newValue?: string;
  modifiedByUserId: string;
  modifiedByUserName: string;
  modifiedByUserRole: string;
  timestamp: string;
  comment: string;
  reason?: string;
  evidencePageRef?: number;
}
