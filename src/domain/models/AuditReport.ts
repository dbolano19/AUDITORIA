/**
 * DOMAIN MODEL: AuditReport (FASE 6)
 * Models detailed and executive audit reports, integrity verification, versioning, and history.
 */

import { AuditorValidationStatus, FindingConfidenceLevel } from './ContextualFinding';
import { GlobalAuditTrafficLight } from './PatientClinicalContext';

export type AuditReportType = 'INFORME_DETALLADO' | 'INFORME_EJECUTIVO';

export type AuditReportStatus = 'BORRADOR' | 'EN_REVISION' | 'FINAL' | 'CERRADO';

export interface FindingReportItem {
  id: string;
  code: string;
  category: string;
  priority: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  status: AuditorValidationStatus;
  description: string;
  evidenceText: string;
  evidencePage: number;
  evidenceDate?: string;
  evidenceDocumentType?: string;
  ruleId: string;
  criterionTitle: string;
  sourceName: string;
  sourceVersion?: string;
  sourceValidity?: string;
  sourceArticleOrSection?: string;
  // Quadruple analysis structure
  analysisFact: string;
  analysisCriterion: string;
  analysisComparison: string;
  analysisConclusion: string;
  confidenceLevel: FindingConfidenceLevel;
  confidenceScore: number;
  recommendation: string;
  proposedAction: string;
  responsible: string;
  deadlineHours: number;
  auditorNotes?: string;
  modifiedDescription?: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface ReportVersionChange {
  version: number;
  timestamp: string;
  user: string;
  role: string;
  summary: string;
  modifiedFindings?: string[];
}

export interface DetailedReportData {
  reportTitle: string;
  systemName: string;
  ipsId: string;
  ipsName: string;
  ipsCity: string;
  ipsDepartment: string;
  auditedService: string;
  auditType: string;
  auditDate: string;
  auditId: string;
  auditorName: string;
  auditorRole: string;
  version: number;
  status: AuditReportStatus;
  dataOrigin?: 'DEMO' | 'SIMULATED' | 'REAL';
  
  // Patient minimized data
  patientId: string;
  patientDocType: string;
  patientDocNumber: string;
  patientAge?: number;
  patientSex?: string;
  admissionDate: string;
  lengthOfStay: number;
  bedRoom?: string;
  
  // Documentary Clinical Summary
  clinicalSummary: {
    admissionReason: string;
    mainDiagnosis: string;
    secondaryDiagnoses: string[];
    relevantEvolution: string;
    relevantTreatments: string;
    proceduresSummary: string;
    diagnosticAidsSummary: string;
    pendingMatters: string;
    currentSituation: string;
  };
  
  // Scope of Audit
  scope: {
    documentsReviewed: number;
    pagesProcessed: number;
    processingDate: string;
    servicesIdentified: string[];
    criteriaActivated: number;
    criteriaDiscarded: number;
    sourcesConsulted: number;
    potentialFindingsCount: number;
  };
  
  // Methodology
  methodologySteps: string[];
  
  // Chronology timeline
  chronology: Array<{
    date: string;
    time?: string;
    event: string;
    eventType: string;
    sourceDoc: string;
    page: number;
  }>;
  
  // Diagnostic table
  diagnoses: Array<{
    code?: string;
    name: string;
    type: 'Principal' | 'Secundario' | 'Presuntivo' | 'Documentado' | 'Histórico';
    date: string;
    evidence: string;
    evidencePage: number;
  }>;
  
  // Treatments table
  treatments: Array<{
    medication: string;
    dose: string;
    route: string;
    frequency: string;
    startDate: string;
    changeDate?: string;
    evidence: string;
    evidencePage: number;
  }>;
  
  // Diagnostic aids table
  diagnosticAids: Array<{
    studyName: string;
    requestDate: string;
    executionDate?: string;
    result?: string;
    interpretation?: string;
    conduct?: string;
    status: 'Completo' | 'Pendiente' | 'No identificado' | 'Inconsistente' | 'Requiere validación';
    evidencePage: number;
  }>;
  
  // Interconsultations table
  interconsultations: Array<{
    specialty: string;
    requestDate: string;
    attentionDate?: string;
    concept?: string;
    conduct?: string;
    status: 'Atendida' | 'Pendiente' | 'Demorada' | 'Cancelada';
    evidencePage: number;
  }>;
  
