/**
 * DOMAIN LAYER - Concurrent Clinical Audit Models (FASE 3)
 * Implements the domain model based on "GUIA PARA REALIZAR LA NOTA DE AUDITORIA CONCURRENTE" (FOMAG / MinSalud).
 * 
 * Strict Principle: NO EVIDENCE -> NO CLAIM
 */

export const AUDIT_ENGINE_VERSION = 'Concurrent Audit Engine v1.0';

/**
 * Certainty level for clinical audit findings
 */
export type FindingCertaintyLevel =
  | 'EVIDENCIA DOCUMENTAL DIRECTA'
  | 'INCONSISTENCIA DOCUMENTAL'
  | 'POSIBLE HALLAZGO'
  | 'INFORMACIÓN INSUFICIENTE';

/**
 * Priority levels for audit findings and recommendations
 */
export type AuditPriorityLevel =
  | '🔴 Crítico'
  | '🟠 Alto'
  | '🟡 Moderado'
  | '🟢 Bajo';

/**
 * Finding categories defined in the concurrent audit guide
 */
export type ConcurrentFindingCategory =
  | 'Oportunidad'
  | 'Pertinencia'
  | 'Calidad asistencial'
  | 'Seguridad del paciente'
  | 'Satisfacción del usuario'
  | 'Administrativo'
  | 'Operativo'
  | 'Estancia'
  | 'Costos';

/**
 * Status of diagnostic aid in the 10-point evaluation
 */
export type DiagnosticAidAuditStatus =
  | '🟢 Sin hallazgo identificado'
  | '🟡 Requiere seguimiento'
  | '🟠 Posible oportunidad'
  | '🔴 Posible hallazgo prioritario'
  | '⚪ Información insuficiente';

/**
 * Human validation decision by the auditor
 */
export type AuditorValidationStatus =
  | 'CONFIRMADO'
  | 'RECHAZADO'
  | 'PENDIENTE'
  | 'MODIFICADO';

/**
 * Classified document types in a clinical record
 */
export type ClassifiedDocumentType =
  | 'Historia clínica de ingreso'
  | 'Evolución médica'
  | 'Notas de enfermería'
  | 'Órdenes médicas'
  | 'Resultados de laboratorio'
  | 'Imágenes diagnósticas'
  | 'Interconsultas'
  | 'Procedimientos quirúrgicos/UCI'
  | 'Medicamentos y Kárdex'
  | 'Registros administrativos'
  | 'Epicrisis'
  | 'Consentimientos informados'
  | 'Otro documento clínico';

/**
 * Exact page reference with cited evidence
 */
export interface EvidenceReference {
  id: string;
  documentName: string;
  pdfPage: number;
  documentDate: string;
  documentType: ClassifiedDocumentType | string;
  snippet: string;
  relevanceReason: string;
  auditorVerificationGuide: string;
  confidence: number;
}

/**
 * Page item in document inventory
 */
export interface InventoryPageItem {
  pageNumber: number;
  documentType: ClassifiedDocumentType;
  documentDate?: string;
  service?: string;
  summary: string;
  hasCriticalFinding: boolean;
}

/**
 * Document Inventory (FASE 1 Analysis)
 */
export interface DocumentInventory {
  totalPages: number;
  dateRange: {
    start: string;
    end: string;
  };
  servicesIdentified: string[];
  pages: InventoryPageItem[];
  documentTypeCounts: Record<string, number>;
  completenessStatus: 'COMPLETO' | 'PARCIALMENTE_COMPLETO' | 'INFORMACIÓN_INCOMPLETA';
}

/**
 * Vital sign record with provenance
 */
export interface VitalSignRecord {
  id: string;
  date: string;
  time?: string;
  pdfPage: number;
  bp?: string; // Blood Pressure
  hr?: number; // Heart Rate
  rr?: number; // Respiratory Rate
  temp?: number; // Temperature
  spo2?: number; // O2 Saturation
  gcs?: number; // Glasgow
  fiO2?: string;
  observations?: string;
}

/**
 * Daily medical evolution record
 */
