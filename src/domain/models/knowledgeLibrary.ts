/**
 * DOMAIN LAYER - Knowledge Library & Audit Criteria Models (FASE 4)
 * Master Knowledge, Normative Precedence, and Clinical Criteria Architecture.
 * 
 * Strict Principle:
 * NO CONVERTIR AUTOMÁTICAMENTE UN DOCUMENTO EN UNA REGLA DE AUDITORÍA.
 * Before using a source, determine:
 * Identity, Entity, Type, Date, Version, Validity, Modifications, Repeals, Scope,
 * Articles/Sections, Specific Criterion, and Required Verifiable Evidence.
 */

export type KnowledgeCategory =
  | '01_AUDITORIA_CONCURRENTE'
  | '02_GUIAS_PRACTICA_CLINICA'
  | '03_PROTOCOLOS_INS'
  | '04_NORMATIVA'
  | '05_LINEAMIENTOS_FOMAG'
  | '06_SEGURIDAD_PACIENTE'
  | '07_OTROS';

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  '01_AUDITORIA_CONCURRENTE': '01 — Auditoría Concurrente',
  '02_GUIAS_PRACTICA_CLINICA': '02 — Guías de Práctica Clínica',
  '03_PROTOCOLOS_INS': '03 — Protocolos INS',
  '04_NORMATIVA': '04 — Normativa Nacional',
  '05_LINEAMIENTOS_FOMAG': '05 — Lineamientos y Acuerdos FOMAG',
  '06_SEGURIDAD_PACIENTE': '06 — Seguridad del Paciente',
  '07_OTROS': '07 — Otros Planes y Políticas'
};

export type ValidityStatus =
  | 'VIGENTE'                     // 🟢 Vigente
  | 'VIGENCIA_POR_VERIFICAR'      // 🟡 Vigencia por verificar
  | 'MODIFICADA'                  // 🟠 Modificada (no usar aisladamente)
  | 'DEROGADA'                    // 🔴 Derogada / No utilizar
  | 'INFORMACION_INSUFICIENTE';   // ⚪ Información insuficiente

