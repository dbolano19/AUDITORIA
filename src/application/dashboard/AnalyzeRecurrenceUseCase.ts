/**
 * USE CASE: AnalyzeRecurrenceUseCase
 * Detects recurring finding patterns across the hierarchy: IPS -> Service -> Category -> Type -> Period.
 * Adheres to principle: classifies findings as "Patrón observado" without ungrounded causal claims.
 */

import { DashboardFilter, RecurrencePatternItem } from '../../domain/models';
import { storageService } from '../../services/storageService';

export class AnalyzeRecurrenceUseCase {
  public execute(filter: DashboardFilter): RecurrencePatternItem[] {
    const allSessions = storageService.getAuditSessions();

    const filtered = allSessions.filter(s => {
      if (filter.ipsId && filter.ipsId !== 'all' && s.ipsId !== filter.ipsId) return false;
      if (filter.service && filter.service !== 'all' && s.clinicalContext.currentService !== filter.service) return false;
      return true;
    });

    const recurrenceMap = new Map<string, {
      ipsId: string;
      ipsName: string;
      service: string;
      category: string;
      title: string;
      description: string;
      ruleId: string;
      dates: string[];
      isCritical: boolean;
      patternType: RecurrencePatternItem['observedPatternType'];
      explanation: string;
    }>();

    filtered.forEach(s => {
      s.findings.forEach(f => {
        const key = `${s.ipsId}__${s.clinicalContext.currentService}__${f.category}`;
        if (!recurrenceMap.has(key)) {
          let patternType: RecurrencePatternItem['observedPatternType'] = 'DOCUMENTACION';
          let explanation = 'Patrón observado: Ausencia de registro o trazabilidad formal en historia clínica.';

          const c = f.category.toLowerCase();
          const d = f.description.toLowerCase();

          if (c.includes('interconsulta') || d.includes('interconsulta') || d.includes('especialista')) {
            patternType = 'INTERCONSULTA';
            explanation = 'Patrón observado: Intervalo prolongado entre solicitud y concepto especializado.';
          } else if (d.includes('laboratorio') || d.includes('cultivo') || d.includes('paraclínico')) {
            patternType = 'RESULTADO_PENDIENTE';
            explanation = 'Patrón observado: Demora en entrega e interpretación de estudios paraclínicos.';
          } else if (c.includes('tratam') || d.includes('medicament') || d.includes('posolog')) {
            patternType = 'CONTINUIDAD';
            explanation = 'Patrón observado: Necesidad de ajuste posológico o conciliación terapéutica.';
          } else if (c.includes('estancia') || d.includes('egreso') || d.includes('barrera')) {
            patternType = 'DEMORA';
            explanation = 'Patrón observado: Tiempos de estancia vinculados a barreras operativas de egreso.';
          }

          recurrenceMap.set(key, {
            ipsId: s.ipsId,
            ipsName: s.ipsName,
            service: s.clinicalContext.currentService,
            category: f.category,
            title: f.title,
            description: f.description,
            ruleId: f.explainability?.ruleId || 'R-01',
            dates: [s.auditDate],
            isCritical: f.isCriticalOrHighPriority || f.tier === 'NIVEL 1 — SEGURIDAD',
            patternType,
            explanation
          });
        } else {
          const item = recurrenceMap.get(key)!;
          item.dates.push(s.auditDate);
          if (f.isCriticalOrHighPriority) item.isCritical = true;
        }
      });
    });

    const result: RecurrencePatternItem[] = [];
    recurrenceMap.forEach((val, key) => {
      const dates = val.dates.sort();
      const frequency = dates.length;
      result.push({
        id: `rec-pt-${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
        ipsId: val.ipsId,
        ipsName: val.ipsName,
        service: val.service,
        category: val.category,
        findingType: val.title,
        descriptionSnippet: val.description.substring(0, 110) + '...',
        frequency,
        firstOccurrenceDate: dates[0] || '2025-05-10',
        lastOccurrenceDate: dates[dates.length - 1] || '2025-05-18',
        associatedRuleId: val.ruleId,
        previousActionsTaken: Math.max(1, frequency - 1),
        unresolvedActionsCount: val.isCritical ? 1 : 0,
        status: val.isCritical ? 'Reincidente Crítico' : frequency >= 3 ? 'Reincidente Moderado' : 'Patrón Emergente',
        observedPatternType: val.patternType,
        observedPatternExplanation: val.explanation
      });
    });

    return result.sort((a, b) => b.frequency - a.frequency);
  }
}
