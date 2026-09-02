import { AuditLog, FindingTraceabilityRecord, SecurityActionType, SecurityEventResult } from '../../domain/models/AuditLog';
import { SecureStorage } from '../../infrastructure/security/SecureStorage';
import { PrivacyGuard } from '../../domain/services/PrivacyGuard';

const AUDIT_LOGS_KEY = 'fomag_security_audit_logs';
const TRACEABILITY_KEY = 'fomag_finding_traceability_logs';

export interface AuditLogFilterParams {
  userId?: string;
  action?: SecurityActionType | 'ALL';
  module?: string | 'ALL';
  result?: SecurityEventResult | 'ALL';
  ipsId?: string | 'ALL';
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export class AuditSecurityEventUseCase {
  /**
   * Logs a security or clinical event safely
   */
  static logSecurityEvent(params: {
    action: SecurityActionType;
    module: AuditLog['module'];
    resource: string;
    result: SecurityEventResult;
    userId?: string;
    userName?: string;
    userRole?: string;
    ipsId?: string;
    ipsName?: string;
    auditId?: string;
    findingId?: string;
    patientInternalId?: string;
    details: string;
    previousValue?: string;
    newValue?: string;
    metadata?: Record<string, any>;
  }): AuditLog {
    const logs = this.getAllLogs();

    // Sanitize details to prevent clinical text or raw PII from being stored in logs
    const sanitizedDetails = PrivacyGuard.sanitizeText(PrivacyGuard.sanitizeClinicalSnippet(params.details, 240));

    const newLog: AuditLog = {
      id: `sec_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: params.userId || 'usr-anon',
      userName: params.userName || 'Usuario Anónimo',
      userRole: params.userRole || 'Sin Rol',
      action: params.action,
      module: params.module,
      resource: params.resource,
      result: params.result,
      ipsId: params.ipsId,
      ipsName: params.ipsName,
      auditId: params.auditId,
      findingId: params.findingId,
      patientInternalId: params.patientInternalId,
      details: sanitizedDetails,
      ipAddress: '190.24.180.12 (Barranquilla, CO)',
      previousValue: params.previousValue,
      newValue: params.newValue,
      metadata: params.metadata
    };

    // Store log (keep last 500 logs)
    const updated = [newLog, ...logs].slice(0, 500);
    SecureStorage.setItem(AUDIT_LOGS_KEY, updated);

    return newLog;
  }

  /**
   * Logs finding traceability with before/after state, user, date, and reason
   */
  static logFindingTraceability(record: Omit<FindingTraceabilityRecord, 'id' | 'timestamp'>): FindingTraceabilityRecord {
    const history = this.getAllTraceabilityRecords();
    
    const entry: FindingTraceabilityRecord = {
      id: `trace_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...record
    };

    const updated = [entry, ...history].slice(0, 1000);
    SecureStorage.setItem(TRACEABILITY_KEY, updated);

    // Also log in main security audit trail
    this.logSecurityEvent({
      action: record.newStatus === 'Confirmado' ? 'VALIDATE_FINDING' : (record.newStatus === 'Rechazado' ? 'REJECT_FINDING' : 'UPDATE_FINDING'),
      module: 'Hallazgos',
      resource: `Hallazgo ${record.findingId}`,
      result: 'EXITOSO',
      userId: record.modifiedByUserId,
      userName: record.modifiedByUserName,
      userRole: record.modifiedByUserRole,
      findingId: record.findingId,
      previousValue: record.previousStatus,
      newValue: record.newStatus,
      details: `Estado cambiado de '${record.previousStatus || 'IA Draft'}' a '${record.newStatus}'. Motivo: ${record.comment}`
    });

    return entry;
  }

  static getAllLogs(): AuditLog[] {
    return SecureStorage.getItem<AuditLog[]>(AUDIT_LOGS_KEY, [
      {
        id: 'sec_log_seed_1',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        userId: 'usr-admin-1',
        userName: 'Dr. Alejandro Restrepo',
        userRole: 'Administrador',
        action: 'LOGIN',
        module: 'Autenticación',
        resource: 'Portal FOMAG',
        result: 'EXITOSO',
        details: 'Inicio de sesión exitoso con credenciales institucionales seguras.',
        ipAddress: '190.24.180.12'
      },
      {
        id: 'sec_log_seed_2',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        userId: 'usr-auditor-1',
        userName: 'Dra. Patricia Charry',
        userRole: 'Auditor',
        action: 'UPLOAD_HC',
        module: 'Historia Clínica',
        resource: 'HC_Bonadona_PAC-001.pdf',
        ipsId: 'ips-bonadona',
        ipsName: 'Clínica Bonadona Prevenir',
        result: 'EXITOSO',
        patientInternalId: 'PAC-001290',
        details: 'Carga de historia clínica PDF validada con firma SHA-256 e integridad documental.'
      },
      {
        id: 'sec_log_seed_3',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        userId: 'usr-auditor-1',
        userName: 'Dra. Patricia Charry',
        userRole: 'Auditor',
        action: 'VALIDATE_FINDING',
        module: 'Hallazgos',
        resource: 'Hallazgo H-BON-001',
        ipsId: 'ips-bonadona',
        result: 'EXITOSO',
        findingId: 'H-BON-001',
        details: 'Validación clínica y confirmación de hallazgo sobre estancia prolongada en UCI.'
      }
    ]);
  }

  static getAllTraceabilityRecords(): FindingTraceabilityRecord[] {
    return SecureStorage.getItem<FindingTraceabilityRecord[]>(TRACEABILITY_KEY, [
      {
        id: 'trace_seed_1',
        findingId: 'f-bon-1',
        previousStatus: 'Generado por IA',
        newStatus: 'Confirmado',
        modifiedByUserId: 'usr-auditor-1',
        modifiedByUserName: 'Dra. Patricia Charry',
        modifiedByUserRole: 'Auditor',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        comment: 'Evidencia documental verificada en folios 12 a 14 de la evolución médica.',
        reason: 'Incumplimiento de oportunidad en paraclínico de control'
      }
    ]);
  }

  static getTraceabilityForFinding(findingId: string): FindingTraceabilityRecord[] {
    return this.getAllTraceabilityRecords().filter(r => r.findingId === findingId);
  }

  static queryLogs(filters: AuditLogFilterParams): AuditLog[] {
    let logs = this.getAllLogs();

    if (filters.userId && filters.userId !== 'ALL') {
      logs = logs.filter(l => l.userId === filters.userId);
    }

    if (filters.action && filters.action !== 'ALL') {
      logs = logs.filter(l => l.action === filters.action);
    }

    if (filters.module && filters.module !== 'ALL') {
      logs = logs.filter(l => l.module === filters.module);
    }

    if (filters.result && filters.result !== 'ALL') {
      logs = logs.filter(l => l.result === filters.result);
    }

    if (filters.ipsId && filters.ipsId !== 'ALL') {
      logs = logs.filter(l => l.ipsId === filters.ipsId);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      logs = logs.filter(l => 
        l.userName.toLowerCase().includes(term) ||
        l.details.toLowerCase().includes(term) ||
        l.resource.toLowerCase().includes(term) ||
        (l.patientInternalId && l.patientInternalId.toLowerCase().includes(term))
      );
    }

    return logs;
  }
}
