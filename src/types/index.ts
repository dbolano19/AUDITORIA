export type UserRole = 'Administrador' | 'Auditor' | 'Coordinador' | 'Supervisor' | 'Consulta';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  ipsAssigned?: string[];
  specialty?: string;
  regMedica?: string;
}

export interface IPSContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface IPS {
  id: string;
  code: string;
  name: string;
  city: string;
  department: string;
  status: 'Activa' | 'Inactiva';
  createdAt: string;
  contacts: IPSContact[];
  observations: string;
  bedsCapacity: number;
  servicesAvailable: string[];
}

export type IdentificationType = 'CC' | 'TI' | 'RC' | 'CE' | 'PA' | 'MS';
export type PatientStatus = 'Hospitalizado' | 'Alta' | 'Traslado' | 'Fallecido' | 'Cerrado';
export type ProlongedStayRisk = 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';

export interface Patient {
  id: string;
  internalId: string;
  docType: IdentificationType;
  docNumber: string;
  fullName: string;
  age: number;
  sex: 'M' | 'F' | 'Otro';
  originDepartment: string;
  originMunicipality: string;
  ipsId: string;
  ipsName: string;
  service: string;
  roomBed: string;
  admissionDate: string;
  mainDiagnosis: string;
  mainDiagnosisCode?: string;
  secondaryDiagnoses: string[];
  attendingPhysician: string;
  status: PatientStatus;
  triageLevel?: string;
  eps?: string;
  observations?: string;
}

export type AuditType = 'Ingreso' | 'Seguimiento diario' | 'Revisión de estancia' | 'Auditoría completa';
export type AuditStatus = 'Borrador' | 'En revisión' | 'Pendiente de validación' | 'Validada' | 'Cerrada';

export interface AuditAdmissionInfo {
  admissionDate: string;
  admissionTime: string;
  admissionReason: string;
  currentIllness: string;
  triageLevel?: string;
  admissionDiagnoses: string[];
  initialConduct?: string;
}

export interface AuditStayReview {
  calculatedStayDays: number;
  expectedStayDays: number;
  currentService: string;
  clinicalJustification: string;
  prolongedStayRisk: boolean;
  notes?: string;
}

export interface Audit {
  id: string;
  auditCode: string;
  ipsId: string;
  patientId: string;
  auditDate: string;
  auditorId: string;
  auditorName: string;
  auditorRole?: string;
  type: AuditType;
  status: AuditStatus;
  createdAt: string;
  updatedAt: string;
  validationDate?: string;
  validatedBy?: string;
  generalNotes?: string;
  admissionInfo?: AuditAdmissionInfo;
  stayReview?: AuditStayReview;
  dailyFollowUps?: DailyFollowUp[];
  diagnosticAids?: DiagnosticAid[];
  procedures?: ProcedureItem[] | ProcedureInterconsult[];
  treatments?: TreatmentItem[] | MedicationTreatment[];
  findings?: Finding[];
  actions?: AuditAction[];
  documents?: ClinicalDocHC[];
  patientSafety?: PatientSafetyRecord;
  safetyRecords?: PatientSafetyRecord[];
  userSatisfaction?: UserSatisfaction;
  userSatisfactionRecords?: UserSatisfaction[];
  stayAnalysis?: StayAnalysis;
  recommendations?: RecommendationItem[];
}

export type DocumentProcessingStatus = 'Cargando' | 'Procesando' | 'Procesado' | 'Error' | 'Pendiente de revisión';

export interface ClinicalDocHC {
  id: string;
  patientId: string;
  auditId: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  uploadDate: string;
  uploadedBy: string;
  status: DocumentProcessingStatus;
  fileUrl?: string;
  previewPages?: string[];
  documentType: 'Historia Clínica Completa' | 'Evolución Médica' | 'Epicrisis' | 'Resultados Paraclínicos' | 'Nota de Quirófano' | 'Ordenes Médicas' | 'Otro';
  notes?: string;
  extractedTextSnippet?: string;
}

export interface IngresoNote {
  auditId: string;
  followUpDate: string;
  hospitalizationReason: string;
  relevantSigns: string;
  relevantSymptoms: string;
  presumptiveDx: string;
  initialTreatment: string;
  diagnosticAids: string;
  pendingItems: string;
  auditorObservations: string;
  auditorAnalysis: string;
}

export interface ClinicalRisks {
  infection: boolean;
  bleeding: boolean;
  decompensation: boolean;
  falls: boolean;
  other: boolean;
  otherDetail?: string;
}

export interface VitalSigns {
  bp: string;
  hr: number;
  rr: number;
  temp: number;
  spo2: number;
  gcs?: number;
}

