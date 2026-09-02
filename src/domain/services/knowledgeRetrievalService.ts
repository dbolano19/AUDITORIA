import {
  KnowledgeSource,
  AuditCriterion,
  KnowledgeRetrievalQuery,
  KnowledgeRetrievalResult,
  NormativePrecedenceChain,
  NormativePrecedenceStep,
  CriterionCategory
} from '../models/knowledgeLibrary';
import { storageService } from '../../services/storageService';

/**
 * DOMAIN SERVICE: KnowledgeRetrievalService (FASE 4)
 * Retrieves official normative sources, clinical practice guidelines, and audit criteria
 * before AI and medical auditors emit findings.
 * 
 * Strict Principle:
 * NO EVIDENCE -> NO CLAIM
 * NO CONVERTIR AUTOMÁTICAMENTE UN DOCUMENTO EN REGLA DE AUDITORÍA
 */
export class KnowledgeRetrievalService {
  /**
   * Main retrieval method for clinical audit context
   */
  public retrieveKnowledge(query: KnowledgeRetrievalQuery): KnowledgeRetrievalResult {
    const allSources = storageService.getKnowledgeSources();
    const allCriteria = storageService.getAuditCriteria();

    const normalizedQueryText = [
      query.diagnosis || '',
      query.clinicalContext || '',
      query.auditCategory || '',
      query.question || '',
      query.service || '',
      ...(query.keywords || [])
    ].join(' ').toLowerCase();

    // 1. Filter and score relevant sources
    const scoredSources: { source: KnowledgeSource; score: number }[] = [];

    for (const source of allSources) {
      // Basic usability check
      if (!source.auditUsable && source.validityStatus === 'DEROGADA') {
        continue;
      }

      let score = 0;

      // Priority weight
      if (source.priority === 'MÁXIMA') score += 5;
      else if (source.priority === 'CRÍTICA') score += 4;
      else if (source.priority === 'ALTA') score += 3;
      else if (source.priority === 'MEDIA') score += 2;
      else score += 1;

      // Category matching
      if (query.auditCategory) {
        const catNorm = query.auditCategory.toLowerCase();
        if (source.category.toLowerCase().includes(catNorm)) score += 8;
      }

      // Diagnosis and clinical keywords matching
      const sourceSearchText = [
        source.id,
        source.name,
        source.summary,
        source.scope,
        source.applicablePopulation,
        source.applicableServices.join(' ')
      ].join(' ').toLowerCase();

      if (query.diagnosis) {
        const diagWords = query.diagnosis.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        for (const word of diagWords) {
          if (sourceSearchText.includes(word)) score += 6;
        }
      }

      if (query.service) {
        const srvLower = query.service.toLowerCase();
        if (source.applicableServices.some(s => s.toLowerCase().includes(srvLower) || srvLower.includes(s.toLowerCase()))) {
          score += 5;
        }
      }

      // Keyword matches
      if (query.keywords) {
        for (const kw of query.keywords) {
          const kwLower = kw.toLowerCase();
          if (sourceSearchText.includes(kwLower)) score += 4;
        }
      }

      // General query terms
      const queryTokens = normalizedQueryText.split(/\s+/).filter(t => t.length > 3);
      for (const token of queryTokens) {
        if (sourceSearchText.includes(token)) score += 2;
      }

      // Always include master concurrent audit guide if query involves general audit
      if (source.id === 'FOMAG-001') {
        score += 3;
      }

      if (score > 6) {
        scoredSources.push({ source, score });
      }
    }

    // Sort sources by score descending
    scoredSources.sort((a, b) => b.score - a.score);
    const relevantSources = scoredSources.map(s => s.source);

    // 2. Retrieve relevant criteria
    const relevantCriteria: AuditCriterion[] = [];
    const sourceIds = new Set(relevantSources.map(s => s.id));

    for (const crit of allCriteria) {
      if (crit.status === 'INACTIVO' || crit.status === 'SUPERADO') continue;

      let critScore = 0;
      if (sourceIds.has(crit.sourceId)) critScore += 5;

      const critSearchText = [
        crit.criterionId,
        crit.title,
        crit.description,
        crit.requirement,
        crit.articleOrSection || '',
        crit.category,
        crit.keywords.join(' '),
        crit.applicableTo.join(' ')
      ].join(' ').toLowerCase();

      // Check category match
      if (query.auditCategory && crit.category.toLowerCase().includes(query.auditCategory.toLowerCase())) {
        critScore += 8;
      }

      // Check clinical tokens
      const queryTokens = normalizedQueryText.split(/\s+/).filter(t => t.length > 3);
      for (const token of queryTokens) {
        if (critSearchText.includes(token)) critScore += 3;
      }

      if (critScore >= 6) {
        relevantCriteria.push(crit);
      }
    }

    // 3. Build Precedence Chains (e.g. Res 3100 -> Res 544 -> Res 465)
    const precedenceChains = this.buildPrecedenceChains(relevantSources, allSources);

    // 4. Temporal Validity Verification
    const temporalWarnings: string[] = [];
    if (query.eventDate) {
      this.checkTemporalApplicability(query.eventDate, relevantSources, relevantCriteria, temporalWarnings);
    }

    // 5. Conflict Detection
    const conflictWarnings = this.detectNormativeConflicts(relevantCriteria);

    // 6. Evidence Checklist Synthesis
    const evidenceChecklist: string[] = [];
    for (const crit of relevantCriteria) {
      if (crit.evidenceRequired && !evidenceChecklist.includes(crit.evidenceRequired)) {
        evidenceChecklist.push(crit.evidenceRequired);
      }
    }

    // 7. Confidence Calculation
    let confidence = 0.5;
    if (relevantSources.length > 0) confidence += 0.2;
    if (relevantCriteria.length > 0) confidence += 0.2;
    if (temporalWarnings.length === 0) confidence += 0.1;
    if (conflictWarnings.length > 0) confidence -= 0.15;
    confidence = Math.max(0.1, Math.min(1.0, confidence));

    // 8. Retrieval Summary
    const retrievalSummary = this.generateSummary(
      query,
      relevantSources,
      relevantCriteria,
      precedenceChains,
      temporalWarnings,
      conflictWarnings
    );

    return {
      query,
      relevantSources,
      relevantCriteria,
      precedenceChains,
      temporalWarnings,
      conflictWarnings,
      evidenceChecklist,
      confidenceLevel: Number(confidence.toFixed(2)),
      retrievalSummary,
      totalSourcesFound: relevantSources.length,
      totalCriteriaFound: relevantCriteria.length
    };
  }

