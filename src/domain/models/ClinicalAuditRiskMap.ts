/**
 * DOMAIN MODEL: ClinicalAuditRiskMap (FASE 5)
 * Structured risk analysis matrix across 9 clinical audit dimensions.
 * 
 * Strict Principle:
 * CADA RIESGO DEBE ESTAR RESPALDADO POR EVIDENCIA DOCUMENTAL DIRECTA.
 */

export type ClinicalAuditRiskDimension =
  | 'Riesgo de seguridad'
  | 'Riesgo de demora'
  | 'Riesgo de estancia prolongada'
  | 'Riesgo documental'
  | 'Riesgo de continuidad'
  | 'Riesgo administrativo'
  | 'Riesgo de pertinencia'
  | 'Riesgo de evento adverso'
  | 'Riesgo de costo evitable';

export type RiskSeverityLevel = 'CRÍTICO' | 'ALTO' | 'MODERADO' | 'BAJO' | 'NO_IDENTIFICADO';

export type PrioritizationTier =
  | 'NIVEL 1 — SEGURIDAD'
  | 'NIVEL 2 — OPORTUNIDAD'
  | 'NIVEL 3 — PERTINENCIA'
  | 'NIVEL 4 — ESTANCIA'
  | 'NIVEL 5 — CALIDAD DOCUMENTAL'
  | 'NIVEL 6 — ADMINISTRATIVO';

export interface ClinicalRiskEntry {
  id: string;
  dimension: ClinicalAuditRiskDimension;
  tier: PrioritizationTier;
  severity: RiskSeverityLevel;
  title: string;
  description: string;
  evidencePage: number;
  evidenceSnippet: string;
  potentialImpact: string;
  recommendedMitigation: string;
  isAddressedInActionPlan: boolean;
}

export interface ClinicalAuditRiskMap {
  patientId: string;
  auditId: string;
  overallRiskLevel: 'ALTO' | 'MEDIO' | 'BAJO';
  criticalRisksCount: number;
  highRisksCount: number;
  risksByDimension: Record<ClinicalAuditRiskDimension, ClinicalRiskEntry[]>;
  allRisks: ClinicalRiskEntry[];
  topPriorityRisks: ClinicalRiskEntry[];
  generatedAt: string;
}