export interface DailyFollowUp {
  id: string;
  auditId?: string;
  date: string;
  clinicalStatus?: string;
  vitalSigns?: string;
  relevantVitalSigns?: VitalSigns;
  clinicalEvolution?: string;
  diagnosticChanges?: string;
  medicalPertinence?: 'Pertinente' | 'No pertinente' | 'En observación';
  stayPertinence?: 'Pertinente' | 'No pertinente' | 'En observación';
  interdisciplinaryNotes?: string;
  significantClinicalChanges?: string;
  importantRecentParaclinicals?: string;
  clinicalRisks?: ClinicalRisks;
  medicalAnalysisAndPlan?: string;
  pendingItems?: string;
  auditorObservations?: string;
  createdAt?: string;
}

export type DiagnosticAidStatus = 
  | 'Solicitado'
  | 'Realizado'
  | 'Resultado pendiente'
  | 'Interpretación pendiente'
  | 'Completado'
  | 'Demorado'
  | 'Repetido';

export interface DiagnosticAid {
  id: string;
  auditId?: string;
  requestDate?: string;
  requestedDate?: string;
  performedDate?: string;
  reportedDate?: string;
  studyName?: string;
  name?: string;
  category?: string;
  reason?: string;
  executionDate?: string;
  result?: string;
  resultSummary?: string;
  interpretation?: string;
  status?: DiagnosticAidStatus | string;
  pertinence?: 'Pertinente' | 'No pertinente' | 'En observación';
  pertinenceEvaluation?: 'Pertinente' | 'No pertinente' | 'En observación';
  timeliness?: 'Oportuno' | 'Demorado' | 'Crítico';
  auditorNotes?: string;
}

export type ProcedureStatus = 
  | 'Solicitado'
  | 'Programado'
  | 'Realizado'
  | 'Pendiente'
  | 'Demorado'
  | 'Cancelado';

export interface ProcedureItem {
  id: string;
  auditId?: string;
  date?: string;
  procedureName?: string;
  name?: string;
  indication?: string;
  status?: ProcedureStatus | string;
  result?: string;
  observations?: string;
  pertinenceEvaluation?: 'Pertinente' | 'No pertinente' | 'En observación';
}

export interface TreatmentItem {
  id: string;
  auditId?: string;
  medication?: string;
  medicationName?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  observations?: string;
  pertinenceEvaluation?: 'Pertinente' | 'No pertinente' | 'En observación';
}

export interface AdditionalTreatments {
  auditId: string;
  oxygenSupport: string;
  ventilatorySupport: string;
  rehabilitation: string;
  otherTreatments: string;
}

export type FindingCategory = 
  | 'Oportunidad'
  | 'Pertinencia'
  | 'Calidad asistencial'
  | 'Seguridad del paciente'
  | 'Satisfacción del usuario'
  | 'Administrativo'
  | 'Operativo'
  | 'Estancia'
  | 'Costos'
  | 'Calidad del registro'
  | 'Seguridad'
  | 'Asistencial'
  | 'Financiero';

export type FindingType = FindingCategory | string;

export type FindingPriority = 'Crítico' | 'Alto' | 'Moderado' | 'Bajo' | 'Información insuficiente' | 'Crítica' | 'Alta' | 'Media' | 'Baja';

export type FindingStatus = 'Pendiente' | 'En proceso' | 'Cumplido' | 'Vencido' | 'Cerrado' | 'Abierto' | 'Resuelto' | 'Desestimado';

export interface FindingEvidence {
  sourceDocId?: string;
  sourceDocName?: string;
  pdfPage?: number;
  documentDate?: string;
  documentType?: string;
  evidenceText: string;
  observation?: string;
}

export interface Finding {
  id: string;
  auditId: string;
  patientId: string;
  ipsId: string;
  code?: string;
  category?: FindingCategory;
  type?: FindingType;
  description: string;
  evidenceText?: string;
  evidence?: string;
  evidenceDetails?: FindingEvidence;
  impact?: string;
  clinicalImpact?: string;
  financialImpact?: string;
  service?: string;
  priority: FindingPriority;
  recommendation?: string;
  responsible?: string;
  deadline?: string;
  status: FindingStatus;
  registeredAt?: string;
  registeredBy?: string;
  createdAt?: string;
  resolvedAt?: string;
}

export interface UserSatisfaction {
  id?: string;
  auditId?: string;
  date?: string;
  channel?: string;
  perception?: string;
  comments?: string;
  pqrGenerated?: boolean;
  pqrCode?: string;
  dignifiedTreatment?: 'Sí' | 'No' | 'No informado';
  dxInformation?: 'Sí' | 'No' | 'No informado';
  txInformation?: 'Sí' | 'No' | 'No informado';
  nonConformities?: 'Sí' | 'No';
  nonConformitiesDesc?: string;
  unresolvedNeeds?: 'Sí' | 'No';
  unresolvedNeedsDesc?: string;
  emotionalSupport?: 'Sí' | 'No' | 'No requerido';
  comfort?: 'Adecuado' | 'Inadecuado' | 'No informado';
  observations?: string;
  updatedAt?: string;
}

