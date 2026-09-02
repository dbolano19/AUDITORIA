/**
 * DOMAIN MODEL: TrendAnalysis
 * Time-series progression, slope classification (AUMENTO, DISMINUCIÓN, ESTABLE, DATOS INSUFICIENTES)
 * and recurrence pattern tree (IPS -> Service -> Category -> Type -> Period).
 */

export type TrendDirection = 'AUMENTO' | 'DISMINUCION' | 'ESTABLE' | 'DATOS_INSUFICIENTES';

export interface TimeSeriesPoint {
  periodKey: string; // e.g. "2025-W18", "2025-05", "2025-Q2"
  label: string;
  totalFindings: number;
  priorityFindings: number;
  openActions: number;
  closedActions: number;
  recurrentFindings: number;
  auditsCount: number;
  avgStay: number;
}

export interface MetricTrendAssessment {
  metricName: string;
  direction: TrendDirection;
  directionLabel: string;
  slopePercentage: number;
  currentValue: number;
  previousValue: number;
  confidenceNote: string;
}

export interface RecurrencePatternItem {
  id: string;
  ipsId: string;
  ipsName: string;
  service: string;
  category: string;
  findingType: string;
  descriptionSnippet: string;
  frequency: number;
  firstOccurrenceDate: string;
  lastOccurrenceDate: string;
  associatedRuleId?: string;
  previousActionsTaken: number;
  unresolvedActionsCount: number;
  status: 'Reincidente Crítico' | 'Reincidente Moderado' | 'Patrón Emergente';
  observedPatternType: 'DEMORA' | 'DOCUMENTACION' | 'AUTORIZACION' | 'INTERCONSULTA' | 'RESULTADO_PENDIENTE' | 'PROCEDIMIENTO' | 'CONTINUIDAD' | 'OTRO';
  observedPatternExplanation: string; // e.g. "Patrón observado: Demora en informe oficial de hemocultivos"
}

export interface TrendAnalysisResult {
  granularity: 'day' | 'week' | 'month' | 'quarter';
  timeSeries: TimeSeriesPoint[];
  trends: {
    findingsTrend: MetricTrendAssessment;
    priorityFindingsTrend: MetricTrendAssessment;
    openActionsTrend: MetricTrendAssessment;
    stayTrend: MetricTrendAssessment;
  };
  recurrencePatterns: RecurrencePatternItem[];
  observedPatternsSummary: {
    patternType: string;
    occurrences: number;
    affectedServices: string[];
    affectedIPS: string[];
  }[];
}