export interface EvolutionRecord {
  id: string;
  date: string;
  time?: string;
  pdfPage: number;
  physicianName?: string;
  specialty?: string;
  clinicalStatus: string;
  significantChanges: string;
  medicalAnalysis: string;
  conductAndPlan: string;
  vitalSignsSnapshot?: VitalSignRecord;
  auditorRemarks?: string;
}

/**
 * Diagnostic aid record with 10-point evaluation
 */
export interface DiagnosticAidAuditRecord {
  id: string;
  studyName: string;
  category: 'Laboratorio' | 'Imagenología' | 'Patología' | 'Otro';
  orderDate?: string;
  executionDate?: string;
  resultDate?: string;
  interpretationDate?: string;
  pdfPage: number;
  
  // 10 evaluation criteria from guide
  isDocumented: boolean;
  hasDocumentedIndication: boolean;
  isRelatedToDiagnosis: boolean;
  wasPerformed: boolean;
  hasDocumentedResult: boolean;
  resultSummary?: string;
  hasDocumentedInterpretation: boolean;
  interpretationSummary?: string;
  generatedDocumentedConduct: boolean;
  conductSummary?: string;
  wasRepeated: boolean;
  isRepetitionJustified?: boolean;
  isPending: boolean;
  
  auditClassification: DiagnosticAidAuditStatus;
  auditNotes: string;
  evidence: EvidenceReference;
}

/**
 * Procedure and interconsultation record
 */
export interface ProcedureAuditRecord {
  id: string;
  type: 'Procedimiento' | 'Interconsulta';
  name: string;
  specialty?: string;
  requestDate?: string;
  executionDate?: string;
  responseDate?: string;
  pdfPage: number;
  status: 'Solicitado' | 'Programado' | 'Realizado' | 'En espera' | 'Cancelado';
  indication?: string;
  specialistConcept?: string;
  conductRecommended?: string;
  timelinessAssessment: 'Oportuno' | 'Posible demora' | 'Información no disponible';
  auditClassification: DiagnosticAidAuditStatus;
  evidence: EvidenceReference;
}

/**
 * Medication & Pharmacological treatment record
 */
export interface MedicationAuditRecord {
  id: string;
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  startDate?: string;
  stopDate?: string;
  isAntibiotic: boolean;
  antibioticDay?: number;
  indication?: string;
  changesDocumented?: string;
  pdfPage: number;
  adherenceDisclaimer: string;
  clinicalGuideReference?: {
    guideName: string;
    version: string;
    date: string;
    institution: string;
    criteriaUsed: string;
  };
  evidence: EvidenceReference;
}

/**
 * Pending item holding hospital stay or discharge
 */
export interface PendingAuditItem {
  id: string;
  description: string;
  category: 'Ayuda diagnóstica' | 'Interconsulta' | 'Procedimiento' | 'Traslado' | 'Autorización administrativa' | 'Plan de alta' | 'Tratamiento';
  requestDate: string;
  daysElapsed: number;
  status: 'Pendiente' | 'En trámite' | 'En espera' | 'No realizado';
  lastEvidenceFound: string;
  isHoldingHospitalDischarge: boolean;
  pdfPage: number;
  urgency: AuditPriorityLevel;
  evidence: EvidenceReference;
}

/**
 * Event in the chronological event chain
 */
export interface ChronologyEvent {
  id: string;
  timestamp: string; // ISO or YYYY-MM-DD HH:mm
  formattedDate: string;
  category: 'Ingreso' | 'Evolución' | 'Orden' | 'Procedimiento' | 'Laboratorio' | 'Imagen' | 'Interconsulta' | 'Tratamiento' | 'Enfermería' | 'Administrativo' | 'Conducta';
  title: string;
  description: string;
  sourceDoc: string;
  pdfPage: number;
  chainStage?: 'ORDEN' | 'REALIZACIÓN' | 'RESULTADO' | 'INTERPRETACIÓN' | 'CONDUCTA';
  relatedChainId?: string;
  hasTemporalInconsistency: boolean;
  inconsistencyObservation?: string;
  evidenceSnippet?: string;
}

/**
 * Patient Safety assessment record
 */