  /**
   * Constructs precedence chains for modified or repealed norms
   */
  public buildPrecedenceChains(
    relevantSources: KnowledgeSource[],
    allSources: KnowledgeSource[]
  ): NormativePrecedenceChain[] {
    const sourceMap = new Map<string, KnowledgeSource>();
    allSources.forEach(s => sourceMap.set(s.id, s));

    const chains: NormativePrecedenceChain[] = [];
    const processedRoots = new Set<string>();

    for (const source of relevantSources) {
      // Check if source has modifying or repealed relationships
      const hasModifiers = (source.modifyingSources && source.modifyingSources.length > 0) ||
                           (source.modifiesSources && source.modifiesSources.length > 0) ||
                           source.validityStatus === 'MODIFICADA';

      if (!hasModifiers) continue;

      // Find the root source in the chain
      let rootId = source.id;
      if (source.modifiesSources && source.modifiesSources.length > 0) {
        rootId = source.modifiesSources[0];
      }

      if (processedRoots.has(rootId)) continue;
      processedRoots.add(rootId);

      const rootSource = sourceMap.get(rootId) || source;
      const steps: NormativePrecedenceStep[] = [
        {
          sourceId: rootSource.id,
          sourceName: rootSource.name,
          relationship: 'BASE',
          validityStatus: rootSource.validityStatus,
          version: rootSource.version,
          year: rootSource.publicationDate?.split('-')[0]
        }
      ];

      // Add modifiers
      let currentApplicableId = rootSource.id;
      const modifiers = rootSource.modifyingSources || [];

      for (const modId of modifiers) {
        const modSource = sourceMap.get(modId);
        if (modSource) {
          steps.push({
            sourceId: modSource.id,
            sourceName: modSource.name,
            relationship: 'MODIFICADA_POR',
            validityStatus: modSource.validityStatus,
            version: modSource.version,
            year: modSource.publicationDate?.split('-')[0]
          });
          if (modSource.validityStatus === 'VIGENTE') {
            currentApplicableId = modSource.id;
          }
        }
      }

      const chainSummary = steps.map(s => `${s.sourceName} (${s.validityStatus})`).join(' ➔ MODIFICADA POR ➔ ');

      chains.push({
        rootSourceId: rootSource.id,
        rootSourceName: rootSource.name,
        chain: steps,
        currentApplicableSourceId: currentApplicableId,
        summary: chainSummary,
        isCompoundApplicability: steps.length > 1
      });
    }

    return chains;
  }

