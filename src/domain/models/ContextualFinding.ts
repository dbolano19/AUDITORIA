/**
 * DOMAIN MODEL: ContextualFinding & ConflictReview (FASE 5)
 * Rich contextual findings with explainability, multi-source citations, and 24h action plans.
 * 
 * Strict Principles:
 * NO EVIDENCE -> NO CLAIM.
 * EXPLICABILIDAD TOTAL: ¿POR QUÉ SE GENERÓ ESTE HALLAZGO?
 */

import { PrioritizationTier } from './ClinicalAuditRiskMap';
import { AuditorValidationStatus, ConcurrentFindingCategory } from './concurrentAudit';
import { KnowledgeSource, AuditCriterion } from './knowledgeLibrary';

export type { AuditorValidationStatus };

export interface SourceReferenceItem {
  sourceId: string;
  name?: string;
  sourceName?: string;
  entity: string;
  version?: string;
  validityStatus?: string;
  articleOrSection?: string;
  evidenceRequired?: string;
  priority?: string;
  officialUrl?: string;
}

export interface CriterionReferenceItem {
  criterionId: string;
  sourceId: string;
  category?: string;
  title: string;
  requirement: string;
  severity?: string;
  articleOrSection?: string;
  evidenceRequired?: string;
}

export type FindingConfidenceLevel =
  | 'ALTA CONFIANZA DOCUMENTAL'
  | 'MEDIA'
  | 'BAJA';

export type TemporalEvolutionStatus =
  | 'NUEVO'
  | 'ABIERTO_REINCIDENTE'
  | 'RESUELTO_CERRADO'
  | 'EMPEORADO';

export type ActionPlanStatus =
  | 'Pendiente'
  | 'En gestión'
  | 'Cerrado'
  | 'Vencido'
  | 'Rechazado'
  | 'Requiere nueva revisión';

export interface ActionPlan24Hour {
  id: string;
  findingId: string;
  actionTitle: string;
  actionDescription: string;
  suggestedResponsible: 'Auditor Médico Concurrente' | 'Coordinación Médica IPS' | 'Facturación y Glosas' | 'Trabajo Social' | 'Servicio Farmacéutico' | 'Jefatura de Enfermería' | 'Líder de Especialidad';
  createdAt: string;
  deadlineDate: string; // Typically +24h to +48h
  status: ActionPlanStatus;
  closingEvidenceSnippet?: string;
  closingDate?: string;
  closingAuditor?: string;
  notes?: string;
}

export interface RuleExplainabilityDetail {
  ruleId: string;
  ruleName: string;
  activatedReason: string;
  patientDiagnosis: string;
  service: string;
  eventDetected: string;
  sourceUsed: string;
  criterionUsed: string;
  analysisPerformed: string;
  confidenceScore: number;
  confidenceJustification: string;
  auditorVerificationGuide: string[];
}

export interface ConflictReview {
  id: string;
  conflictType:
    | 'HC_CONTRADICTION' // Discrepancy between two clinical notes
    | 'NORMATIVE_CONTRADICTION' // Two national sources with overlapping or differing criteria
    | 'PROTOCOL_VS_REGULATION' // Institutional protocol differing from national norm
    | 'TEMPORAL_INCONSISTENCY'; // Document dated prior to admission or contradictory dates
  title: string;
  source1: string;
  source2: string;
  detectedConflict: string;
  evidencePage1?: number;
  evidencePage2?: number;
  date: string;
  context: string;
  humanReviewRecommendation: string;
  auditorResolution?: 'RESUELTO_PREVALECE_NORMA' | 'RESUELTO_PREVALECE_HC' | 'PENDIENTE_ARBITRAJE';
  auditorNotes?: string;
}

export interface ContextualFinding {
  id: string;
  auditId: string;
  patientId: string;
  code: string;
  category: ConcurrentFindingCategory;
  tier: PrioritizationTier;
  title: string;
  description: string;

  // Primary Fact Evidence (Medical Record)
  factEvidence: string;
  evidencePage: number;
  documentType: string;
  documentDate: string;

  // Normative Criterion Evidence
  criterionEvidence: string;
  sourceReferences: SourceReferenceItem[];
  criterionReferences: CriterionReferenceItem[];
  normativePrecedenceChain?: string;
  temporalWarning?: string;

  // Multi-source distinct breakdown
  multiSourceBreakdown?: {
    medicalRecordSnippet: string;
    clinicalPracticeGuideline?: string;
    nationalRegulation?: string;
    institutionalProtocol?: string;
    fomagGuideline?: string;
  };

  // Confidence
  confidenceScore: number; // 0.0 to 1.0
  confidenceLevel: FindingConfidenceLevel;

  // Explainability & Why it was triggered
  explainability: RuleExplainabilityDetail;

  // Auditor Human Validation (Obligatoria)
  auditorValidation: {
    status: AuditorValidationStatus;
    validatedBy?: string;
    validatedAt?: string;
    auditorNotes?: string;
    modifiedDescription?: string;
  };

  // Evolution from previous audits
  temporalStatus: TemporalEvolutionStatus;
  previousAuditFindingId?: string;
  evolutionNotes?: string;

  // Automatic 24h Action Plan
  actionPlan24h?: ActionPlan24Hour;
  
  isCriticalOrHighPriority: boolean;
  createdAt: string;
  updatedAt: string;
}
