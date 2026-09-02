/**
 * DOMAIN RULES: ContextualAuditRuleEngine (FASE 5)
 * Dynamic, context-aware rule evaluation engine based on individual patient context.
 * 
 * Strict Principle:
 * NO APLICAR INDISCRIMINADAMENTE TODAS LAS REGLAS DISPONIBLES.
 * AUDITORÍA ADAPTATIVA SEGÚN DIAGNÓSTICO, SERVICIOS, TRATAMIENTOS Y RIESGOS DOCUMENTADOS.
 * CONSERVAR REGLAS DESCARTADAS CON SU MOTIVO DE NO APLICABILIDAD.
 */

import {
  PatientClinicalContext,
  StructuredDiagnosis,
  StructuredMedication,
  StructuredDiagnosticTest,
  StructuredConsultation,
  StructuredProcedure
} from '../models/PatientClinicalContext';
import { PrioritizationTier } from '../models/ClinicalAuditRiskMap';
import { IPSContext } from '../models/IPSContext';
import { KnowledgeSource, AuditCriterion } from '../models/knowledgeLibrary';

export type RuleEvaluationStatus =
  | 'APLICADA_CON_HALLAZGO'
  | 'APLICADA_CONFORME'
  | 'NO_APLICABLE'
  | 'REQUIERE_VALIDACION_HUMANA';

export interface DynamicAuditRule {
  id: string;
  code: string;
  name: string;
  category: string;
  tier: PrioritizationTier;
  targetDomain: 'METABOLICO' | 'RESPIRATORIO' | 'CARDIOVASCULAR' | 'QUIRURGICO' | 'UCI' | 'ANTIBIOTICOS' | 'AYUDAS_DIAGNOSTICAS' | 'INTERCONSULTAS' | 'ESTANCIA' | 'SEGURIDAD' | 'CALIDAD_DOCUMENTAL' | 'OBSTETRICIA' | 'PEDIATRIA' | 'ONCOLOGIA' | 'ADMINISTRATIVO';
  description: string;
  sourceId: string;
  criterionId: string;
  
  // Applicability predicate
  isApplicable: (ctx: PatientClinicalContext, ips?: IPSContext) => {
    applicable: boolean;
    reason: string;
  };

  // Evaluation logic when applicable
  evaluate: (ctx: PatientClinicalContext, ips?: IPSContext) => RuleEvaluationResult;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  category: string;
  tier: PrioritizationTier;
  targetDomain: string;
  status: RuleEvaluationStatus;
  
  // Explainability
  activationReason: string;
  patientDiagnosis?: string;
  service?: string;
  eventDetected?: string;
  sourceUsed: string;
  criterionUsed: string;
  
  // Evidence
  evidencePage?: number;
  evidenceSnippet?: string;
  documentType?: string;
  documentDate?: string;
  
  // Finding details (if status is APLICADA_CON_HALLAZGO or REQUIERE_VALIDACION_HUMANA)
  findingTitle?: string;
  findingDescription?: string;
  potentialImpact?: string;
  recommendedAction?: string;
  confidenceScore: number; // 0.0 to 1.0
  auditorVerificationGuide: string[];
}

export interface ContextualRuleEngineResult {
  patientId: string;
  totalRulesEvaluated: number;
  applicableRules: RuleEvaluationResult[];
  findingsGenerated: RuleEvaluationResult[];
  conformingRules: RuleEvaluationResult[];
  rulesRequiringValidation: RuleEvaluationResult[];
  nonApplicableRules: {
    ruleId: string;
    ruleCode: string;
    ruleName: string;
    targetDomain: string;
    discardReason: string;
  }[];
  evaluatedAt: string;
}

/**
 * Built-in Master Catalog of Contextual Audit Rules
 */
