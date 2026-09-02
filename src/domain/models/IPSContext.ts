/**
 * DOMAIN MODEL: IPSContext (FASE 5)
 * Contextual model for healthcare institutions (IPS) in Barranquilla, Atlántico.
 * 
 * Manages institutional protocols, contract scope, and multi-IPS aggregated comparative indicators.
 */

export interface InstitutionalProtocol {
  id: string;
  ipsId: string;
  name: string;
  service: string;
  documentType: 'Protocolo Institucional' | 'Guía Interna' | 'Manual de Procesos' | 'Vía Clínica';
  version: string;
  validityStatus: 'VIGENTE' | 'MODIFICADA' | 'DEROGADA';
  publicationDate: string;
  fileUrl?: string;
  scope: string;
  criteria: {
    criterionId: string;
    title: string;
    requirement: string;
    evidenceRequired: string;
  }[];
}

export interface IPSAuditSetting {
  enableInstitutionalProtocolPrecedence: boolean;
  maxExpectedStayDaysByPathology: Record<string, number>;
  specialtyResponseTimesHours: Record<string, number>;
  diagnosticAidTurnaroundHours: Record<string, number>;
  requiresFomagPriorAuthorizationForHighCost: boolean;
}

export interface IPSContext {
  ipsId: string;
  name: string;
  city: string; // 'Barranquilla'
  department: string; // 'Atlántico'
  country: string; // 'Colombia'
  level: string; // 'Nivel III' | 'Nivel IV'
  contractContext: {
    contractNumber: string;
    regime: string; // 'FOMAG Magisterio'
    networkRole: 'Red Principal Hospitalaria' | 'Red Complementaria de Alta Complejidad';
    activeFrom: string;
    activeTo: string;
  };
  applicableInternalProtocols: InstitutionalProtocol[];
  auditSettings: IPSAuditSetting;
}

export interface IPSAggregatedMetrics {
  ipsId: string;
  ipsName: string;
  totalAudits: number;
  activePatients: number;
  totalFindings: number;
  criticalFindings: number;
  averageStayDays: number;
  pendingItemsCount: number;
  documentaryIssuesRate: number; // Percentage
  actionPlanComplianceRate: number; // Percentage
  topRecurringFindings: {
    category: string;
    count: number;
    trend: 'INCREMENTO' | 'ESTABLE' | 'REDUCCIÓN';
  }[];
}
