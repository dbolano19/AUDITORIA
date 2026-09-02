/**
 * DOMAIN MODEL: PatientClinicalContext (FASE 5)
 * Contextual clinical profile derived from structured document analysis of the patient's record.
 * 
 * Strict Principle:
 * SOLO UTILIZAR INFORMACIÓN DOCUMENTADA.
 * NO EVIDENCE -> NO CLAIM.
 */

export type ClinicalClassificationType =
  | 'Hospitalización médica'
  | 'Hospitalización quirúrgica'
  | 'Urgencias'
  | 'UCI'
  | 'Obstetricia'
  | 'Pediatría'
  | 'Neonatología'
  | 'Oncología'
  | 'Trauma'
  | 'Infeccioso'
  | 'Cardiovascular'
  | 'Neurológico'
  | 'Respiratorio'
  | 'Renal'
  | 'Metabólico'
  | 'CONTEXTO NO DETERMINADO';

export type GlobalAuditTrafficLight =
  | '🟢 Sin situaciones prioritarias identificadas'
  | '🟡 Requiere seguimiento'
  | '🟠 Presenta oportunidades relevantes'
  | '🔴 Presenta situaciones prioritarias'
  | '⚪ Información insuficiente';

export type StayEvaluationStatus =
  | '🟢 Estancia explicada documentalmente'
  | '🟡 Estancia requiere seguimiento'
  | '🟠 Potencial oportunidad de gestión'
  | '🔴 Situación prioritaria'
  | '⚪ Información insuficiente';

export type StayBarrierType =
  | 'CLÍNICA'
  | 'ADMINISTRATIVA'
  | 'OPERATIVA'
  | 'SOCIAL'
  | 'DOCUMENTAL';

export interface StructuredDiagnosis {
  id: string;
  code: string;
  name: string;
  type: 'Principal' | 'Secundario' | 'Complicación' | 'Sospecha';
  status: 'Activo' | 'Resuelto' | 'Descartado' | 'En estudio';
  isPrimary?: boolean;
  confirmedByEvidence?: boolean;
  identifiedDate?: string;
  evidencePage: number;
  notes?: string;
}

export interface StructuredServiceEvent {
  id: string;
  serviceName: string;
  startDate: string;
  endDate?: string;
  status: 'Activo' | 'Finalizado' | 'Trasladado';
  evidencePage: number;
  notes?: string;
}

export interface StructuredProcedure {
  id: string;
  name: string;
  indication: string;
  orderDate: string;
  performedDate?: string;
  resultDate?: string;
  status: 'Ordenado' | 'Programado' | 'Realizado' | 'Pendiente' | 'Interrumpido';
  specialist?: string;
  evidencePage: number;
  interruptions?: string;
}

export interface StructuredDiagnosticTest {
  id: string;
  testName: string;
  category: 'Laboratorio' | 'Imágenes' | 'Patología' | 'Cardiodiagnóstico' | 'Endoscopia' | 'Otro';
  indication: string;
  orderDate: string;
  performedDate?: string;
  resultDate?: string;
  interpretationDate?: string;
  clinicalInterpretation?: string;
  associatedDiagnosis?: string;
  isCriticalValue: boolean;
  criticalValueDetail?: string;
  status:
    | 'Orden sin realización identificada'
    | 'Realización sin resultado identificado'
    | 'Resultado sin interpretación identificada'
    | 'Interpretación sin conducta documentada'
    | 'Repetición'
    | 'Completado'
    | 'Pendiente';
  evidencePage: number;
}

export interface AntibioticAuditDetail {
  indication: string;
  relatedDiagnosis: string;
  startDate: string;
  cultureOrdered: boolean;
  cultureDate?: string;
  cultureResult?: string;
  antibiogramReported: boolean;
  durationDays: number;
  status: 'Empírico' | 'Dirigido' | 'Escalado' | 'Desescalado' | 'Suspendido' | 'Prolongado sin justificación';
  evidencePage: number;
}

export interface StructuredMedication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  startDate: string;
  stopDate?: string;
  indication: string;
  isAntibiotic: boolean;
  antibioticDetail?: AntibioticAuditDetail;
  changes: string[];
  administrationDocumented: boolean;
  evidencePage: number;
}

