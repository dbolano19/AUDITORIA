/**
 * DOMAIN MODEL: DashboardSnapshot
 * Immutable representation of a dashboard state at a specific point in time.
 */

import { DashboardFilter } from './DashboardFilter';
import { DashboardMetricsResult } from './DashboardMetrics';

export interface DashboardSnapshot {
  snapshotId: string;
  code: string;
  title: string;
  createdAt: string;
  generatedBy: string;
  auditorRole: string;
  periodText: string;
  ipsScope: string;
  filters: DashboardFilter;
  metrics: DashboardMetricsResult;
  comments?: string;
  hashSHA256?: string;
  version: number;
}
