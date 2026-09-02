/**
 * USE CASE: BuildDashboardUseCase
 * Central facade orchestrating metrics, 3-IPS comparison, trend analysis, and executive reporting.
 */

import {
  DashboardFilter,
  DEFAULT_DASHBOARD_FILTER,
  DashboardMetricsResult,
  IPSComparisonResult,
  TrendAnalysisResult
} from '../../domain/models';
import { CalculateMetricsUseCase } from './CalculateMetricsUseCase';
import { CompareIPSUseCase } from './CompareIPSUseCase';
import { AnalyzeTrendsUseCase } from './AnalyzeTrendsUseCase';
import { AnalyzeRecurrenceUseCase } from './AnalyzeRecurrenceUseCase';
import { GenerateExecutiveReportUseCase, ExecutiveReportDocument } from './GenerateExecutiveReportUseCase';

export interface ConsolidatedDashboardState {
  filter: DashboardFilter;
  metrics: DashboardMetricsResult;
  comparison: IPSComparisonResult;
  trends: TrendAnalysisResult;
}

export class BuildDashboardUseCase {
  private calculateMetricsUseCase = new CalculateMetricsUseCase();
  private compareIPSUseCase = new CompareIPSUseCase();
  private analyzeTrendsUseCase = new AnalyzeTrendsUseCase();
  private analyzeRecurrenceUseCase = new AnalyzeRecurrenceUseCase();
  private generateExecutiveReportUseCase = new GenerateExecutiveReportUseCase();

  public execute(filter: DashboardFilter = DEFAULT_DASHBOARD_FILTER): ConsolidatedDashboardState {
    const metrics = this.calculateMetricsUseCase.execute(filter);
    const comparison = this.compareIPSUseCase.execute(filter);
    const trends = this.analyzeTrendsUseCase.execute(filter);

    return {
      filter,
      metrics,
      comparison,
      trends
    };
  }

  public generateExecutiveReport(
    state: ConsolidatedDashboardState,
    user: { name: string; role: string }
  ): ExecutiveReportDocument {
    return this.generateExecutiveReportUseCase.execute(
      state.filter,
      state.metrics,
      state.comparison,
      state.trends,
      user
    );
  }

  public exportIndicatorsCSV(state: ConsolidatedDashboardState): string {
    return this.generateExecutiveReportUseCase.exportIndicatorsCSV(state.metrics, state.comparison);
  }

  public exportActionsCSV(state: ConsolidatedDashboardState): string {
    return this.generateExecutiveReportUseCase.exportActionsCSV(state.metrics.actions24h);
  }
}