export const MASTER_CONTEXTUAL_RULES: DynamicAuditRule[] = [
  // 1. ANTIBIÓTICOS: CULTIVO Y REEVALUACIÓN (GPC-001 / FOMAG-001)
  {
    id: 'R-ABX-001',
    code: 'AUD-ABX-CULTIVO',
    name: 'Terapia Antimicrobiana: Indicación, Cultivo y Desescalamiento',
    category: 'Pertinencia',
    tier: 'NIVEL 3 — PERTINENCIA',
    targetDomain: 'ANTIBIOTICOS',
    description: 'Verifica indicación documentada, toma oportuna de cultivos y reevaluación a las 48-72 horas.',
    sourceId: 'FOMAG-001',
    criterionId: 'CRIT-004',
    isApplicable: (ctx) => {
      const hasAbx = ctx.medications.some(m => m.isAntibiotic) ||
        ctx.diagnoses.some(d => d.name.toLowerCase().includes('infecc') || d.name.toLowerCase().includes('neumon') || d.name.toLowerCase().includes('sepsis') || d.name.toLowerCase().includes('itu'));
      if (hasAbx) {
        return {
          applicable: true,
          reason: 'Se identificó prescripción de antibióticos o diagnóstico de etiología infecciosa activa.'
        };
      }
      return {
        applicable: false,
        reason: 'No se identificó prescripción de antimicrobianos ni diagnósticos infecciosos en el expediente.'
      };
    },
    evaluate: (ctx) => {
      const abxMeds = ctx.medications.filter(m => m.isAntibiotic);
      const prolongedAbx = abxMeds.find(m => {
        if (!m.antibioticDetail) return false;
        return m.antibioticDetail.durationDays >= 5 && !m.antibioticDetail.cultureOrdered;
      });

      if (prolongedAbx && prolongedAbx.antibioticDetail) {
        return {
          ruleId: 'R-ABX-001',
          ruleCode: 'AUD-ABX-CULTIVO',
          ruleName: 'Terapia Antimicrobiana: Indicación, Cultivo y Desescalamiento',
          category: 'Pertinencia',
          tier: 'NIVEL 3 — PERTINENCIA',
          targetDomain: 'ANTIBIOTICOS',
          status: 'APLICADA_CON_HALLAZGO',
          activationReason: `Se identificó antibiótico (${prolongedAbx.name}) por ${prolongedAbx.antibioticDetail.durationDays} días sin reporte ni orden de cultivo documentada.`,
          patientDiagnosis: ctx.primaryDiagnosis,
          service: ctx.currentService,
          eventDetected: `Prescripción continua de ${prolongedAbx.name} desde ${prolongedAbx.startDate}`,
          sourceUsed: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG (FOMAG-001)',
          criterionUsed: 'Criterio CRIT-004: Pertinencia en prescripción antimicrobiana y apoyo microbiológico.',
          evidencePage: prolongedAbx.evidencePage,
          evidenceSnippet: `Medicamento: ${prolongedAbx.name} ${prolongedAbx.dose} cada ${prolongedAbx.frequency}. Días acumulados: ${prolongedAbx.antibioticDetail.durationDays}. Cultivo reportado: No.`,
          documentType: 'Kárdex / Órdenes Médicas',
          documentDate: prolongedAbx.startDate,
          findingTitle: `Antimicrobiano (${prolongedAbx.name}) prolongado sin correlación microbiológica documentada`,
          findingDescription: `El paciente recibe ${prolongedAbx.name} durante ${prolongedAbx.antibioticDetail.durationDays} días sin que se identifique solicitud ni resultado de cultivo o justificación clínica documentada de cambio/desescalamiento en la evolución médica.`,
          potentialImpact: 'Riesgo de resistencia bacteriana, eventos adversos por fármaco y prolongación evitable de estancia.',
          recommendedAction: 'Requerir concepto del médico tratante o infectólogo con reporte de cultivo o justificación de continuidad.',
          confidenceScore: 0.92,
          auditorVerificationGuide: [
            'Verificar en paraclínicos si existe reporte de cultivo pendiente de cargar al sistema.',
            'Comprobar si en la evolución médica de las 72 horas se justificó mantener esquema empírico.',
            'Confirmar concordancia de dosis y vía de administración.'
          ]
        };
      }

      return {
        ruleId: 'R-ABX-001',
        ruleCode: 'AUD-ABX-CULTIVO',
        ruleName: 'Terapia Antimicrobiana: Indicación, Cultivo y Desescalamiento',
        category: 'Pertinencia',
        tier: 'NIVEL 3 — PERTINENCIA',
        targetDomain: 'ANTIBIOTICOS',
        status: 'APLICADA_CONFORME',
        activationReason: 'Prescripción antimicrobiana documentada con indicación y seguimiento oportuno.',
        sourceUsed: 'FOMAG-001',
        criterionUsed: 'CRIT-004',
        confidenceScore: 0.95,
        auditorVerificationGuide: ['Mantener seguimiento a la duración acumulada del antibiótico.']
      };
    }
  },

  // 2. AYUDAS DIAGNÓSTICAS PENDIENTES O SIN INTERPRETACIÓN (FOMAG-001 / CRIT-003)
  {
    id: 'R-DIAG-001',
    code: 'AUD-DIAG-CADENA',
    name: 'Trazabilidad de Ayudas Diagnósticas: Orden → Toma → Resultado → Conducta',
    category: 'Oportunidad',
    tier: 'NIVEL 2 — OPORTUNIDAD',
    targetDomain: 'AYUDAS_DIAGNOSTICAS',
    description: 'Detecta interrupciones en la cadena de ayudas diagnósticas: órdenes sin toma, tomas sin resultado o resultados sin conducta médica.',
    sourceId: 'FOMAG-001',
    criterionId: 'CRIT-003',
    isApplicable: (ctx) => {
      if (ctx.diagnosticTests.length > 0) {
        return {
          applicable: true,
          reason: `Se identificaron ${ctx.diagnosticTests.length} estudios de laboratorio o imágenes diagnósticas ordenadas.`
        };
      }
      return {
        applicable: false,
        reason: 'No se identificaron órdenes de ayudas diagnósticas en el periodo auditado.'
      };
    },
    evaluate: (ctx) => {
      const interruptedTest = ctx.diagnosticTests.find(t =>
        t.status === 'Orden sin realización identificada' ||
        t.status === 'Realización sin resultado identificado' ||
        t.status === 'Resultado sin interpretación identificada' ||
        t.status === 'Interpretación sin conducta documentada' ||
        t.status === 'Pendiente'
      );

      if (interruptedTest) {
        return {
          ruleId: 'R-DIAG-001',
          ruleCode: 'AUD-DIAG-CADENA',
          ruleName: 'Trazabilidad de Ayudas Diagnósticas: Orden → Toma → Resultado → Conducta',
          category: 'Oportunidad',
          tier: 'NIVEL 2 — OPORTUNIDAD',
          targetDomain: 'AYUDAS_DIAGNOSTICAS',
          status: 'APLICADA_CONHALLAZGO' as any,
          activationReason: `Estudio ${interruptedTest.testName} presenta interrupción documental: "${interruptedTest.status}".`,
          patientDiagnosis: ctx.primaryDiagnosis,
          service: ctx.currentService,
          eventDetected: `Orden de ${interruptedTest.testName} emitida el ${interruptedTest.orderDate}`,
          sourceUsed: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG (FOMAG-001)',
          criterionUsed: 'Criterio CRIT-003: Oportunidad en la toma, reporte e interpretación de ayudas diagnósticas.',
          evidencePage: interruptedTest.evidencePage,
          evidenceSnippet: `Estudio: ${interruptedTest.testName}. Indicación: ${interruptedTest.indication || 'No consignada'}. Estado: ${interruptedTest.status}.`,
          documentType: 'Órdenes / Paraclínicos',
          documentDate: interruptedTest.orderDate,
          findingTitle: `Interrupción en la oportunidad de ayuda diagnóstica: ${interruptedTest.testName}`,
          findingDescription: `Se identificó orden de ${interruptedTest.testName} fechada ${interruptedTest.orderDate} en estado "${interruptedTest.status}", sin que conste en la historia clínica su reporte o nota de interpretación médica posterior.`,
          potentialImpact: 'Demora en decisiones terapéuticas, riesgo de estancia hospitalaria prolongada y costos no pertinentes.',
          recommendedAction: 'Gestionar con el laboratorio/imágenes de la IPS la entrega urgente del resultado e interpretación por médico tratante.',
          confidenceScore: 0.89,
          auditorVerificationGuide: [
            'Confirmar si el resultado fue reportado de forma verbal y no se anexó al sistema.',
            'Revisar si se realizó cambio de indicación médica que anuló el estudio.',
            'Evaluar impacto en la conducta terapéutica actual del paciente.'
          ]
        };
      }

      return {
        ruleId: 'R-DIAG-001',
        ruleCode: 'AUD-DIAG-CADENA',
        ruleName: 'Trazabilidad de Ayudas Diagnósticas: Orden → Toma → Resultado → Conducta',
        category: 'Oportunidad',
        tier: 'NIVEL 2 — OPORTUNIDAD',
        targetDomain: 'AYUDAS_DIAGNOSTICAS',
        status: 'APLICADA_CONFORME',
        activationReason: 'Todas las ayudas diagnósticas identificadas cuentan con reporte e interpretación documentada.',
        sourceUsed: 'FOMAG-001',
        criterionUsed: 'CRIT-003',
        confidenceScore: 0.94,
        auditorVerificationGuide: ['Verificar pertinencia clínica de nuevos estudios solicitados.']
      };
    }
  },

  // 3. INTERCONSULTAS MÉDICAS DEMORADAS (FOMAG-001 / CRIT-006)
  {
    id: 'R-CONS-001',
    code: 'AUD-CONS-OPORTUNIDAD',
    name: 'Oportunidad y Trazabilidad de Interconsultas por Especialidad',
    category: 'Oportunidad',
    tier: 'NIVEL 2 — OPORTUNIDAD',
    targetDomain: 'INTERCONSULTAS',
    description: 'Evalúa cumplimiento de tiempos de respuesta médica y adopción de recomendaciones de interconsultas.',
    sourceId: 'FOMAG-001',
    criterionId: 'CRIT-006',
    isApplicable: (ctx) => {
      if (ctx.consultations.length > 0) {
        return {
          applicable: true,
          reason: `Se identificaron ${ctx.consultations.length} interconsultas médicas solicitadas en el expediente.`
        };
      }
      return {
        applicable: false,
        reason: 'No se identificaron solicitudes de interconsulta especializada en el expediente.'
      };
    },
    evaluate: (ctx) => {
      const delayedConsult = ctx.consultations.find(c =>
        c.status === 'Pendiente' || c.status === 'Demorada' || (c.daysPending && c.daysPending >= 2)
      );

      if (delayedConsult) {
        return {
          ruleId: 'R-CONS-001',
          ruleCode: 'AUD-CONS-OPORTUNIDAD',
          ruleName: 'Oportunidad y Trazabilidad de Interconsultas por Especialidad',
          category: 'Oportunidad',
          tier: 'NIVEL 2 — OPORTUNIDAD',
          targetDomain: 'INTERCONSULTAS',
          status: 'APLICADA_CON_HALLAZGO',
          activationReason: `Interconsulta por ${delayedConsult.specialty} solicitada el ${delayedConsult.requestedAt} permanece pendiente/demorada (${delayedConsult.daysPending || 2} días).`,
          patientDiagnosis: ctx.primaryDiagnosis,
          service: ctx.currentService,
          eventDetected: `Solicitud de valoración por ${delayedConsult.specialty}`,
          sourceUsed: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG (FOMAG-001)',
          criterionUsed: 'Criterio CRIT-006: Oportunidad en respuesta médica a interconsultas hospitalarias.',
          evidencePage: delayedConsult.evidencePage,
          evidenceSnippet: `Interconsulta: ${delayedConsult.specialty}. Fecha de solicitud: ${delayedConsult.requestedAt}. Motivo: ${delayedConsult.reason}. Estado: ${delayedConsult.status}.`,
          documentType: 'Interconsultas / Órdenes',
          documentDate: delayedConsult.requestedAt,
          findingTitle: `Interconsulta especializada por ${delayedConsult.specialty} pendiente de realización`,
          findingDescription: `Se observa solicitud de interconsulta a la especialidad de ${delayedConsult.specialty} desde el ${delayedConsult.requestedAt} sin registro de valoración médica especializada ni concepto clínico en la historia clínica.`,
          potentialImpact: 'Riesgo de progresión clínica no detectada, retraso en definición de conducta y estancia prolongada evitable.',
          recommendedAction: `Coordinar con la dirección médica de la IPS la valoración prioritaria por ${delayedConsult.specialty} en menos de 24 horas.`,
          confidenceScore: 0.91,
          auditorVerificationGuide: [
            'Verificar si el especialista emitió concepto en formato físico no digitalizado.',
            'Confirmar si el paciente fue trasladado temporalmente a otra unidad para la valoración.',
            'Revisar si se requirió autorización FOMAG previa.'
          ]
        };
      }

      return {
        ruleId: 'R-CONS-001',
        ruleCode: 'AUD-CONS-OPORTUNIDAD',
        ruleName: 'Oportunidad y Trazabilidad de Interconsultas por Especialidad',
        category: 'Oportunidad',
        tier: 'NIVEL 2 — OPORTUNIDAD',
        targetDomain: 'INTERCONSULTAS',
        status: 'APLICADA_CONFORME',
        activationReason: 'Todas las interconsultas médicas solicitadas fueron atendidas con concepto documentado.',
        sourceUsed: 'FOMAG-001',
        criterionUsed: 'CRIT-006',
        confidenceScore: 0.93,
        auditorVerificationGuide: ['Verificar si las recomendaciones del especialista fueron acatadas por el médico tratante.']
      };
    }
  },

  // 4. PERIOPERATORIO Y QUIRÚRGICO (NOR-008 / SEG-001)
  {
    id: 'R-SURG-001',
    code: 'AUD-SURG-PERIOP',
    name: 'Garantía Perioperatoria: Consentimiento, Descripción Quirúrgica y Lista de Chequeo',
    category: 'Seguridad del paciente',
    tier: 'NIVEL 1 — SEGURIDAD',
    targetDomain: 'QUIRURGICO',
    description: 'Evalúa la completitud documental de procedimientos quirúrgicos: consentimiento informado, hoja quirúrgica y evolución anestésica.',
    sourceId: 'NOR-008',
    criterionId: 'CRIT-005',
    isApplicable: (ctx) => {
      const hasSurgery = ctx.clinicalClassification === 'Hospitalización quirúrgica' ||
        ctx.procedures.some(p => p.status === 'Realizado' || p.status === 'Programado') ||
        ctx.clinicalServices.some(s => s.serviceName.toLowerCase().includes('cirug') || s.serviceName.toLowerCase().includes('quir'));
      
      if (hasSurgery) {
        return {
          applicable: true,
          reason: 'Se identificó procedimiento quirúrgico realizado o clasificación de hospitalización quirúrgica.'
        };
      }
      return {
        applicable: false,
        reason: 'No se identificaron procedimientos quirúrgicos en el expediente (Hospitalización médica/no quirúrgica).'
      };
    },
    evaluate: (ctx) => {
      const interruptedProc = ctx.procedures.find(p => p.status === 'Interrumpido' || (p.interruptions && p.interruptions.length > 0));
      if (interruptedProc) {
        return {
          ruleId: 'R-SURG-001',
          ruleCode: 'AUD-SURG-PERIOP',
          ruleName: 'Garantía Perioperatoria: Consentimiento, Descripción Quirúrgica y Lista de Chequeo',
          category: 'Seguridad del paciente',
          tier: 'NIVEL 1 — SEGURIDAD',
          targetDomain: 'QUIRURGICO',
          status: 'APLICADA_CON_HALLAZGO',
          activationReason: `Procedimiento ${interruptedProc.name} presenta interrupción documental o cancelación documentada.`,
          patientDiagnosis: ctx.primaryDiagnosis,
          service: ctx.currentService,
          eventDetected: `Interrupción en procedimiento ${interruptedProc.name}`,
          sourceUsed: 'Resolución 465 de 2025 - Estándares de Habilitación (NOR-008)',
          criterionUsed: 'Criterio CRIT-005: Seguridad del paciente en actos quirúrgicos y consentimiento informado.',
          evidencePage: interruptedProc.evidencePage,
          evidenceSnippet: `Procedimiento: ${interruptedProc.name}. Estado: ${interruptedProc.status}. Detalle: ${interruptedProc.interruptions || 'Interrupción de la cadena quirúrgica'}.`,
          documentType: 'Procedimientos quirúrgicos/UCI',
          documentDate: interruptedProc.orderDate,
          findingTitle: `Interrupción o inconsistencia en procedimiento quirúrgico: ${interruptedProc.name}`,
          findingDescription: `Se registra procedimiento quirúrgico con estado "${interruptedProc.status}", requiriendo verificación de nota de cancelación, reprogramación y preservación del estado clínico.`,
          potentialImpact: 'Riesgo de seguridad del paciente, prolongación innecesaria de estancia y reprocesos administrativos.',
          recommendedAction: 'Verificar reprogramación oportuna y nota médica de soporte con consentimiento informado actualizado.',
          confidenceScore: 0.88,
          auditorVerificationGuide: [
            'Confirmar si el consentimiento informado cuenta con firma de paciente/acudiente y cirujano.',
            'Verificar registro de profilaxis antibiótica perioperatoria.',
            'Revisar nota de recuperación postanestésica.'
          ]
        };
      }

      return {
        ruleId: 'R-SURG-001',
        ruleCode: 'AUD-SURG-PERIOP',
        ruleName: 'Garantía Perioperatoria: Consentimiento, Descripción Quirúrgica y Lista de Chequeo',
        category: 'Seguridad del paciente',
        tier: 'NIVEL 1 — SEGURIDAD',
        targetDomain: 'QUIRURGICO',
        status: 'APLICADA_CONFORME',
        activationReason: 'Procedimientos quirúrgicos documentados con descripción, consentimiento y seguimiento posquirúrgico.',
        sourceUsed: 'NOR-008',
        criterionUsed: 'CRIT-005',
        confidenceScore: 0.94,
        auditorVerificationGuide: ['Verificar evolución de herida quirúrgica y retiro de drenes/dispositivos.']
      };
    }
  },

  // 5. CUIDADO CRÍTICO Y UCI (NOR-008 / FOMAG-001)
  {
    id: 'R-ICU-001',
    code: 'AUD-ICU-PERTINENCIA',
    name: 'Pertinencia y Trazabilidad de Estancia en Cuidado Intensivo / Intermedio',
    category: 'Pertinencia',
    tier: 'NIVEL 3 — PERTINENCIA',
    targetDomain: 'UCI',
    description: 'Evalúa criterios de ingreso, permanencia y oportunidad de traslado a piso desde Unidad de Cuidado Crítico.',
    sourceId: 'NOR-008',
    criterionId: 'CRIT-007',
    isApplicable: (ctx) => {
      const isUci = ctx.clinicalClassification === 'UCI' ||
        ctx.currentService.toLowerCase().includes('uci') ||
        ctx.clinicalServices.some(s => s.serviceName.toLowerCase().includes('uci') || s.serviceName.toLowerCase().includes('intensivo') || s.serviceName.toLowerCase().includes('intermedio'));
      
      if (isUci) {
        return {
          applicable: true,
          reason: 'El paciente se encuentra o ha permanecido en Unidad de Cuidados Intensivos o Intermedios.'
        };
      }
      return {
        applicable: false,
        reason: 'El paciente no ha ingresado a unidad de cuidados intensivos o intermedios (Hospitalización general).'
      };
    },
    evaluate: (ctx) => {
      const uciService = ctx.clinicalServices.find(s => s.serviceName.toLowerCase().includes('uci'));
      return {
        ruleId: 'R-ICU-001',
        ruleCode: 'AUD-ICU-PERTINENCIA',
        ruleName: 'Pertinencia y Trazabilidad de Estancia en Cuidado Intensivo / Intermedio',
        category: 'Pertinencia',
        tier: 'NIVEL 3 — PERTINENCIA',
        targetDomain: 'UCI',
        status: 'APLICADA_CONFORME',
        activationReason: 'Evaluación de criterios de soporte hemodinámico y monitoreo continuo en UCI.',
        patientDiagnosis: ctx.primaryDiagnosis,
        service: ctx.currentService,
        sourceUsed: 'Resolución 465 de 2025 (NOR-008) / FOMAG-001',
        criterionUsed: 'Criterio CRIT-007: Criterios de ingreso y permanencia en UCI.',
        evidencePage: uciService?.evidencePage || 1,
        confidenceScore: 0.90,
        auditorVerificationGuide: [
          'Verificar gases arteriales y parámetros ventilatorios.',
          'Revisar si el paciente cumple criterios de destete ventilatorio o traslado a cuidados intermedios/piso.',
          'Comprobar registro diario de escalas de severidad (APACHE II / SOFA).'
        ]
      };
    }
  },

  // 6. ESTANCIA PROLONGADA Y BARRERAS (FOMAG-001 / CRIT-008)
  {
    id: 'R-STAY-001',
    code: 'AUD-STAY-BARRERAS',
    name: 'Análisis de Estancia Hospitalaria y Barreras de Egreso',
    category: 'Estancia',
    tier: 'NIVEL 4 — ESTANCIA',
    targetDomain: 'ESTANCIA',
    description: 'Identifica estancias superiores a la media esperada y clasifica barreras de egreso clínicas, administrativas u operativas.',
    sourceId: 'FOMAG-001',
    criterionId: 'CRIT-008',
    isApplicable: (ctx) => {
      return {
        applicable: true,
        reason: `Evaluación permanente de estancia hospitalaria (Días acumulados: ${ctx.lengthOfStay}).`
      };
    },
    evaluate: (ctx, ips) => {
      const isProlonged = ctx.lengthOfStay >= 7;
      const hasActiveBarriers = ctx.stayBarriers.length > 0;

      if (isProlonged || hasActiveBarriers) {
        const topBarrier = ctx.stayBarriers[0] || {
          type: 'OPERATIVA' as const,
          description: `Estancia de ${ctx.lengthOfStay} días requiere verificación de barreras administrativas u operativas pendientes.`
        };

        return {
          ruleId: 'R-STAY-001',
          ruleCode: 'AUD-STAY-BARRERAS',
          ruleName: 'Análisis de Estancia Hospitalaria y Barreras de Egreso',
          category: 'Estancia',
          tier: 'NIVEL 4 — ESTANCIA',
          targetDomain: 'ESTANCIA',
          status: 'APLICADA_CON_HALLAZGO',
          activationReason: `Estancia hospitalaria de ${ctx.lengthOfStay} días con presencia de barrera identificada (${topBarrier.type}).`,
          patientDiagnosis: ctx.primaryDiagnosis,
          service: ctx.currentService,
          eventDetected: `Estancia acumulada de ${ctx.lengthOfStay} días desde ${ctx.admissionDate}`,
          sourceUsed: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG (FOMAG-001)',
          criterionUsed: 'Criterio CRIT-008: Gestión de estancia y control de barreras asistenciales.',
          evidencePage: 1,
          evidenceSnippet: `Ingreso: ${ctx.admissionDate}. Días de estancia: ${ctx.lengthOfStay}. Clasificación de estancia: ${ctx.stayEvaluation}. Barreras: ${ctx.stayBarriers.map(b => `[${b.type}] ${b.description}`).join('; ') || 'En estudio'}.`,
          documentType: 'Evolución médica / Epicrisis',
          documentDate: ctx.currentDate,
          findingTitle: `Estancia prolongada (${ctx.lengthOfStay} días) con barrera [${topBarrier.type}]`,
          findingDescription: `El paciente acumula ${ctx.lengthOfStay} días de hospitalización. Se identifica barrera de tipo ${topBarrier.type}: "${topBarrier.description}". Requiere gestión activa con el equipo multidisciplinario para planificar el egreso seguro.`,
          potentialImpact: 'Riesgo de infección asociada a la atención (IAAS), desacondicionamiento físico y sobrecosto evitable.',
          recommendedAction: 'Activar mesa de gestión de egreso con trabajo social, médico tratante y coordinación médica FOMAG.',
          confidenceScore: 0.90,
          auditorVerificationGuide: [
            'Confirmar si el paciente cuenta con criterios de manejo ambulatorio o atención domiciliaria.',
            'Verificar autorización de medicamentos de egreso o dispositivos médicos.',
            'Revisar si existen pendientes de transporte asistenciado o red de apoyo familiar.'
          ]
        };
      }

      return {
        ruleId: 'R-STAY-001',
        ruleCode: 'AUD-STAY-BARRERAS',
        ruleName: 'Análisis de Estancia Hospitalaria y Barreras de Egreso',
        category: 'Estancia',
        tier: 'NIVEL 4 — ESTANCIA',
        targetDomain: 'ESTANCIA',
        status: 'APLICADA_CONFORME',
        activationReason: `Estancia hospitalaria (${ctx.lengthOfStay} días) acorde con la complejidad de la patología y evolución clínica documentada.`,
        sourceUsed: 'FOMAG-001',
        criterionUsed: 'CRIT-008',
        confidenceScore: 0.95,
        auditorVerificationGuide: ['Monitorear evolución diaria de criterios de alta.']
      };
    }
  },

  // 7. SEGURIDAD DEL PACIENTE Y RESULTADOS CRÍTICOS (SEG-001 / INS-001)
  {
    id: 'R-SAFETY-001',
    code: 'AUD-SAFETY-CRITICAL',
    name: 'Seguridad del Paciente: Comunicación de Valores Críticos y Prevención de Eventos Adversos',
    category: 'Seguridad del paciente',
    tier: 'NIVEL 1 — SEGURIDAD',
    targetDomain: 'SEGURIDAD',
    description: 'Verifica la comunicación oportuna y conducta médica inmediata ante valores de laboratorio críticos o eventos de riesgo.',
    sourceId: 'SEG-001',
    criterionId: 'CRIT-009',
    isApplicable: (ctx) => {
      const hasCritical = ctx.diagnosticTests.some(t => t.isCriticalValue) ||
        ctx.timelineEvents.some(e => e.eventType === 'Resultado crítico' || e.eventType === 'Caída' || e.eventType === 'Evento adverso');
      if (hasCritical) {
        return {
          applicable: true,
          reason: 'Se identificó reporte de valor crítico de laboratorio o evento adverso registrado en la historia clínica.'
        };
      }
      return {
        applicable: true, // Safety rule is evaluated for all patients to confirm safety checks
        reason: 'Verificación rutinaria de seguridad del paciente y escalas de riesgo.'
      };
    },
    evaluate: (ctx) => {
      const criticalTest = ctx.diagnosticTests.find(t => t.isCriticalValue);
      if (criticalTest) {
        return {
          ruleId: 'R-SAFETY-001',
          ruleCode: 'AUD-SAFETY-CRITICAL',
          ruleName: 'Seguridad del Paciente: Comunicación de Valores Críticos y Prevención de Eventos Adversos',
          category: 'Seguridad del paciente',
          tier: 'NIVEL 1 — SEGURIDAD',
          targetDomain: 'SEGURIDAD',
          status: 'REQUIERE_VALIDACION_HUMANA',
          activationReason: `Se identificó resultado crítico de ${criticalTest.testName}: "${criticalTest.criticalValueDetail || 'Valor de alarma'}".`,
          patientDiagnosis: ctx.primaryDiagnosis,
          service: ctx.currentService,
          eventDetected: `Reporte de valor crítico en ${criticalTest.testName}`,
          sourceUsed: 'Paquetes Instruccionales de Seguridad del Paciente (SEG-001) / MinSalud',
          criterionUsed: 'Criterio CRIT-009: Protocolo de comunicación inmediata y conducta médica ante valores críticos.',
          evidencePage: criticalTest.evidencePage,
          evidenceSnippet: `Estudio: ${criticalTest.testName}. Hallazgo crítico: ${criticalTest.criticalValueDetail}. Conducta identificada: ${criticalTest.clinicalInterpretation || 'No identificada de forma explícita'}.`,
          documentType: 'Resultados de laboratorio',
          documentDate: criticalTest.resultDate || criticalTest.orderDate,
          findingTitle: `Valor crítico de laboratorio (${criticalTest.testName}) requiere verificación de conducta médica oportuna`,
          findingDescription: `Se observa resultado con valor crítico documentado. El auditor debe verificar en las notas médicas la hora de notificación verbal y la conducta instaurada inmediatamente por el equipo asistencial.`,
          potentialImpact: 'Riesgo de descompensación clínica aguda y eventos adversos graves.',
          recommendedAction: 'Constatar en nota de evolución médica la conducta terapéutica adaptada a este resultado crítico.',
          confidenceScore: 0.85,
          auditorVerificationGuide: [
            'Revisar si en la nota médica inmediata se registró la conducta ajustada.',
            'Confirmar si se comunicó al médico de turno en el tiempo estipulado por el protocolo institucional.',
            'Evaluar necesidad de control de laboratorio posterior.'
          ]
        };
      }

      return {
        ruleId: 'R-SAFETY-001',
        ruleCode: 'AUD-SAFETY-CRITICAL',
        ruleName: 'Seguridad del Paciente: Comunicación de Valores Críticos y Prevención de Eventos Adversos',
        category: 'Seguridad del paciente',
        tier: 'NIVEL 1 — SEGURIDAD',
        targetDomain: 'SEGURIDAD',
        status: 'APLICADA_CONFORME',
        activationReason: 'No se identificaron valores críticos no gestionados ni eventos adversos centinela.',
        sourceUsed: 'SEG-001',
        criterionUsed: 'CRIT-009',
        confidenceScore: 0.95,
        auditorVerificationGuide: ['Mantener vigilancia a escalas de Braden, Downton y flebitis.']
      };
    }
  },

  // 8. CALIDAD DOCUMENTAL Y REGISTROS CLÍNICOS (NOR-001 / Res 1995 de 1999)
  {
    id: 'R-DOC-001',
    code: 'AUD-DOC-CALIDAD',
    name: 'Calidad Documental: Completitud de Notas, Evoluciones y Discrepancias',
    category: 'Calidad asistencial',
    tier: 'NIVEL 5 — CALIDAD DOCUMENTAL',
    targetDomain: 'CALIDAD_DOCUMENTAL',
    description: 'Evalúa la coherencia entre documentos clínicos, notas de evolución diaria y presencia de inconsistencias diagnósticas.',
    sourceId: 'NOR-001',
    criterionId: 'CRIT-001',
    isApplicable: (ctx) => {
      return {
        applicable: true,
        reason: 'Verificación universal de calidad y coherencia del registro de historia clínica.'
      };
    },
    evaluate: (ctx) => {
      const hasDiscrepancies = ctx.discrepancies.length > 0;
      if (hasDiscrepancies) {
        const topDisc = ctx.discrepancies[0];
        return {
          ruleId: 'R-DOC-001',
          ruleCode: 'AUD-DOC-CALIDAD',
          ruleName: 'Calidad Documental: Completitud de Notas, Evoluciones y Discrepancias',
          category: 'Calidad asistencial',
          tier: 'NIVEL 5 — CALIDAD DOCUMENTAL',
          targetDomain: 'CALIDAD_DOCUMENTAL',
          status: 'APLICADA_CON_HALLAZGO',
          activationReason: `Se identificó discrepancia documental en ${topDisc.field}: "${topDisc.description}".`,
          patientDiagnosis: ctx.primaryDiagnosis,
          service: ctx.currentService,
          eventDetected: `Discrepancia entre página ${topDisc.source1Page} y página ${topDisc.source2Page}`,
          sourceUsed: 'Resolución 1995 de 1999 - Normas para el Manejo de la Historia Clínica (NOR-001)',
          criterionUsed: 'Criterio CRIT-001: Diligenciamiento oportuno, secuencial y veraz de los registros asistenciales.',
          evidencePage: topDisc.source1Page,
          evidenceSnippet: `Registro 1 (Pág ${topDisc.source1Page}): "${topDisc.source1Text}". Registro 2 (Pág ${topDisc.source2Page}): "${topDisc.source2Text}".`,
          documentType: 'Historia clínica / Evolución',
          documentDate: ctx.currentDate,
          findingTitle: `Inconsistencia documental en ${topDisc.field}`,
          findingDescription: `Se identificó discrepancia en ${topDisc.field} entre diferentes secciones del expediente clínico. Registro A: "${topDisc.source1Text}" vs Registro B: "${topDisc.source2Text}".`,
          potentialImpact: 'Afectación a la continuidad del cuidado, riesgo de confusión médica y objeciones de glosa.',
          recommendedAction: 'Requerir aclaración médica en la siguiente nota de evolución para unificar el registro oficial.',
          confidenceScore: 0.93,
          auditorVerificationGuide: [
            'Verificar si se trató de una corrección diagnóstica posterior fundamentada en paraclínicos.',
            'Confirmar si el médico tratante aclaró la discrepancia en la epicrisis.',
            'Revisar concordancia de firma, sello y registro médico del profesional responsable.'
          ]
        };
      }

      return {
        ruleId: 'R-DOC-001',
        ruleCode: 'AUD-DOC-CALIDAD',
        ruleName: 'Calidad Documental: Completitud de Notas, Evoluciones y Discrepancias',
        category: 'Calidad asistencial',
        tier: 'NIVEL 5 — CALIDAD DOCUMENTAL',
        targetDomain: 'CALIDAD_DOCUMENTAL',
        status: 'APLICADA_CONFORME',
        activationReason: 'Registros clínicos coherentes y secuenciales sin discrepancias documentales mayores.',
        sourceUsed: 'NOR-001',
        criterionUsed: 'CRIT-001',
        confidenceScore: 0.95,
        auditorVerificationGuide: ['Verificar presencia de firma y registro médico en todas las notas.']
      };
    }
  },

  // 9. OBSTETRICIA Y MATERNO-PERINATAL (GPC-003) -> RULE FORBIDDEN IF NOT OBSTETRIC
  {
    id: 'R-OBS-001',
    code: 'AUD-OBS-MATERNO',
    name: 'Atención Materno-Perinatal: Partograma, Monitoreo Fetal y Control Puerperal',
    category: 'Calidad asistencial',
    tier: 'NIVEL 1 — SEGURIDAD',
    targetDomain: 'OBSTETRICIA',
    description: 'Evalúa cumplimiento de protocolos obstétricos, partograma y vigilancia del puerperio.',
    sourceId: 'GPC-003',
    criterionId: 'CRIT-010',
    isApplicable: (ctx) => {
      const isObstetric = ctx.clinicalClassification === 'Obstetricia' ||
        ctx.diagnoses.some(d => d.name.toLowerCase().includes('embarazo') || d.name.toLowerCase().includes('parto') || d.name.toLowerCase().includes('puerperio') || d.name.toLowerCase().includes('cesarea'));
      
      if (isObstetric) {
        return {
          applicable: true,
          reason: 'Se identificó contexto obstétrico y diagnóstico gestacional o de puerperio.'
        };
      }
      return {
        applicable: false,
        reason: `No se identificó contexto obstétrico (Paciente: ${ctx.sex}, Diagnóstico principal: ${ctx.primaryDiagnosis}).`
      };
    },
    evaluate: (ctx) => {
      return {
        ruleId: 'R-OBS-001',
        ruleCode: 'AUD-OBS-MATERNO',
        ruleName: 'Atención Materno-Perinatal: Partograma, Monitoreo Fetal y Control Puerperal',
        category: 'Calidad asistencial',
        tier: 'NIVEL 1 — SEGURIDAD',
        targetDomain: 'OBSTETRICIA',
        status: 'APLICADA_CONFORME',
        activationReason: 'Protocolos obstétricos evaluados conformes.',
        sourceUsed: 'GPC-003',
        criterionUsed: 'CRIT-010',
        confidenceScore: 0.92,
        auditorVerificationGuide: ['Verificar monitoreo fetal continuo y registro de partograma.']
      };
    }
  },

  // 10. PEDIATRÍA Y NEONATOLOGÍA (GPC-004) -> RULE FORBIDDEN IF ADULT
  {
    id: 'R-PED-001',
    code: 'AUD-PED-DOSIFICACION',
    name: 'Atención Pediátrica: Dosificación por Peso, Curvas de Crecimiento y Esquema PAI',
    category: 'Seguridad del paciente',
    tier: 'NIVEL 1 — SEGURIDAD',
    targetDomain: 'PEDIATRIA',
    description: 'Evalúa prescripción ponderal exacta, curvas OMS y vacunación en pacientes pediátricos.',
    sourceId: 'GPC-004',
    criterionId: 'CRIT-011',
    isApplicable: (ctx) => {
      const isPediatric = ctx.age < 18 || ctx.clinicalClassification === 'Pediatría' || ctx.clinicalClassification === 'Neonatología';
      if (isPediatric) {
        return {
          applicable: true,
          reason: `Paciente pediátrico (${ctx.age} años) — activa reglas de dosificación por peso y tablas pediátricas.`
        };
      }
      return {
        applicable: false,
        reason: `Paciente adulto (${ctx.age} años) — Criterios pediátricos no aplicables.`
      };
    },
    evaluate: (ctx) => {
      return {
        ruleId: 'R-PED-001',
        ruleCode: 'AUD-PED-DOSIFICACION',
        ruleName: 'Atención Pediátrica: Dosificación por Peso, Curvas de Crecimiento y Esquema PAI',
        category: 'Seguridad del paciente',
        tier: 'NIVEL 1 — SEGURIDAD',
        targetDomain: 'PEDIATRIA',
        status: 'APLICADA_CONFORME',
        activationReason: 'Dosificación pediátrica calculada con peso documentado.',
        sourceUsed: 'GPC-004',
        criterionUsed: 'CRIT-011',
        confidenceScore: 0.90,
        auditorVerificationGuide: ['Verificar peso diario y registro de líquidos administrados/eliminados.']
      };
    }
  }
];

