/**
 * DOMAIN MODEL: DashboardFilter
 * Comprehensive filtering schema for executive analysis and concurrent audit oversight.
 */

export type DataValidationFilter = 'ALL' | 'CONFIRMED_ONLY' | 'PENDING_ONLY' | 'REJECTED_ONLY';
export type TimePeriodGrouping = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardFilter {
  ipsId: string; // 'all' or specific IPS ID ('ips-001', 'ips-002', 'ips-003')
  service: string; // 'all' or specific service ('UCI', 'Hospitalización', 'Urgencias', etc.)
  auditorId: string; // 'all' or user ID
  status: string; // 'all' | 'En análisis IA' | 'En Auditoría' | 'Validada y Firmada' | 'Cerrada'
  priority: string; // 'all' | 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA'
  category: string; // 'all' or specific finding category
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  validationFilter: DataValidationFilter; // Default: 'CONFIRMED_ONLY' for executive KPIs
  periodGrouping: TimePeriodGrouping; // Default: 'month'
  anonymizePatientData?: boolean; // Default: true for executive view privacy
}

export const DEFAULT_DASHBOARD_FILTER: DashboardFilter = {
  ipsId: 'all',
  service: 'all',
  auditorId: 'all',
  status: 'all',
  priority: 'all',
  category: 'all',
  startDate: '',
  endDate: '',
  validationFilter: 'CONFIRMED_ONLY',
  periodGrouping: 'month',
  anonymizePatientData: true
};
