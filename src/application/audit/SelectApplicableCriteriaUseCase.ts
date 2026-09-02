/**
 * APPLICATION LAYER: SelectApplicableCriteriaUseCase (FASE 5)
 * Dynamically selects applicable audit criteria, normative sources, and clinical guidelines
 * strictly matching the patient's individual clinical profile, diagnoses, and services.
 * 
 * Strict Principle:
 * NO ASUMIR QUE TODOS LOS CRITERIOS ENCONTRADOS APLICAN.
 * CONSERVAR LAS REGLAS DESCARTADAS CON SU MOTIVO DE NO APLICABILIDAD.
 */

import { PatientClinicalContext } from '../../domain/models/PatientClinicalContext';
import { IPSContext } from '../../domain/models/IPSContext';
import {
  KnowledgeSource,
  AuditCriterion,
  KnowledgeRetrievalResult,
  NormativePrecedenceChain
} from '../../domain/models/knowledgeLibrary';
import { KnowledgeRetrievalService } from '../../domain/services/knowledgeRetrievalService';
import { ContextualAuditRuleEngine, contextualAuditRuleEngine, ContextualRuleEngineResult } from '../../domain/rules/contextualAuditRules';
import { storageService } from '../../services/storageService';
import { logger } from '../../infrastructure/logging/loggerService';

export interface SelectApplicableCriteriaInput {
  patientContext: PatientClinicalContext;
  ipsContext?: IPSContext;
  auditDate?: string;
}

export interface ApplicableCriteriaSelectionResult {
  patientId: string;
  totalCriteriaEvaluated: number;
  applicableCriteria: {
    criterion: AuditCriterion;
    source: KnowledgeSource;
    applicabilityReason: string;
    targetDomain: string;
  }[];
  discardedCriteria: {
    criterionId: string;
    title: string;
    sourceName: string;
    discardReason: string;
  }[];
  applicableSources: KnowledgeSource[];
  precedenceChains: NormativePrecedenceChain[];
  ruleEngineEvaluation: ContextualRuleEngineResult;
  selectedAt: string;
}

export class SelectApplicableCriteriaUseCase {
  private retrievalService: KnowledgeRetrievalService;
  private ruleEngine: ContextualAuditRuleEngine;

  constructor(
    retrievalService?: KnowledgeRetrievalService,
    ruleEngine?: ContextualAuditRuleEngine
  ) {
    this.retrievalService = retrievalService || new KnowledgeRetrievalService();
    this.ruleEngine = ruleEngine || contextualAuditRuleEngine;
  }