export type UserSatisfactionRecord = UserSatisfaction;

export interface StayAnalysis {
  auditId: string;
  admissionDate: string;
  currentDate: string;
  stayDays: number;
  clinicalJustification: string;
  prolongedStayRisk: ProlongedStayRisk | boolean;
  administrativeBarriers: string;
  operationalBarriers: string;
  clinicalBarriers: string;
  earlyDischargePossibility: 'Sí' | 'No' | 'En evaluación';
  earlyDischargeNotes?: string;
  ipsActions: string;
  avoidableCostsEstimated?: number;
  updatedAt?: string;
}

export interface RecommendationItem {
  id: string;
  auditId: string;
  findingId?: string;
  findingDescription?: string;
  requiredAction: string;
  responsible: string;
  deadline: string;
  priority: 'Crítico' | 'Alto' | 'Moderado' | 'Bajo';
  isRequiredIn24Hours: boolean;
  status: 'Pendiente' | 'En proceso' | 'Cumplido' | 'Vencido' | 'Cerrado';
  createdAt: string;
}

export type ActionStatus = 'Pendiente' | 'En proceso' | 'Cumplida' | 'Cumplido' | 'Vencida' | 'Vencido' | 'Cerrado';

export interface ActionFollowUpNote {
  date: string;
  auditorName: string;
  observation: string;
}

export interface AuditAction {
  id: string;
  recommendationId?: string;
  auditId: string;
  patientId?: string;
  patientName?: string;
  ipsId?: string;
  ipsName?: string;
  findingCode?: string;
  actionText?: string;
  actionDescription?: string;
  responsible?: string;
  responsibleName?: string;
  responsibleRole?: string;
  deadline?: string;
  deadlineDate?: string;
  priority?: 'Crítico' | 'Alto' | 'Moderado' | 'Bajo' | string;
  status: ActionStatus;
  isRequiredIn24Hours?: boolean;
  service?: string;
  roomBed?: string;
  followUpNotes?: ActionFollowUpNote[];
  createdAt?: string;
  updatedAt?: string;
}

export type CorrectiveAction = AuditAction;

export interface PatientSafetyRecord {
  id?: string;
  auditId?: string;
  eventDate?: string;
  classification?: string;
  description?: string;
  severity?: string;
  immediateAction?: string;
  reportedToCommittee?: boolean;
  adverseEventsReported?: boolean;
  adverseEventsDescription?: string;
  hospitalAcquiredInfections?: boolean;
  infectionSite?: string;
  phlebitisOrCatheterIssues?: boolean;
  pressureUlcers?: boolean;
  fallRiskScore?: string;
  fallOccurred?: boolean;
  safeMedicationAdministration?: boolean;
  safetyAuditorNotes?: string;
}

export interface ProcedureInterconsult {
  id: string;
  auditId?: string;
  name?: string;
  type?: string;
  specialty?: string;
  requestDate?: string;
  requestedDate?: string;
  performedDate?: string;
  answeredDate?: string;
  evaluationDate?: string;
  specialistName?: string;
  status?: 'Solicitada' | 'Realizada' | 'Pendiente' | 'Cancelada' | string;
  pertinence?: 'Pertinente' | 'No pertinente' | string;
  timeliness?: string;
  findingsSummary?: string;
  conductOrRecommendation?: string;
}

export interface MedicationTreatment {
  id: string;
  auditId?: string;
  medication?: string;
  medicationName?: string;
  dose?: string;
  frequency?: string;
  reconciliationStatus?: string;
  doseAndFrequency?: string;
  route?: string;
  startDate?: string;
  isAntibiotic?: boolean;
  antibioticDay?: number;
  pertinence?: 'Pertinente' | 'No pertinente' | 'En revisión' | string;
  notes?: string;
}

export interface AuditTrail {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  action: string;
  affectedRecord: string;
  recordId: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
}

export interface AIAnalysisStructure {
  patientId: string;
  auditId: string;
  ipsId: string;
  documentId: string;
  extractedData: {
    demographics: Record<string, any>;
    vitalsSummary: Record<string, any>;
    medicationsFound: string[];
    labsFound: string[];
    proceduresFound: string[];
  };
  aiAnalysisDraft: {
    clinicalChronology: string[];
    potentialRiskFactors: string[];
    suggestedAuditObservations: string[];
    opportunityAreas: string[];
  };
  auditorValidation: {
    status: 'Pendiente' | 'Aprobado' | 'Modificado' | 'Rechazado';
    auditorNotes?: string;
    validatedAt?: string;
    validatedBy?: string;
  };
  disclaimer: string;
}
