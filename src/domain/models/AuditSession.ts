/**
 * DOMAIN MODEL: AuditSession (FASE 5)
 * Structured audit session representing Initial, Follow-up, or Re-audit encounters.
 */

import { PatientClinicalContext, GlobalAuditTrafficLight } from './PatientClinicalContext';
import { ClinicalProblemMap } from './ClinicalProblemMap';
import { ClinicalAuditRiskMap } from './ClinicalAuditRiskMap';
import { ContextualFinding, ActionPlan24Hour, ConflictReview } from './ContextualFinding';

export type AuditSessionType =
  | 'AUDITORÍA INICIAL'
  | 'SEGUIMIENTO'
  | 'REAUDITORÍA';

export type AuditSessionStatus =
  | 'Borrador'
  | 'En análisis IA'
  | 'Pendiente de Validación Auditor'
  | 'Validada y Firmada'
  | 'Cerrada';

export interface AuditSession {
  id: string;
  auditType: AuditSessionType;
  patientId: string;
  patientName: string;
  docNumber: string;
  ipsId: string;
  ipsName: string;
  auditDate: string;
  auditorId: string;
  auditorName: string;
  auditorRole: string;
  previousAuditId?: string;
  
  // Structured clinical and audit state
  clinicalContext: PatientClinicalContext;
  problemMap: ClinicalProblemMap;
  riskMap: ClinicalAuditRiskMap;
  findings: ContextualFinding[];
  actions24h: ActionPlan24Hour[];
  conflicts: ConflictReview[];
  
  // Global evaluation
  globalTrafficLight: GlobalAuditTrafficLight;
  confidenceScore: number;
  totalFindingsCount: number;
  criticalFindingsCount: number;
  validatedFindingsCount: number;
  
  // Executive summary and recommendations
  clinicalDocumentarySummary: string;
  auditorExecutiveConclusion: string;
  recommendations: string[];
  
  dataOrigin?: 'DEMO' | 'SIMULATED' | 'REAL';
  
  status: AuditSessionStatus;
  createdAt: string;
  updatedAt: string;
}