export interface StructuredConsultation {
  id: string;
  specialty: string;
  requestedAt: string;
  performedAt?: string;
  reason: string;
  concept?: string;
  recommendations?: string;
  actionAfterConsult?: string;
  status: 'Solicitada' | 'Realizada' | 'Pendiente' | 'Demorada';
  daysPending?: number;
  evidencePage: number;
}

export interface ClinicalTimelineEvent {
  id: string;
  date: string;
  time?: string;
  eventType:
    | 'Ingreso'
    | 'Traslado'
    | 'Cirugía'
    | 'Procedimiento'
    | 'Deterioro'
    | 'Interconsulta'
    | 'Resultado crítico'
    | 'Cambio terapéutico'
    | 'Alta'
    | 'Reingreso'
    | 'Evento adverso'
    | 'Caída'
    | 'Infección'
    | 'Complicación'
    | 'Fallecimiento'
    | 'Evolución médica';
  description: string;
  documentType: string;
  evidencePage: number;
}

export interface ClinicalChangeRecord {
  id: string;
  date: string;
  changeType:
    | 'Mejoría'
    | 'Deterioro'
    | 'Nuevo diagnóstico'
    | 'Nuevo procedimiento'
    | 'Cambio de tratamiento'
    | 'Cambio de servicio'
    | 'Aparición de riesgo'
    | 'Aparición de complicación documentada';
  description: string;
  evidencePage: number;
}

export interface DiscrepancyRecord {
  id: string;
  field: 'Motivo de ingreso' | 'Diagnóstico principal' | 'Fecha de ingreso' | 'Servicio' | 'Tratamiento' | 'Otro';
  source1Text: string;
  source1Page: number;
  source2Text: string;
  source2Page: number;
  description: string;
  severity: 'Alta' | 'Media' | 'Baja';
}

export interface StayBarrierItem {
  id: string;
  type: StayBarrierType;
  description: string;
  identifiedDate: string;
  evidencePage?: number;
  impactDays?: number;
  responsibleArea?: string;
  status: 'Activa' | 'Superada' | 'En gestión';
}

export interface PendingClinicalItem {
  id: string;
  title: string;
  category: 'Ayuda diagnóstica' | 'Interconsulta' | 'Procedimiento' | 'Epicrisis' | 'Autorización' | 'Traslado' | 'Medicamento';
  orderDate: string;
  daysPending: number;
  evidencePage: number;
  suggestedAction: string;
  priority: '🔴 Crítico' | '🟠 Alto' | '🟡 Moderado';
}

/**
 * Complete patient clinical context data structure
 */
export interface PatientClinicalContext {
  patientId: string;
  patientName: string;
  docNumber: string;
  age: number;
  sex: 'M' | 'F' | 'Otro';
  regime: string; // e.g. FOMAG Magisterio
  ipsId: string;
  ipsName: string;

  // Admission and stay
  admissionDate: string;
  currentDate: string;
  lengthOfStay: number;
  totalHcPages?: number;
  admissionReason: string;
  admissionService: string;
  currentService: string;
  clinicalStatus: 'Estable' | 'En deterioro' | 'Crítico' | 'En recuperación' | 'Egreso/Alta' | 'No determinado';
  dischargeStatus: 'Hospitalizado' | 'Alta médica' | 'Remisión' | 'Fallecido' | 'Retiro voluntario';
  
  // Classification
  clinicalClassification: ClinicalClassificationType;
  stayEvaluation: StayEvaluationStatus;
  stayBarriers: StayBarrierItem[];

  // Diagnoses
  diagnoses: StructuredDiagnosis[];
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];

  // Clinical entities
  clinicalServices: StructuredServiceEvent[];
  procedures: StructuredProcedure[];
  diagnosticTests: StructuredDiagnosticTest[];
  medications: StructuredMedication[];
  consultations: StructuredConsultation[];
  timelineEvents: ClinicalTimelineEvent[];
  clinicalChanges: ClinicalChangeRecord[];
  discrepancies: DiscrepancyRecord[];
  pendingItems: PendingClinicalItem[];

  // Global assessment
  globalTrafficLight: GlobalAuditTrafficLight;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}