export interface PatientSafetyAuditEvaluation {
  documentedRisks: {
    type: 'Caída' | 'Infección (IAAS)' | 'Catéter/Vía' | 'Sonda/Tubo' | 'Úlcera por presión' | 'Otro';
    description: string;
    pdfPage: number;
  }[];
  occurredEvents: {
    type: 'Caída' | 'Evento adverso' | 'Complicación' | 'Falla de medicación' | 'Otro';
    description: string;
    eventDate: string;
    pdfPage: number;
  }[];
  fallRiskAssessed: boolean;
  fallOccurred: boolean;
  invasiveDevicesTracked: string[];
  safeMedicationAdminDocumented: boolean;
  auditNotes: string;
}

/**
 * Assistential Quality assessment record
 */
export interface AssistentialQualityAuditEvaluation {
  incompleteEvolutionsFound: string[];
  contradictoryEvolutionsFound: string[];
  missingRelevantInformation: string[];
  documentaryContinuityAssessed: boolean;
  observations: string;
}

/**
 * Stay Analysis and Discharge Barriers
 */
export interface StayBarrierAnalysis {
  calculatedHospitalStayDays: number;
  admissionDate: string;
  currentDocumentDate: string;
  currentDocumentedClinicalSituation: string;
  pendingItemsHoldingDischarge: string[];
  administrativeBarriers: string[];
  operationalBarriers: string[];
  clinicalBarriers: string[];
  earlyDischargeDocumentedPossibility: 'Sí' | 'No' | 'En evaluación clínica';
  prolongedStayRiskLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
  requiredIpsInterventions: string[];
  justificationEvaluation: string;
}

/**
 * Avoidable Costs Assessment
 */
export interface AvoidableCostsEvaluation {
  repeatedStudiesWithoutJustification: string[];
  potentiallyAvoidableStayDays: number;
  highCostMedicationsIdentified: string[];
  costDisclaimer: 'Potencial costo evitable — valor no disponible.';
  notes: string;
}

/**
 * User Satisfaction (explicitly documented only)
 */
export interface UserSatisfactionAuditEvaluation {
  source: 'DOCUMENTADA_EN_HC' | 'DILIGENCIADA_POR_AUDITOR' | 'NO_DOCUMENTADA';
  dignifiedTreatment: 'Sí' | 'No' | 'No informado';
  dxInformationProvided: 'Sí' | 'No' | 'No informado';
  txInformationProvided: 'Sí' | 'No' | 'No informado';
  nonConformitiesDocumented: string[];
  unresolvedNeedsDocumented: string[];
  emotionalSupportDocumented: 'Sí' | 'No' | 'No requerido';
  comfortDocumented: 'Adecuado' | 'Inadecuado' | 'No informado';
  notes: string;
}

/**
 * Reference to a normative or clinical source supporting a finding (FASE 4)
 */
export interface SourceReference {
  sourceId: string;
  sourceName: string;
  sourceVersion: string;
  validityStatus: 'VIGENTE' | 'VIGENCIA_POR_VERIFICAR' | 'MODIFICADA' | 'DEROGADA' | 'INFORMACION_INSUFICIENTE';
  officialUrl?: string;
  articleOrSection?: string;
  precedenceChain?: string;
  temporalWarning?: string;
}

/**
 * Reference to an audit criterion used to evaluate evidence (FASE 4)
 */
export interface CriterionReference {
  criterionId: string;
  sourceId: string;
  category: string;
  title: string;
  requirement: string;
  evidenceRequired: string;
  articleOrSection?: string;
  status: string;
}

/**
 * Expert Concurrent Finding entity (FASE 4 Enhanced)
 */
export interface ConcurrentAuditFinding {
  id: string;
  findingId?: string;
  code: string;
  category: ConcurrentFindingCategory;
  priority: AuditPriorityLevel;
  severity?: 'Crítico' | 'Alto' | 'Moderado' | 'Bajo' | string;
  title: string;
  description: string;
  evidence: EvidenceReference;
  evidences?: EvidenceReference[];
  
