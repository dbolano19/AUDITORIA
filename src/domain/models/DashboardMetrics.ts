/**
 * DOMAIN MODEL: DashboardMetrics
 * Core metrics, indicators, safety banners, and data quality structures for executive audit dashboard.
 */

export type AuditGlobalTrafficLight =
  | 'FAVORABLE'
  | 'REQUIERE_SEGUIMIENTO'
  | 'OPORTUNIDADES_RELEVANTES'
  | 'SITUACIONES_PRIORITARIAS'
  | 'INFORMACION_INSUFICIENTE';

export interface AuditTrafficLightAssessment {
  state: AuditGlobalTrafficLight;
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  iconName: string;
  ruleExplanation: string;
  triggeredFactors: string[];
}

export interface OverviewMetrics {
  totalAudits: number;
  auditedPatients: number;
  totalFindings: number;
  priorityFindings: number; // Críticos + Altos
  criticalFindingsCount: number;
  highFindingsCount: number;
  mediumFindingsCount: number;
  lowFindingsCount: number;
  pendingActions: number;
  overdueActions: number;
  closedActions: number;
  totalActions: number;
  actionClosureRateText: string; // e.g. "87.5%" or "SIN DATOS"
  actionClosureRateNum: number | null;
  avgStayDays: number;
  medianStayDays: number;
  sampleSufficiencyWarning: boolean;
  sampleSufficiencyNote?: string;
}

export interface FindingCategoryBreakdown {
  category: string;
  total: number;
  criticalOrHigh: number;
  mediumOrLow: number;
  percentage: number;
  recurrentCount: number;
  actionOpenCount: number;
}

export interface ServiceRankingItem {
  service: string;
  auditsCount: number;
  patientsCount: number;
  findingsCount: number;
  priorityFindingsCount: number;
  openActionsCount: number;
  avgStayDays: number;
  complianceRate: number | null;
}

export interface PatientSafetyKPIs {
  totalSafetySituations: number;
  medicationAlertsCount: number;
  infectionPROAAlertsCount: number;
  fallRiskAlertsCount: number;
  criticalLabAlertsCount: number;
  procedureSafetyAlertsCount: number;
  continuityOfCareAlertsCount: number;
  documentedSentinelsCount: number;
  safetySummaryNote: string;
}

export interface OpportunityKPIs {
  totalPendingMatters: number;
  pendingInterconsultationsCount: number;
  pendingDiagnosticAidsCount: number;
  pendingProceduresCount: number;
  pendingLabResultsCount: number;
  pending24hActionsCount: number;
  avgInterconsultationResponseHours: number | null;
  avgDiagnosticAidReportHours: number | null;
  timingHasDocumentedDates: boolean;
}

export interface StayAnalysisKPIs {
  auditedPatients: number;
  avgStayDays: number;
  medianStayDays: number;
  casesWithStayMonitoring: number;
  managementOpportunitiesCount: number;
  documentedBarriersCount: number;
  barrierCategories: { type: string; count: number; avgImpactDays: number }[];
  casesWithInsufficientData: number;
  stayExplanatoryNote: string;
}

export interface DocumentalQualityKPIs {
  totalDocumentalFindings: number;
  totalAssistanceFindings: number;
  missingDocumentsCount: number;
  incompleteRecordsCount: number;
  inconsistentRecordsCount: number;
  absenceOfEvidenceCount: number;
  recordsWithoutDateCount: number;
  recordsWithoutDoctorIdCount: number;
  crossDocumentDiscrepanciesCount: number;
  documentalDeficiencyRate: number; // Percentage
  assistanceDeficiencyRate: number; // Percentage
}

export interface PertinenceKPIs {
  totalPertinenceFindings: number;
  diagnosticAidsPertinenceCount: number;
  medicationPertinenceCount: number;
  proceduresPertinenceCount: number;
  interconsultationsPertinenceCount: number;
  treatmentSchemesPertinenceCount: number;
  confirmedPertinenceCount: number;
}

export interface Action24HourTrackingItem {
  id: string;
  actionCode: string;
  ipsId: string;
  ipsName: string;
  findingId: string;
  findingCode: string;
  findingTitle: string;
  category: string;
  priority: string;
  actionRequired: string;
  suggestedResponsible: string;
  deadlineDate: string;
  status: 'Pendiente' | 'En gestión' | 'Cerrada' | 'Vencida' | 'Requiere seguimiento';
  isOverdue: boolean;
  closedAt?: string;
  closingEvidence?: string;
  closingHoursElapsed?: number | null;
  patientDocMasked: string;
  service: string;
}

export interface PriorityAlertItem {
  id: string;
  type: 'ACCION_VENCIDA' | 'HALLAZGO_PRIORITARIO_ABIERTO' | 'HALLAZGO_REINCIDENTE' | 'AUDITORIA_PENDIENTE_CIERRE' | 'INFORMACION_INSUFICIENTE';
  severity: 'ROJO' | 'NARANJA' | 'AMARILLO';
  title: string;
  description: string;
  ipsId: string;
  ipsName: string;
  entityId: string;
  date: string;
  service: string;
  actionUrlOrHandler?: string;
}

export interface IAMotorMetrics {
  totalIASuggested: number;
  auditorConfirmed: number;
  auditorModified: number;
  auditorRejected: number;
  auditorMoreEvidenceRequested: number;
  confirmationRate: number; // %
  modificationRate: number; // %
  rejectionRate: number; // %
  methodologyDisclaimer: string;
}

export interface DataQualityAudit {
  hcProcessedCount: number;
  hcWithCompleteDataCount: number;
  hcIncompleteCount: number;
  ocrAppliedCount: number;
  problematicPagesCount: number;
  unidentifiedFieldsCount: number;
  unverifiedSourcesCount: number;
  criteriaWithoutDirectSourceCount: number;
  findingsWithoutEvidenceCount: number;
  overallDataReliabilityIndex: number; // 0 to 100
}

export interface AuditorPerformanceItem {
  auditorId: string;
  auditorName: string;
  specialty: string;
  auditsAssigned: number;
  auditsClosed: number;
  auditsPending: number;
  findingsDocumented: number;
  avgValidationMinutes: number | null;
}

export interface DashboardMetricsResult {
  lastUpdated: string;
  periodText: string;
  filteredIPSName: string;
  filteredServiceName: string;
  auditTrafficLight: AuditTrafficLightAssessment;
  overview: OverviewMetrics;
  categories: FindingCategoryBreakdown[];
  services: ServiceRankingItem[];
  patientSafety: PatientSafetyKPIs;
  opportunity: OpportunityKPIs;
  stayAnalysis: StayAnalysisKPIs;
  documentalQuality: DocumentalQualityKPIs;
  pertinence: PertinenceKPIs;
  actions24h: Action24HourTrackingItem[];
  alerts: PriorityAlertItem[];
  iaMotor: IAMotorMetrics;
  dataQuality: DataQualityAudit;
  auditors: AuditorPerformanceItem[];
  reliabilityMetadata: {
    dataSource: string;
    period: string;
    totalAuditsEvaluated: number;
    totalPatientsEvaluated: number;
    calculationTimestamp: string;
  };
}

export type DashboardAction24hItem = Action24HourTrackingItem;
export type DashboardQualityData = DataQualityAudit;