  // Procedures table
  procedures: Array<{
    name: string;
    indication: string;
    orderDate: string;
    executionDate?: string;
    result?: string;
    evolution?: string;
    evidencePage: number;
  }>;
  
  // Stay evaluation
  stayAnalysis: {
    admissionDate: string;
    auditDate: string;
    stayDays: number;
    clinicalSituation: string;
    pendingIssues: string;
    documentedBarriers: string;
    dischargeStatus: string;
    classification: 'ESTANCIA_DOCUMENTALMENTE_EXPLICADA' | 'REQUIERE_SEGUIMIENTO' | 'OPORTUNIDAD_DE_GESTION' | 'SITUACION_PRIORITARIA' | 'INFORMACION_INSUFICIENTE';
  };
  
  // Patient Safety
  patientSafety: {
    hasAdverseEvents: boolean;
    adverseEventsDetails: string;
    infectionRiskOrAlert: string;
    fallRisk: string;
    identificationRisk: string;
    medicationSafetyAlerts: string;
    criticalLabAlerts: string;
    continuityOfCareStatus: string;
  };
  
  // Findings
  confirmedFindings: FindingReportItem[];
  modifiedFindings: FindingReportItem[];
  rejectedFindings: FindingReportItem[];
  pendingEvidenceFindings: FindingReportItem[];
  notApplicableFindings: FindingReportItem[];
  
  // Action Plan 24h
  actionPlan24h: Array<{
    id: string;
    findingCode: string;
    action: string;
    responsible: string;
    deadline: string;
    status: 'Pendiente' | 'En gestión' | 'Cerrado' | 'Vencido' | 'Requiere seguimiento';
  }>;
  
  // Final summary numbers
  summaryStats: {
    totalSituationsIdentified: number;
    confirmedCount: number;
    modifiedCount: number;
    rejectedCount: number;
    pendingEvidenceCount: number;
    prioritySituationsCount: number;
    actions24hCount: number;
  };
  
  // Conclusion
  conclusion: string;
}

export interface ExecutiveReportData {
  reportTitle: string;
  systemName: string;
  ipsName: string;
  ipsId: string;
  city: string;
  period: string;
  generationDate: string;
  generatedBy: string;
  version: number;
  status: AuditReportStatus;
  dataOrigin?: 'DEMO' | 'SIMULATED' | 'REAL';
  
  // Key Aggregated Metrics
  totalAuditsPerformed: number;
  totalPatientsAudited: number;
  totalConfirmedFindings: number;
  totalPriorityFindings: number;
  averageStayDays: number;
  
  // Categories Breakdown
  findingsByCategory: Array<{ category: string; count: number; percentage: number }>;
  findingsByPriority: Array<{ priority: string; count: number; color: string }>;
  findingsByService: Array<{ service: string; count: number }>;
  
  // Opportunities & Management
  mainManagementOpportunities: string[];
  pendingActionsSummary: {
    total: number;
    inProgress: number;
    overdue: number;
    closed: number;
  };
  
  // Multi-IPS Comparison summary
  ipsComparisonOverview?: Array<{
    ipsName: string;
    audits: number;
    confirmedFindings: number;
    criticalFindings: number;
    averageStay: number;
    actionsPending: number;
  }>;
  
  // Trends and Management Recommendations
  identifiedTrends: string[];
  managerialRecommendations: string[];
  globalEvaluationConclusion: string;
}

export interface GeneratedAuditReport {
  id: string;
  reportCode: string;
  auditId: string;
  sessionId?: string;
  ipsId: string;
  ipsName: string;
  patientId: string;
  patientName: string;
  type: AuditReportType;
  status: AuditReportStatus;
  dataOrigin?: 'DEMO' | 'SIMULATED' | 'REAL';
  version: number;
  generatedAt: string;
  generatedBy: string;
  auditorRole: string;
  fileName: string;
  hash: string;
  findingsCount: {
    total: number;
    confirmed: number;
    modified: number;
    rejected: number;
    pendingEvidence: number;
    notApplicable: number;
    critical: number;
  };
  actions24hCount: number;
  versionChanges: ReportVersionChange[];
  detailedData?: DetailedReportData;
  executiveData?: ExecutiveReportData;
}