  // Phase 4 5-Dimensional Reasoning
  factEvidence?: string; // Hecho documentado explícito en la HC
  criterionEvidence?: string; // Criterio o norma aplicable
  clinicalAnalysis: string; // Análisis de concordancia
  analysis?: string;
  riskImpact: string;
  recommendation: string;
  requiredAction: string;
  suggestedDeadline: '24 horas' | '48 horas' | '72 horas' | 'Inmediato' | 'Al egreso';
  suggestedResponsible: string;
  certaintyLevel: FindingCertaintyLevel;
  confidence?: number;
  validationStatus: AuditorValidationStatus;
  
  // Phase 4 Knowledge Traceability
  sourceReferences?: SourceReference[];
  criterionReferences?: CriterionReference[];
  normativePrecedenceChain?: string;
  temporalWarning?: string;
  conflictAlert?: string;

  auditorNotes?: string;
  validatedAt?: string;
  validatedBy?: string;
}

/**
 * Action item for next 24-48 hours
 */
export interface UrgentAuditAction {
  id: string;
  findingId?: string;
  actionText: string;
  responsible: string;
  deadline: string;
  priority: AuditPriorityLevel;
  isWithin24Hours: boolean;
  status: 'Pendiente' | 'En proceso' | 'Cumplida' | 'Cancelada';
  evidenceSnippet: string;
  sourcePage: number;
}

/**
 * Executive Summary for Decision Making
 */
export interface ConcurrentAuditExecutiveSummary {
  engineVersion: string;
  generationDate: string;
  patientCurrentClinicalSituation: string;
  hospitalizationReason: string;
  mainPendingItems: string[];
  stayPertinenceEvaluation: string;
  topFindingsSummary: string[];
  keyRisksIdentified: string[];
  timelinessIssues: string[];
  priority24HourRecommendations: string[];
}

/**
 * COMPLETE STRUCTURED OUTPUT OF THE CONCURRENT AUDIT ENGINE
 * 4 Immutability Layers:
 * 1. Raw Document Metadata
 * 2. Structured Extracted Facts (No Inference)
 * 3. AI Analysis & Draft Potential Findings
 * 4. Human Auditor Validations
 */
export interface CompleteConcurrentAuditResult {
  engineVersion: string;
  processedAt: string;
  auditId: string;
  patientId: string;
  ipsId: string;
  documentId: string;

  // Layer 1 & 2: Extracted Data (Verifiable Facts with Page Citations)
  inventory: DocumentInventory;
  patientExtracted: {
    fullName: string;
    docType: string;
    docNumber: string;
    age: number;
    sex: string;
    roomBed: string;
    service: string;
    admissionDate: string;
    mainDiagnosis: string;
    secondaryDiagnoses: string[];
  };
  admissionExtracted: {
    admissionDate: string;
    admissionTime?: string;
    triageLevel?: string;
    hospitalizationReason: string;
    currentIllness: string;
    initialConduct: string;
    initialDiagnoses: string[];
    sourcePage: number;
  };
  timeline: ChronologyEvent[];
  vitalSigns: VitalSignRecord[];
  dailyEvolutions: EvolutionRecord[];
  diagnosticAids: DiagnosticAidAuditRecord[];
  proceduresAndConsultations: ProcedureAuditRecord[];
  medications: MedicationAuditRecord[];
  nursingRecords: {
    pdfPage: number;
    date: string;
    summary: string;
    devicesFound: string[];
  }[];
  pendingItems: PendingAuditItem[];

  // Layer 3: AI Expert Analysis
  safetyAnalysis: PatientSafetyAuditEvaluation;
  qualityAnalysis: AssistentialQualityAuditEvaluation;
  stayAnalysis: StayBarrierAnalysis;
  avoidableCosts: AvoidableCostsEvaluation;
  userSatisfaction: UserSatisfactionAuditEvaluation;
  findings: ConcurrentAuditFinding[];
  urgentActions: UrgentAuditAction[];
  executiveSummary: ConcurrentAuditExecutiveSummary;
  allEvidence: EvidenceReference[];

  // Layer 4: Auditor Validation Status
  auditorValidationOverall: {
    status: AuditorValidationStatus;
    confirmedFindingsCount: number;
    rejectedFindingsCount: number;
    auditorSignOffNotes?: string;
    signedBy?: string;
    signedAt?: string;
  };

  disclaimer: string;
}