export const VALIDITY_STATUS_LABELS: Record<ValidityStatus, { label: string; icon: string; color: string; badgeClass: string }> = {
  VIGENTE: {
    label: 'Vigente',
    icon: '🟢',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  VIGENCIA_POR_VERIFICAR: {
    label: 'Vigencia por verificar',
    icon: '🟡',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  MODIFICADA: {
    label: 'Modificada (revisar cadena)',
    icon: '🟠',
    color: 'orange',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  DEROGADA: {
    label: 'Derogada / No utilizar',
    icon: '🔴',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  INFORMACION_INSUFICIENTE: {
    label: 'Información insuficiente',
    icon: '⚪',
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

export type SourcePriority = 'MÁXIMA' | 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA';

export type SourceDocumentType =
  | 'Auditoría'
  | 'Informe'
  | 'Contratación'
  | 'GPC'
  | 'Protocolos'
  | 'Ley'
  | 'Decreto'
  | 'Resolución'
  | 'Acuerdo'
  | 'Modelo'
  | 'Acuerdo operativo'
  | 'Circular'
  | 'Lineamiento'
  | 'Guía'
  | 'Plan'
  | 'Otro';

/**
 * Knowledge Source Entity (Fuente de Conocimiento)
 */
export interface KnowledgeSource {
  id: string; // e.g. "FOMAG-001", "NOR-006", "GPC-001"
  name: string; // e.g. "Resolución 3100 de 2019 — Habilitación"
  entity: string; // "FOMAG" | "Ministerio de Salud" | "INS" | "Función Pública" | string
  category: KnowledgeCategory;
  type: SourceDocumentType;
  priority: SourcePriority;
  publicationDate?: string; // YYYY-MM-DD
  version: string;
  validityStatus: ValidityStatus;
  validityCheckedAt?: string; // ISO date of last official check
  validityCheckedBy?: string; // Auditor or system user
  validityObservations?: string;
  officialUrl?: string;
  hasLocalDocument: boolean; // false if registered only by URL
  localDocumentUrl?: string;
  localDocumentFileName?: string;
  summary: string;
  scope: string;
  applicablePopulation: string;
  applicableServices: string[];
  relatedSources: string[]; // IDs of related sources
  modifyingSources: string[]; // IDs of sources that modify this source
  repealingSources: string[]; // IDs of sources that repeal this source
  modifiesSources?: string[]; // IDs of sources this source modifies
  repealsSources?: string[]; // IDs of sources this source repeals
  criteria: string[]; // IDs of criteria belonging to this source
  auditUsable: boolean; // Whether AI and auditor may cite this source
  createdAt: string;
  updatedAt: string;
}

/**
 * Criterion Categories according to FOMAG Audit Framework
 */
export type CriterionCategory =
  | 'PERTINENCIA'
  | 'OPORTUNIDAD'
  | 'CALIDAD_ASISTENCIAL'
  | 'SEGURIDAD_PACIENTE'
  | 'ESTANCIA'
  | 'HISTORIA_CLINICA'
  | 'TRATAMIENTO'
  | 'AYUDAS_DIAGNOSTICAS'
  | 'PROCEDIMIENTOS'
  | 'INTERCONSULTAS'
  | 'REFERENCIA_CONTRARREFERENCIA'
  | 'SATISFACCION'
  | 'ADMINISTRATIVO'
  | 'COSTOS'
  | 'HABILITACION'
  | 'RIPS_FACTURACION'
  | 'OTROS';

export const CRITERION_CATEGORY_LABELS: Record<CriterionCategory, string> = {
  PERTINENCIA: 'Pertinencia',
  OPORTUNIDAD: 'Oportunidad',
  CALIDAD_ASISTENCIAL: 'Calidad Asistencial',
  SEGURIDAD_PACIENTE: 'Seguridad del Paciente',
  ESTANCIA: 'Estancia Hospitalaria',
  HISTORIA_CLINICA: 'Historia Clínica y Registros',
  TRATAMIENTO: 'Tratamiento y Farmacología',
  AYUDAS_DIAGNOSTICAS: 'Ayudas Diagnósticas y Laboratorios',
  PROCEDIMIENTOS: 'Procedimientos Quirúrgicos e Invasivos',
  INTERCONSULTAS: 'Interconsultas Médicas',
  REFERENCIA_CONTRARREFERENCIA: 'Referencia y Contrarreferencia',
  SATISFACCION: 'Satisfacción y Trato Digno',
  ADMINISTRATIVO: 'Administrativo y Operativo',
  COSTOS: 'Costos Hospitalarios y Eficiencia',
  HABILITACION: 'Habilitación de Servicios',
  RIPS_FACTURACION: 'RIPS y Facturación Electrónica',
  OTROS: 'Otros Criterios'
};

/**
 * Audit Criterion Entity (Criterio de Auditoría)
 */
export interface AuditCriterion {
  criterionId: string; // e.g. "CRIT-HAB-001", "CRIT-HC-001"
  sourceId: string; // e.g. "NOR-006", "NOR-011"
  sourceVersion: string;
  category: CriterionCategory;
  title: string;
  description: string;
  requirement: string; // Verifiable textual requirement
  articleOrSection?: string; // e.g. "Artículo 4, Numeral 2.1", "Anexo Técnico 1"
  evidenceRequired: string; // Required primary evidence in HC
  applicableTo: string[]; // Services, diagnoses, populations
  severity: 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  effectiveDate: string; // YYYY-MM-DD
  expirationDate?: string; // If superseded/modified
  relatedCriteria?: string[];
  modifyingCriterionId?: string;
  keywords: string[];
  status: 'ACTIVO' | 'INACTIVO' | 'EN_REVISION' | 'SUPERADO';
  auditUsable: boolean;
}

/**
 * Source Verification Log
 */
export interface SourceVerificationLog {
  id: string;
  sourceId: string;
  checkedAt: string;
  checkedBy: string;
  urlChecked: string;
  validityFound: ValidityStatus;
  versionFound: string;
  observations: string;
  decision: 'APROBADO_PARA_AUDITORIA' | 'REQUIERE_VERIFICACION' | 'NO_UTILIZAR';
}

/**
 * Precedence Chain Item
 */
export interface NormativePrecedenceStep {
  sourceId: string;
  sourceName: string;
  relationship: 'BASE' | 'MODIFICADA_POR' | 'DEROGADA_POR' | 'REGLAMENTADA_POR';
  validityStatus: ValidityStatus;
  version: string;
  year?: string;
}

export interface NormativePrecedenceChain {
  rootSourceId: string;
  rootSourceName: string;
  chain: NormativePrecedenceStep[];
  currentApplicableSourceId: string;
  summary: string;
  isCompoundApplicability: boolean;
}

/**
 * Knowledge Retrieval Query
 */
export interface KnowledgeRetrievalQuery {
  diagnosis?: string;
  clinicalContext?: string;
  auditCategory?: CriterionCategory | string;
  question?: string;
  eventDate?: string; // YYYY-MM-DD
  ipsId?: string;
  service?: string;
  keywords?: string[];
}

/**
 * Knowledge Retrieval Result
 */
export interface KnowledgeRetrievalResult {
  query: KnowledgeRetrievalQuery;
  relevantSources: KnowledgeSource[];
  relevantCriteria: AuditCriterion[];
  precedenceChains: NormativePrecedenceChain[];
  temporalWarnings: string[];
  conflictWarnings: string[];
  evidenceChecklist: string[];
  confidenceLevel: number;
  retrievalSummary: string;
  totalSourcesFound: number;
  totalCriteriaFound: number;
}
