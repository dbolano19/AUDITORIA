/**
 * SEED DATA: Generated Audit Reports (FASE 6)
 * Initial reports with version history, SHA-256 hashes, double evidence, and validation audit logs.
 */

import { GeneratedAuditReport } from '../domain/models/AuditReport';

export const INITIAL_GENERATED_REPORTS: GeneratedAuditReport[] = [
  {
    id: 'rep-bon-001',
    reportCode: 'REP-2026-00145',
    auditId: 'AUD-000145',
    sessionId: 'session-bon-001',
    ipsId: 'ips-001',
    ipsName: 'Clínica Bonadona',
    patientId: 'pt-001',
    patientName: 'María Rodríguez de Pérez',
    type: 'INFORME_DETALLADO',
    status: 'FINAL',
    version: 2,
    generatedAt: '2026-09-01T09:30:00Z',
    generatedBy: 'Dra. Patricia Charry',
    auditorRole: 'Médico Auditor Concurrente',
    fileName: 'Auditoria_FOMAG_Bonadona_AUD-000145_2026-09-01.pdf',
    hash: 'a3f8c92b4510e19488d726b1c904fa18c0e29b15d677a28e3b44f2e918413ac8',
    findingsCount: {
      total: 5,
      confirmed: 3,
      modified: 1,
      rejected: 1,
      pendingEvidence: 0,
      notApplicable: 0,
      critical: 2
    },
    actions24hCount: 2,
    versionChanges: [
      {
        version: 1,
        timestamp: '2026-08-31T16:00:00Z',
        user: 'Dra. Patricia Charry',
        role: 'Auditor',
        summary: 'Generación inicial del borrador de auditoría tras procesamiento documental.'
      },
      {
        version: 2,
        timestamp: '2026-09-01T09:30:00Z',
        user: 'Dra. Patricia Charry',
        role: 'Auditor',
        summary: 'Revisión final: Modificación en hallazgo de interconsulta nefrológica (precisión de horario) y rechazo de alerta de estancia por resolución médica oportuna.'
      }
    ]
  },
  {
    id: 'rep-mis-002',
    reportCode: 'REP-2026-00146',
    auditId: 'AUD-000146',
    sessionId: 'session-mis-002',
    ipsId: 'ips-002',
    ipsName: 'Clínica Misericordia',
    patientId: 'pt-002',
    patientName: 'Carlos Alberto Restrepo',
    type: 'INFORME_DETALLADO',
    status: 'EN_REVISION',
    version: 1,
    generatedAt: '2026-09-01T10:15:00Z',
    generatedBy: 'Dr. Alejandro Morales',
    auditorRole: 'Médico Auditor Concurrente',
    fileName: 'Auditoria_FOMAG_Misericordia_AUD-000146_2026-09-01.pdf',
    hash: 'b712c49a0081d5f2991e4832a819c4d92039ba77e618f3a921d7482a1048b61c',
    findingsCount: {
      total: 4,
      confirmed: 2,
      modified: 0,
      rejected: 0,
      pendingEvidence: 2,
      notApplicable: 0,
      critical: 1
    },
    actions24hCount: 1,
    versionChanges: [
      {
        version: 1,
        timestamp: '2026-09-01T10:15:00Z',
        user: 'Dr. Alejandro Morales',
        role: 'Auditor',
        summary: 'Versión preliminar en revisión con 2 hallazgos pendientes de reporte de cultivo antibiótico.'
      }
    ]
  },
  {
    id: 'rep-exec-001',
    reportCode: 'REP-EXEC-2026-01',
    auditId: 'AUD-CONSOLIDADO-BAQ',
    ipsId: 'ips-001',
    ipsName: 'Clínica Bonadona',
    patientId: 'all',
    patientName: 'Consolidado Institucional',
    type: 'INFORME_EJECUTIVO',
    status: 'FINAL',
    version: 1,
    generatedAt: '2026-09-01T08:00:00Z',
    generatedBy: 'Dra. Patricia Charry',
    auditorRole: 'Médico Auditor Coordinador',
    fileName: 'Auditoria_FOMAG_Bonadona_EJECUTIVO_2026-09-01.pdf',
    hash: 'c820d581e28491bbca73918401bca284918e91823acbbd908127394812bc8192',
    findingsCount: {
      total: 31,
      confirmed: 28,
      modified: 3,
      rejected: 4,
      pendingEvidence: 1,
      notApplicable: 2,
      critical: 8
    },
    actions24hCount: 6,
    versionChanges: [
      {
        version: 1,
        timestamp: '2026-09-01T08:00:00Z',
        user: 'Dra. Patricia Charry',
        role: 'Auditor',
        summary: 'Informe ejecutivo de cierre mensual con matriz comparativa multi-IPS de Barranquilla.'
      }
    ]
  }
];
