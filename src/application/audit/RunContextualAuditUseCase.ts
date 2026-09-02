/**
 * APPLICATION LAYER: RunContextualAuditUseCase (FASE 5)
 * Orchestrates the complete contextual audit workflow for an individual patient.
 * 
 * Strict Principle:
 * HISTORIA CLÍNICA -> CONTEXTO -> DIAGNÓSTICOS -> SERVICIOS -> RIESGOS -> CRITERIOS -> COMPARACIÓN -> HALLAZGOS -> ACCIONES 24H
 */

import { BuildPatientContextUseCase, buildPatientContextUseCase, BuildPatientContextInput } from './BuildPatientContextUseCase';
import { SelectApplicableCriteriaUseCase, selectApplicableCriteriaUseCase } from './SelectApplicableCriteriaUseCase';
import { Create24HourActionPlanUseCase, create24HourActionPlanUseCase } from './Create24HourActionPlanUseCase';
import { ComparePreviousAuditUseCase, comparePreviousAuditUseCase } from './ComparePreviousAuditUseCase';
import { AuditSession, AuditSessionType } from '../../domain/models/AuditSession';
import { ContextualFinding, ConflictReview } from '../../domain/models/ContextualFinding';
import { IPSContext } from '../../domain/models/IPSContext';
import { storageService } from '../../services/storageService';
import { logger } from '../../infrastructure/logging/loggerService';

export interface RunContextualAuditInput {
  patientInput: BuildPatientContextInput;
  ipsId?: string;
  auditType?: AuditSessionType;
  auditorId?: string;
  auditorName?: string;
  auditorRole?: string;
  previousSessionId?: string;
}

export class RunContextualAuditUseCase {
  private buildContextUseCase: BuildPatientContextUseCase;
  private selectCriteriaUseCase: SelectApplicableCriteriaUseCase;
  private actionPlanUseCase: Create24HourActionPlanUseCase;
  private compareAuditUseCase: ComparePreviousAuditUseCase;

  constructor(
    buildContextUseCase?: BuildPatientContextUseCase,
    selectCriteriaUseCase?: SelectApplicableCriteriaUseCase,
    actionPlanUseCase?: Create24HourActionPlanUseCase,
    compareAuditUseCase?: ComparePreviousAuditUseCase
  ) {
    this.buildContextUseCase = buildContextUseCase || buildPatientContextUseCase;
    this.selectCriteriaUseCase = selectCriteriaUseCase || selectApplicableCriteriaUseCase;
    this.actionPlanUseCase = actionPlanUseCase || create24HourActionPlanUseCase;
    this.compareAuditUseCase = compareAuditUseCase || comparePreviousAuditUseCase;
  }