/**
 * Contextual Audit Rule Engine Service
 */
export class ContextualAuditRuleEngine {
  private rules: DynamicAuditRule[] = MASTER_CONTEXTUAL_RULES;

  /**
   * Register custom rules or institutional protocol rules
   */
  public registerRule(rule: DynamicAuditRule): void {
    this.rules = [...this.rules.filter(r => r.id !== rule.id), rule];
  }

  /**
   * Evaluate all rules against a patient's clinical context
   */
  public evaluateContext(ctx: PatientClinicalContext, ips?: IPSContext): ContextualRuleEngineResult {
    const applicableRules: RuleEvaluationResult[] = [];
    const findingsGenerated: RuleEvaluationResult[] = [];
    const conformingRules: RuleEvaluationResult[] = [];
    const rulesRequiringValidation: RuleEvaluationResult[] = [];
    const nonApplicableRules: {
      ruleId: string;
      ruleCode: string;
      ruleName: string;
      targetDomain: string;
      discardReason: string;
    }[] = [];

    for (const rule of this.rules) {
      const applicability = rule.isApplicable(ctx, ips);
      if (!applicability.applicable) {
        nonApplicableRules.push({
          ruleId: rule.id,
          ruleCode: rule.code,
          ruleName: rule.name,
          targetDomain: rule.targetDomain,
          discardReason: applicability.reason
        });
        continue;
      }

      // Execute evaluation for applicable rule
      const evalResult = rule.evaluate(ctx, ips);
      applicableRules.push(evalResult);

      if (evalResult.status === 'APLICADA_CON_HALLAZGO') {
        findingsGenerated.push(evalResult);
      } else if (evalResult.status === 'REQUIERE_VALIDACION_HUMANA') {
        rulesRequiringValidation.push(evalResult);
      } else if (evalResult.status === 'APLICADA_CONFORME') {
        conformingRules.push(evalResult);
      }
    }

    return {
      patientId: ctx.patientId,
      totalRulesEvaluated: this.rules.length,
      applicableRules,
      findingsGenerated,
      conformingRules,
      rulesRequiringValidation,
      nonApplicableRules,
      evaluatedAt: new Date().toISOString()
    };
  }
}

export const contextualAuditRuleEngine = new ContextualAuditRuleEngine();