  /**
   * Checks temporal applicability of sources and criteria relative to event date
   */
  private checkTemporalApplicability(
    eventDateStr: string,
    sources: KnowledgeSource[],
    criteria: AuditCriterion[],
    warnings: string[]
  ): void {
    const eventTime = new Date(eventDateStr).getTime();
    if (isNaN(eventTime)) return;

    for (const source of sources) {
      if (source.publicationDate) {
        const pubTime = new Date(source.publicationDate).getTime();
        if (!isNaN(pubTime) && pubTime > eventTime) {
          warnings.push(
            `Fuente posterior al evento: "${source.name}" fue publicada el ${source.publicationDate}, posterior a la fecha del evento clínico (${eventDateStr}). Verificar aplicabilidad temporal antes de emitir hallazgo.`
          );
        }
      }
    }

    for (const crit of criteria) {
      if (crit.effectiveDate) {
        const effTime = new Date(crit.effectiveDate).getTime();
        if (!isNaN(effTime) && effTime > eventTime) {
          warnings.push(
            `Criterio [${crit.criterionId}] "${crit.title}" tiene fecha de vigencia ${crit.effectiveDate}, posterior a la fecha del evento (${eventDateStr}). Requiere verificación temporal.`
          );
        }
      }
    }
  }

  /**
   * Detects potential normative contradictions or overlapping criteria
   */
  private detectNormativeConflicts(criteria: AuditCriterion[]): string[] {
    const conflicts: string[] = [];
    const categoryMap = new Map<string, AuditCriterion[]>();

    for (const crit of criteria) {
      const list = categoryMap.get(crit.category) || [];
      list.push(crit);
      categoryMap.set(crit.category, list);
    }

    // Check for multiple conflicting criteria in same category
    for (const [cat, critList] of categoryMap.entries()) {
      if (critList.length > 1) {
        const distinctSources = new Set(critList.map(c => c.sourceId));
        if (distinctSources.size > 1) {
          const sourceNames = critList.map(c => `${c.criterionId} (${c.sourceVersion})`).join(' vs ');
          conflicts.push(
            `CONFLICTO / POSIBLE SUPERPOSICIÓN NORMATIVA en categoría "${cat}": Se identificaron criterios concurrentes (${sourceNames}). Se requiere validación por el auditor médico.`
          );
        }
      }
    }

    return conflicts;
  }

  /**
   * Generates a clear executive summary of knowledge retrieval
   */
  private generateSummary(
    query: KnowledgeRetrievalQuery,
    sources: KnowledgeSource[],
    criteria: AuditCriterion[],
    chains: NormativePrecedenceChain[],
    temporalWarnings: string[],
    conflictWarnings: string[]
  ): string {
    const parts: string[] = [];
    parts.push(`Se identificaron ${sources.length} fuentes y ${criteria.length} criterios aplicables para el contexto.`);

    if (chains.length > 0) {
      parts.push(`Cadenas normativas identificadas: ${chains.map(c => c.summary).join('; ')}.`);
    }

    if (temporalWarnings.length > 0) {
      parts.push(`Alertas temporales (${temporalWarnings.length}): ${temporalWarnings[0]}`);
    }

    if (conflictWarnings.length > 0) {
      parts.push(`Superposiciones detectadas: ${conflictWarnings.length} requieren arbitraje del auditor.`);
    }

    return parts.join(' ');
  }
}

export const knowledgeRetrievalService = new KnowledgeRetrievalService();