  public execute(input: RunContextualAuditInput): AuditSession {
    const auditId = `aud-ctx-${Date.now()}`;
    const auditType = input.auditType || 'AUDITORÍA INICIAL';
    const auditorName = input.auditorName || 'Dr. Auditor Concurrente FOMAG';
    const auditorId = input.auditorId || 'usr-aud-001';
    const ipsId = input.ipsId || input.patientInput.ipsId || 'ips-001';

    logger.info('RunContextualAuditUseCase', `Iniciando auditoría concurrente contextual [${auditId}] para paciente ${input.patientInput.patientName}`);

    // 1. Build Patient Context, Problem Map, and Risk Map
    const contextResult = this.buildContextUseCase.execute(input.patientInput);
    const { patientContext, problemMap, riskMap } = contextResult;

    // 2. Resolve IPS details
    const ipsContext: IPSContext = {
      ipsId,
      name: patientContext.ipsName,
      city: 'Barranquilla',
      department: 'Atlántico',
      country: 'Colombia',
      level: 'Nivel III',
      contractContext: {
        contractNumber: 'FOMAG-ATL-2025-089',
        regime: 'FOMAG Magisterio',
        networkRole: 'Red Principal Hospitalaria',
        activeFrom: '2025-01-01',
        activeTo: '2026-12-31'
      },
      applicableInternalProtocols: [],
      auditSettings: {
        enableInstitutionalProtocolPrecedence: true,
        maxExpectedStayDaysByPathology: {
          'Neumonía': 5,
          'Apendicitis': 3,
          'Colecistitis': 4,
          'Diabetes': 4,
          'Sepsis': 10
        },
        specialtyResponseTimesHours: {
          'Medicina Interna': 12,
          'Cirugía General': 12,
          'Infectología': 24,
          'Neurología': 24,
          'Cardiología': 12
        },
        diagnosticAidTurnaroundHours: {
          'Hemocultivos': 72,
          'TAC / Resonancia': 24,
          'Ecocardiograma': 24,
          'Laboratorios de urgencia': 2
        },
        requiresFomagPriorAuthorizationForHighCost: true
      }
    };

    // 3. Select Applicable Criteria & Run Dynamic Rule Engine
    const criteriaSelection = this.selectCriteriaUseCase.execute({
      patientContext,
      ipsContext,
      auditDate: patientContext.currentDate
    });

    // 4. Generate Contextual Findings from Rule Results & Clinical Problems
    const findings: ContextualFinding[] = [];
    const allSources = storageService.getKnowledgeSources();
    const allCriteria = storageService.getAuditCriteria();

    for (const ruleRes of criteriaSelection.ruleEngineEvaluation.findingsGenerated) {
      const source = allSources.find(s => s.id === ruleRes.sourceUsed.split('(')[1]?.replace(')', '')) ||
        allSources.find(s => s.id === 'FOMAG-001') || allSources[0];
      const criterion = allCriteria.find(c => c.criterionId === ruleRes.criterionUsed.split(':')[0]?.trim()) ||
        allCriteria.find(c => c.criterionId === 'CRIT-004') || allCriteria[0];

      const findingId = `fnd-${auditId}-${findings.length + 1}`;
      const finding: ContextualFinding = {
        id: findingId,
        auditId,
        patientId: patientContext.patientId,
        code: ruleRes.ruleCode,
        category: ruleRes.category as any,
        tier: ruleRes.tier,
        title: ruleRes.findingTitle || ruleRes.ruleName,
        description: ruleRes.findingDescription || ruleRes.activationReason,
        
        // Primary fact evidence (HC)
        factEvidence: ruleRes.evidenceSnippet || 'Evidencia identificada en historia clínica hospitalaria.',
        evidencePage: ruleRes.evidencePage || 1,
        documentType: ruleRes.documentType || 'Historia clínica',
        documentDate: ruleRes.documentDate || patientContext.currentDate,

        // Normative criterion evidence
        criterionEvidence: `${source.name} — ${criterion.title}: ${criterion.requirement}`,
        sourceReferences: [
          {
            sourceId: source.id,
            name: source.name,
            entity: source.entity,
            version: source.version,
            validityStatus: source.validityStatus,
            articleOrSection: criterion.articleOrSection,
            evidenceRequired: criterion.evidenceRequired
          }
        ],
        criterionReferences: [
          {
            criterionId: criterion.criterionId,
            sourceId: source.id,
            category: criterion.category,
            title: criterion.title,
            requirement: criterion.requirement,
            severity: criterion.severity
          }
        ],
        multiSourceBreakdown: {
          medicalRecordSnippet: ruleRes.evidenceSnippet || 'Cita de HC',
          nationalRegulation: source.category === '04_NORMATIVA' ? source.name : undefined,
          clinicalPracticeGuideline: source.category === '02_GUIAS_PRACTICA_CLINICA' ? source.name : undefined,
          fomagGuideline: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG'
        },
        confidenceScore: ruleRes.confidenceScore || 0.90,
        confidenceLevel: (ruleRes.confidenceScore || 0.90) >= 0.85 ? 'ALTA CONFIANZA DOCUMENTAL' : (ruleRes.confidenceScore || 0.90) >= 0.65 ? 'MEDIA' : 'BAJA',
        explainability: {
          ruleId: ruleRes.ruleId,
          ruleName: ruleRes.ruleName,
          activatedReason: ruleRes.activationReason,
          patientDiagnosis: ruleRes.patientDiagnosis || patientContext.primaryDiagnosis,
          service: ruleRes.service || patientContext.currentService,
          eventDetected: ruleRes.eventDetected || 'Evento clínico asistencial',
          sourceUsed: ruleRes.sourceUsed,
          criterionUsed: ruleRes.criterionUsed,
          analysisPerformed: `Evaluación de concordancia entre la atención documentada y el criterio ${criterion.criterionId}.`,
          confidenceScore: ruleRes.confidenceScore || 0.90,
          confidenceJustification: 'Evidencia documental directa con número de página y fuente oficial vigente aplicable.',
          auditorVerificationGuide: ruleRes.auditorVerificationGuide
        },
        auditorValidation: {
          status: 'PENDIENTE'
        },
        temporalStatus: 'NUEVO',
        isCriticalOrHighPriority: ruleRes.tier === 'NIVEL 1 — SEGURIDAD' || ruleRes.tier === 'NIVEL 2 — OPORTUNIDAD' || ruleRes.tier === 'NIVEL 3 — PERTINENCIA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      findings.push(finding);
    }

    // 5. Generate Conflict Reviews (discrepancies in HC)
    const conflicts: ConflictReview[] = patientContext.discrepancies.map((disc, idx) => ({
      id: `conf-${auditId}-${idx + 1}`,
      conflictType: 'HC_CONTRADICTION',
      title: `Discrepancia en ${disc.field}`,
      source1: `Página ${disc.source1Page}: "${disc.source1Text}"`,
      source2: `Página ${disc.source2Page}: "${disc.source2Text}"`,
      detectedConflict: disc.description,
      evidencePage1: disc.source1Page,
      evidencePage2: disc.source2Page,
      date: patientContext.currentDate,
      context: `Historia clínica ${patientContext.patientName} (${patientContext.ipsName})`,
      humanReviewRecommendation: 'El auditor médico debe solicitar nota aclaratoria oficial o confrontar con la epicrisis final.'
    }));

    // 6. Generate 24-Hour Action Plan
    const actions24h = this.actionPlanUseCase.execute({
      findings,
      auditDate: patientContext.currentDate
    });

    // Attach actions to findings
    for (const finding of findings) {
      const action = actions24h.find(a => a.findingId === finding.id);
      if (action) {
        finding.actionPlan24h = action;
      }
    }

    // 7. Temporal comparison if previous session is supplied
    if (input.previousSessionId) {
      const allSessions = storageService.getAuditSessions();
      const previousSession = allSessions.find(s => s.id === input.previousSessionId);
      if (previousSession) {
        this.compareAuditUseCase.execute(findings, previousSession);
      }
    }

    // 8. Compile Executive Summary and Recommendations
    const criticalCount = findings.filter(f => f.tier === 'NIVEL 1 — SEGURIDAD' || f.isCriticalOrHighPriority).length;
    const clinicalSummary = `Paciente de ${patientContext.age} años de edad (${patientContext.sex}), régimen ${patientContext.regime}, hospitalizado en ${patientContext.ipsName} (${patientContext.currentService}) con estancia acumulada de ${patientContext.lengthOfStay} días. Diagnóstico principal: ${patientContext.primaryDiagnosis}. Clasificación clínica: ${patientContext.clinicalClassification}. Se evaluaron ${criteriaSelection.totalCriteriaEvaluated} criterios normativos aplicables, identificando ${findings.length} posibles hallazgos y ${actions24h.length} planes de acción para gestión a 24 horas.`;

    const recommendations: string[] = [
      ...findings.slice(0, 4).map(f => f.explainability.auditorVerificationGuide[0] || f.description),
      'Verificar notas de evolución médica y cumplimiento de órdenes de interconsulta en las próximas 24 horas.',
      'Evaluar criterios de pertinencia para definición de egreso o desescalamiento terapéutico.'
    ];

    const auditSession: AuditSession = {
      id: auditId,
      auditType,
      patientId: patientContext.patientId,
      patientName: patientContext.patientName,
      docNumber: patientContext.docNumber,
      ipsId: patientContext.ipsId,
      ipsName: patientContext.ipsName,
      auditDate: patientContext.currentDate,
      auditorId,
      auditorName,
      auditorRole: input.auditorRole || 'Médico Auditor Concurrente',
      previousAuditId: input.previousSessionId,
      clinicalContext: patientContext,
      problemMap,
      riskMap,
      findings,
      actions24h,
      conflicts,
      globalTrafficLight: patientContext.globalTrafficLight,
      confidenceScore: patientContext.confidenceScore,
      totalFindingsCount: findings.length,
      criticalFindingsCount: criticalCount,
      validatedFindingsCount: 0,
      clinicalDocumentarySummary: clinicalSummary,
      auditorExecutiveConclusion: `Auditoría ${auditType} completada en ${patientContext.ipsName}. Estado semáforo: ${patientContext.globalTrafficLight}. Hallazgos prioritarios: ${criticalCount}. Acciones 24h generadas: ${actions24h.length}.`,
      recommendations,
      status: 'Pendiente de Validación Auditor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to storage
    storageService.saveAuditSession(auditSession);

    return auditSession;
  }
}

export const runContextualAuditUseCase = new RunContextualAuditUseCase();