  public execute(input: SelectApplicableCriteriaInput): ApplicableCriteriaSelectionResult {
    const { patientContext, ipsContext } = input;
    logger.info('SelectApplicableCriteriaUseCase', `Seleccionando criterios aplicables para paciente ${patientContext.patientId} (${patientContext.primaryDiagnosis})`);

    const allSources = storageService.getKnowledgeSources();
    const allCriteria = storageService.getAuditCriteria();

    // 1. Run dynamic rule engine evaluation
    const ruleEvaluation = this.ruleEngine.evaluateContext(patientContext, ipsContext);

    // 2. Build retrieval query
    const keywords: string[] = [
      ...patientContext.secondaryDiagnoses,
      ...patientContext.clinicalServices.map(s => s.serviceName),
      ...patientContext.procedures.map(p => p.name),
      ...patientContext.medications.filter(m => m.isAntibiotic).map(m => m.name),
      patientContext.clinicalClassification
    ];

    const retrievalResult: KnowledgeRetrievalResult = this.retrievalService.retrieveKnowledge({
      diagnosis: patientContext.primaryDiagnosis,
      service: patientContext.currentService,
      clinicalContext: patientContext.clinicalClassification,
      keywords: keywords,
      eventDate: input.auditDate || patientContext.currentDate
    });

    // 3. Match and filter criteria with strict applicability rules
    const applicableCriteria: {
      criterion: AuditCriterion;
      source: KnowledgeSource;
      applicabilityReason: string;
      targetDomain: string;
    }[] = [];

    const discardedCriteria: {
      criterionId: string;
      title: string;
      sourceName: string;
      discardReason: string;
    }[] = [];

    for (const criterion of allCriteria) {
      const source = allSources.find(s => s.id === criterion.sourceId);
      if (!source) continue;

      // Usability and status check
      if (source.validityStatus === 'DEROGADA') {
        discardedCriteria.push({
          criterionId: criterion.criterionId,
          title: criterion.title,
          sourceName: source.name,
          discardReason: `Fuente normativa DEROGADA (${source.name}) reemplazada por normativa vigente.`
        });
        continue;
      }

      // Check population applicability (e.g. Pediatría vs Adulto)
      if (source.applicablePopulation.toLowerCase().includes('pediátr') || source.applicablePopulation.toLowerCase().includes('neonato')) {
        if (patientContext.age >= 18) {
          discardedCriteria.push({
            criterionId: criterion.criterionId,
            title: criterion.title,
            sourceName: source.name,
            discardReason: `Criterio exclusivo para población pediátrica. Paciente adulto (${patientContext.age} años).`
          });
          continue;
        }
      }

      if (source.applicablePopulation.toLowerCase().includes('gestante') || source.applicablePopulation.toLowerCase().includes('obstétric')) {
        if (patientContext.clinicalClassification !== 'Obstetricia' && patientContext.sex !== 'F') {
          discardedCriteria.push({
            criterionId: criterion.criterionId,
            title: criterion.title,
            sourceName: source.name,
            discardReason: `Criterio obstétrico no aplicable al perfil clínico del paciente (${patientContext.sex}, ${patientContext.primaryDiagnosis}).`
          });
          continue;
        }
      }

      // Surgical criteria
      if (criterion.category === 'PROCEDIMIENTOS' || criterion.title.toLowerCase().includes('quirúrgic')) {
        const isSurg = patientContext.clinicalClassification === 'Hospitalización quirúrgica' || patientContext.procedures.length > 0;
        if (!isSurg) {
          discardedCriteria.push({
            criterionId: criterion.criterionId,
            title: criterion.title,
            sourceName: source.name,
            discardReason: 'No se identificaron procedimientos quirúrgicos en la historia clínica.'
          });
          continue;
        }
      }

      // Antibiotic criteria
      if (criterion.title.toLowerCase().includes('antimicrob') || criterion.title.toLowerCase().includes('antibiót')) {
        const hasAbx = patientContext.medications.some(m => m.isAntibiotic);
        if (!hasAbx) {
          discardedCriteria.push({
            criterionId: criterion.criterionId,
            title: criterion.title,
            sourceName: source.name,
            discardReason: 'No se identificó prescripción de antibióticos en el expediente.'
          });
          continue;
        }
      }

      // General criteria or matching criteria
      let isMatch = false;
      let reason = '';

      if (source.category === '01_AUDITORIA_CONCURRENTE') {
        isMatch = true;
        reason = 'Criterio transversal de la Guía de Auditoría Concurrente FOMAG aplicable a todas las hospitalizaciones.';
      } else if (source.category === '06_SEGURIDAD_PACIENTE') {
        isMatch = true;
        reason = 'Estándar nacional de seguridad del paciente y prevención de eventos adversos.';
      } else if (source.category === '04_NORMATIVA' && source.name.includes('1995')) {
        isMatch = true;
        reason = 'Norma universal de gestión y calidad del registro de historia clínica.';
      } else if (retrievalResult.relevantSources.some(s => s.id === source.id)) {
        isMatch = true;
        reason = `Correspondencia clínica con diagnóstico (${patientContext.primaryDiagnosis}) o servicio (${patientContext.currentService}).`;
      }

      if (isMatch) {
        applicableCriteria.push({
          criterion,
          source,
          applicabilityReason: reason,
          targetDomain: criterion.category
        });
      } else {
        discardedCriteria.push({
          criterionId: criterion.criterionId,
          title: criterion.title,
          sourceName: source.name,
          discardReason: 'No coincide con los diagnósticos, procedimientos o servicios activos del paciente.'
        });
      }
    }

    const applicableSourceIds = new Set(applicableCriteria.map(ac => ac.source.id));
    const applicableSources = allSources.filter(s => applicableSourceIds.has(s.id));

    return {
      patientId: patientContext.patientId,
      totalCriteriaEvaluated: allCriteria.length,
      applicableCriteria,
      discardedCriteria,
      applicableSources,
      precedenceChains: retrievalResult.precedenceChains,
      ruleEngineEvaluation: ruleEvaluation,
      selectedAt: new Date().toISOString()
    };
  }
}

export const selectApplicableCriteriaUseCase = new SelectApplicableCriteriaUseCase();
