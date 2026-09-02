/**
 * APPLICATION LAYER: Create24HourActionPlanUseCase (FASE 5)
 * Generates and tracks operational 24-48h Action Plans for critical and high-priority audit findings.
 * 
 * Strict Principle:
 * TODO HALLAZGO PRIORITARIO DEBE TENER UN PLAN DE ACCIÓN ASIGNADO CON RESPONSABLE Y FECHA LÍMITE.
 */

import { ContextualFinding, ActionPlan24Hour, ActionPlanStatus } from '../../domain/models/ContextualFinding';
import { logger } from '../../infrastructure/logging/loggerService';

export interface GenerateActionPlanInput {
  findings: ContextualFinding[];
  auditDate?: string;
}

export interface CloseActionPlanInput {
  actionPlanId: string;
  closingEvidenceSnippet: string;
  closingAuditor: string;
  notes?: string;
}

export class Create24HourActionPlanUseCase {
  public execute(input: GenerateActionPlanInput): ActionPlan24Hour[] {
    const auditDateStr = input.auditDate || new Date().toISOString();
    const deadline = new Date(new Date(auditDateStr).getTime() + 24 * 60 * 60 * 1000).toISOString();

    const priorityFindings = input.findings.filter(f =>
      f.tier === 'NIVEL 1 — SEGURIDAD' ||
      f.tier === 'NIVEL 2 — OPORTUNIDAD' ||
      f.tier === 'NIVEL 3 — PERTINENCIA' ||
      f.tier === 'NIVEL 4 — ESTANCIA' ||
      f.isCriticalOrHighPriority
    );

    logger.info('Create24HourActionPlanUseCase', `Generando plan de acción 24h para ${priorityFindings.length} hallazgos prioritarios`);

    const actionPlans: ActionPlan24Hour[] = priorityFindings.map((finding, idx) => {
      let suggestedResponsible: ActionPlan24Hour['suggestedResponsible'] = 'Coordinación Médica IPS';
      let title = `Gestión prioritaria: ${finding.title}`;
      let desc = finding.explainability.auditorVerificationGuide[0] || finding.description;

      if (finding.tier === 'NIVEL 1 — SEGURIDAD') {
        suggestedResponsible = 'Coordinación Médica IPS';
        title = `Protocolo de Seguridad: ${finding.title}`;
      } else if (finding.category === 'Oportunidad') {
        suggestedResponsible = 'Líder de Especialidad';
        title = `Oportunidad Asistencial: ${finding.title}`;
      } else if (finding.tier === 'NIVEL 4 — ESTANCIA') {
        suggestedResponsible = 'Trabajo Social';
        title = `Gestión de Egreso y Barreras: ${finding.title}`;
      } else if (finding.category === 'Pertinencia') {
        suggestedResponsible = 'Servicio Farmacéutico';
      }

      return {
        id: `act-24h-${finding.id}-${idx + 1}`,
        findingId: finding.id,
        actionTitle: title,
        actionDescription: `Acción requerida: ${desc}. Plazo de cumplimiento: 24 horas hábiles.`,
        suggestedResponsible,
        createdAt: auditDateStr,
        deadlineDate: deadline,
        status: 'Pendiente',
        notes: `Generado automáticamente por el motor de auditoría concurrente para el hallazgo [${finding.code}].`
      };
    });

    return actionPlans;
  }

  public closeAction(action: ActionPlan24Hour, input: CloseActionPlanInput): ActionPlan24Hour {
    if (!input.closingEvidenceSnippet || input.closingEvidenceSnippet.trim().length === 0) {
      throw new Error('Se requiere evidencia documental textual para cerrar el plan de acción (NO EVIDENCE -> NO CLAIM).');
    }

    return {
      ...action,
      status: 'Cerrado',
      closingEvidenceSnippet: input.closingEvidenceSnippet,
      closingDate: new Date().toISOString(),
      closingAuditor: input.closingAuditor,
      notes: input.notes || action.notes
    };
  }
}

export const create24HourActionPlanUseCase = new Create24HourActionPlanUseCase();
