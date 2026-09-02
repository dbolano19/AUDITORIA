/**
 * APPLICATION LAYER: ComparePreviousAuditUseCase (FASE 5)
 * Compares current patient clinical state against previous audit sessions of the same hospitalization.
 * 
 * Strict Principle:
 * TRAZABILIDAD TEMPORAL ENTRE AUDITORÍA INICIAL, SEGUIMIENTO Y REAUDITORÍA.
 * DETECCIÓN AUTOMÁTICA DE HALLAZGOS CERRADOS, REINCIDENTES Y NUEVOS.
 */

import { ContextualFinding, TemporalEvolutionStatus } from '../../domain/models/ContextualFinding';
import { AuditSession } from '../../domain/models/AuditSession';
import { logger } from '../../infrastructure/logging/loggerService';

export interface AuditComparisonResult {
  patientId: string;
  currentAuditId: string;
  previousAuditId: string;
  summary: string;
  newFindings: ContextualFinding[];
  recurrentFindings: {
    currentFinding: ContextualFinding;
    previousFindingId: string;
    evolutionNote: string;
  }[];
  resolvedFindings: {
    previousFindingId: string;
    title: string;
    resolvedEvidence: string;
    resolvedAt: string;
  }[];
  worsenedFindings: ContextualFinding[];
}

export class ComparePreviousAuditUseCase {
  public execute(
    currentFindings: ContextualFinding[],
    previousSession: AuditSession
  ): AuditComparisonResult {
    logger.info('ComparePreviousAuditUseCase', `Comparando auditoría actual con sesión anterior ${previousSession.id} del paciente ${previousSession.patientId}`);

    const newFindings: ContextualFinding[] = [];
    const recurrentFindings: { currentFinding: ContextualFinding; previousFindingId: string; evolutionNote: string }[] = [];
    const resolvedFindings: { previousFindingId: string; title: string; resolvedEvidence: string; resolvedAt: string }[] = [];
    const worsenedFindings: ContextualFinding[] = [];

    const matchedPreviousIds = new Set<string>();

    for (const curr of currentFindings) {
      // Find matching finding in previous session by code or domain similarity
      const prevMatch = previousSession.findings.find(pf =>
        pf.code === curr.code ||
        (pf.category === curr.category && pf.tier === curr.tier)
      );

      if (prevMatch) {
        matchedPreviousIds.add(prevMatch.id);
        curr.previousAuditFindingId = prevMatch.id;

        // Check if worsened (e.g. higher days or worsening words)
        const isWorsened = curr.description.includes('demorada') || curr.description.includes('prolongad') || (curr.tier === 'NIVEL 1 — SEGURIDAD' && prevMatch.tier !== 'NIVEL 1 — SEGURIDAD');

        if (isWorsened) {
          curr.temporalStatus = 'EMPEORADO';
          curr.evolutionNotes = `Hallazgo reincidente con agravamiento respecto a la auditoría anterior (${previousSession.auditDate}).`;
          worsenedFindings.push(curr);
          recurrentFindings.push({
            currentFinding: curr,
            previousFindingId: prevMatch.id,
            evolutionNote: curr.evolutionNotes
          });
        } else {
          curr.temporalStatus = 'ABIERTO_REINCIDENTE';
          curr.evolutionNotes = `Hallazgo persiste sin resolución desde la auditoría anterior (${previousSession.auditDate}).`;
          recurrentFindings.push({
            currentFinding: curr,
            previousFindingId: prevMatch.id,
            evolutionNote: curr.evolutionNotes
          });
        }
      } else {
        curr.temporalStatus = 'NUEVO';
        curr.evolutionNotes = 'Nuevo hallazgo identificado en la presente evolución asistencial.';
        newFindings.push(curr);
      }
    }

    // Check for resolved findings from previous session
    for (const prev of previousSession.findings) {
      if (!matchedPreviousIds.has(prev.id)) {
        resolvedFindings.push({
          previousFindingId: prev.id,
          title: prev.title,
          resolvedEvidence: 'No se identifican criterios de persistencia en la nueva documentación clínica analizada.',
          resolvedAt: new Date().toISOString()
        });
      }
    }

    const summary = `Comparación realizada: ${newFindings.length} nuevos hallazgos, ${recurrentFindings.length} reincidentes y ${resolvedFindings.length} hallazgos cerrados/resueltos.`;

    return {
      patientId: previousSession.patientId,
      currentAuditId: currentFindings[0]?.auditId || 'current-audit',
      previousAuditId: previousSession.id,
      summary,
      newFindings,
      recurrentFindings,
      resolvedFindings,
      worsenedFindings
    };
  }
}

export const comparePreviousAuditUseCase = new ComparePreviousAuditUseCase();
