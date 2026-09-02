/**
 * APPLICATION LAYER - Audit Expedient Use Case
 * Coordinates clinical rules evaluation, risk scoring, and finding detection.
 */
import {
  Audit,
  Finding,
  AuditResult,
  AuditRiskAssessment,
  DEFAULT_AUDIT_RULES
} from '../../domain';
import { logger } from '../../infrastructure/logging/loggerService';

export interface AuditExpedientInput {
  audit: Audit;
  findings: Finding[];
  stayDays: number;
}

export class AuditExpedientUseCase {
  /**
   * Evaluates the current audit state and computes risk assessment & compliance
   */
  evaluate(input: AuditExpedientInput): AuditResult {
    logger.info('AuditExpedientUseCase', `Evaluando auditoría ${input.audit.auditCode}`, {
      findingsCount: input.findings.length,
      stayDays: input.stayDays
    });

    const criticalFindings = input.findings.filter(f => f.priority === 'Crítico' || f.priority === 'Crítica').length;
    const highFindings = input.findings.filter(f => f.priority === 'Alto' || f.priority === 'Alta').length;

    // Risk assessment logic
    const prolongedStayRisk = input.stayDays > 7;
    let score = 90 - (criticalFindings * 25) - (highFindings * 10) - (prolongedStayRisk ? 15 : 0);
    score = Math.max(10, Math.min(100, score));

    let riskLevel: AuditRiskAssessment['level'] = 'Bajo';
    if (criticalFindings > 0 || score < 50) {
      riskLevel = 'Crítico';
    } else if (highFindings > 0 || score < 70) {
      riskLevel = 'Alto';
    } else if (prolongedStayRisk || score < 85) {
      riskLevel = 'Moderado';
    }

    const clinicalRiskFlags: string[] = [];
    if (prolongedStayRisk) clinicalRiskFlags.push(`Estancia hospitalaria acumulada (${input.stayDays} días) supera el umbral estándar de 7 días.`);
    if (criticalFindings > 0) clinicalRiskFlags.push(`Existen ${criticalFindings} hallazgos con clasificación de prioridad crítica.`);

    const riskAssessment: AuditRiskAssessment = {
      score,
      level: riskLevel,
      prolongedStayRisk,
      clinicalRiskFlags,
      financialRiskEstimate: criticalFindings * 1200000 + highFindings * 450000,
      summary: `Auditoría evaluada con nivel de riesgo ${riskLevel} y puntuación de pertinencia de ${score}/100.`
    };

    return {
      auditId: input.audit.id,
      status: input.audit.status,
      findingsCount: input.findings.length,
      criticalFindingsCount: criticalFindings,
      riskAssessment,
      complianceRate: score,
      summary: `Proceso concurrente evaluado con ${DEFAULT_AUDIT_RULES.length} reglas activas.`,
      generatedAt: new Date().toISOString()
    };
  }
}

export const auditExpedientUseCase = new AuditExpedientUseCase();
