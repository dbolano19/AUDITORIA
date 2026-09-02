/**
 * DOMAIN MODEL: ClinicalProblemMap (FASE 5)
 * Dynamic correlation map between clinical problems, primary evidence, treatments, diagnostics, and pending items.
 * 
 * Strict Principle:
 * CADA PROBLEMA DEBE TENER SUS PROPIAS EVIDENCIAS DOCUMENTALES.
 */

export interface ClinicalProblemItem {
  id: string;
  diagnosis: string;
  code?: string;
  status: 'Activo' | 'Resuelto' | 'Descartado' | 'En estudio';
  identifiedDate?: string;
  evidencePage: number;
  evidenceSnippet: string;
  
  relatedDiagnosticTests: {
    testId: string;
    testName: string;
    status: string;
    result?: string;
    page: number;
  }[];

  relatedTreatments: {
    medicationId?: string;
    treatmentName: string;
    dose?: string;
    status: string;
    page: number;
  }[];

  pendingItems: {
    itemId: string;
    description: string;
    category: string;
    daysPending: number;
    page: number;
  }[];

  risks: {
    riskType: string;
    level: 'Alto' | 'Medio' | 'Bajo';
    justification: string;
  }[];

  applicableCriteriaIds: string[];
}

export interface ClinicalProblemMap {
  patientId: string;
  auditId: string;
  totalProblems: number;
  activeProblemsCount: number;
  problems: ClinicalProblemItem[];
  generatedAt: string;
}
