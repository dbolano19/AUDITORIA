/**
 * DOMAIN MODEL: IPSComparison
 * Comparative structures, cross-matrices, normalization per 100 audits/patients, and sample size safeguards.
 */

export interface IPSComparativeProfile {
  ipsId: string;
  ipsCode: string;
  ipsName: string;
  city: string;
  isRepresentativeSample: boolean; // True if audits >= 5 and patients >= 3
  sampleWarningText?: string;
  
  // Volume
  totalAudits: number;
  auditedPatients: number;
  totalFindings: number;
  priorityFindings: number;
  criticalFindings: number;
  highFindings: number;
  
  // Actions
  openActions: number;
  overdueActions: number;
  closedActions: number;
  totalActions: number;
  actionComplianceRateText: string; // e.g. "85.2%" or "SIN DATOS"
  actionComplianceRateNum: number | null;
  
  // Stays & Recurrence
  averageStayDays: number;
  medianStayDays: number;
  recurrentFindingsCount: number;
  
  // Normalized Rates (Per 100 Audits / Per 100 Patients)
  rateFindingsPer100Audits: number;
  ratePriorityFindingsPer100Audits: number;
  rateCriticalFindingsPer100Patients: number;
  rateOverdueActionsPer100Audits: number;
  rateDocumentalDefectsPer100Audits: number;
  
  // Categories breakdown
  categoryBreakdown: {
    category: string;
    count: number;
    ratePer100Audits: number;
  }[];
  
  // Quality & Risk
  trafficLightState: 'FAVORABLE' | 'REQUIERE_SEGUIMIENTO' | 'OPORTUNIDADES_RELEVANTES' | 'SITUACIONES_PRIORITARIAS' | 'INFORMACION_INSUFICIENTE';
}

export interface IPSCategoryMatrixRow {
  category: string;
  bonadonaCount: number;
  bonadonaRate: number; // per 100 audits
  misericordiaCount: number;
  misericordiaRate: number; // per 100 audits
  costaCount: number;
  costaRate: number; // per 100 audits
  totalNetwork: number;
}

export interface IPSServiceMatrixRow {
  service: string;
  bonadonaFindings: number;
  bonadonaPriority: number;
  bonadonaAudits: number;
  misericordiaFindings: number;
  misericordiaPriority: number;
  misericordiaAudits: number;
  costaFindings: number;
  costaPriority: number;
  costaAudits: number;
  totalFindings: number;
}

export interface IPSComparisonResult {
  comparisonDate: string;
  periodText: string;
  overallNetworkAudits: number;
  overallNetworkPatients: number;
  overallNetworkFindings: number;
  overallNetworkPriority: number;
  
  profiles: {
    bonadona: IPSComparativeProfile;
    misericordia: IPSComparativeProfile;
    costa: IPSComparativeProfile;
  };
  
  categoryMatrix: IPSCategoryMatrixRow[];
  serviceMatrix: IPSServiceMatrixRow[];
  
  comparabilitySafeguards: {
    hasInsufficientSampleWarning: boolean;
    insufficientIPSNames: string[];
    notice: string;
  };
}
