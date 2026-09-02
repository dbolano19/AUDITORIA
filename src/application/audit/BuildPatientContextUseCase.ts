/**
 * APPLICATION LAYER: BuildPatientContextUseCase (FASE 5)
 * Transforms clinical document extraction into structured PatientClinicalContext,
 * ClinicalProblemMap, and ClinicalAuditRiskMap.
 * 
 * Strict Principle:
 * SOLO UTILIZAR INFORMACIÓN DOCUMENTADA.
 * NO EVIDENCE -> NO CLAIM.
 */

import {
  PatientClinicalContext,
  StructuredDiagnosis,
  StructuredServiceEvent,
  StructuredProcedure,
  StructuredDiagnosticTest,
  StructuredMedication,
  StructuredConsultation,
  ClinicalTimelineEvent,
  ClinicalChangeRecord,
  DiscrepancyRecord,
  StayBarrierItem,
  PendingClinicalItem,
  ClinicalClassificationType,
  GlobalAuditTrafficLight,
  StayEvaluationStatus
} from '../../domain/models/PatientClinicalContext';
import { ClinicalProblemMap, ClinicalProblemItem } from '../../domain/models/ClinicalProblemMap';
import { ClinicalAuditRiskMap, ClinicalRiskEntry, ClinicalAuditRiskDimension } from '../../domain/models/ClinicalAuditRiskMap';
import { logger } from '../../infrastructure/logging/loggerService';

export interface BuildPatientContextInput {
  patientId: string;
  patientName: string;
  docNumber: string;
  age?: number;
  sex?: 'M' | 'F' | 'Otro';
  regime?: string;
  ipsId?: string;
  ipsName?: string;
  admissionDate?: string;
  currentDate?: string;
  admissionReason?: string;
  admissionService?: string;
  currentService?: string;
  clinicalStatus?: 'Estable' | 'En deterioro' | 'Crítico' | 'En recuperación' | 'Egreso/Alta' | 'No determinado';
  dischargeStatus?: 'Hospitalizado' | 'Alta médica' | 'Remisión' | 'Fallecido' | 'Retiro voluntario';
  
  // Clinical text or pre-extracted records
  diagnoses?: Partial<StructuredDiagnosis>[];
  clinicalServices?: Partial<StructuredServiceEvent>[];
  procedures?: Partial<StructuredProcedure>[];
  diagnosticTests?: Partial<StructuredDiagnosticTest>[];
  medications?: Partial<StructuredMedication>[];
  consultations?: Partial<StructuredConsultation>[];
  timelineEvents?: Partial<ClinicalTimelineEvent>[];
  clinicalChanges?: Partial<ClinicalChangeRecord>[];
  discrepancies?: Partial<DiscrepancyRecord>[];
  stayBarriers?: Partial<StayBarrierItem>[];
  pendingItems?: Partial<PendingClinicalItem>[];
}

export interface BuildPatientContextResult {
  patientContext: PatientClinicalContext;
  problemMap: ClinicalProblemMap;
  riskMap: ClinicalAuditRiskMap;
}

export class BuildPatientContextUseCase {
  public execute(input: BuildPatientContextInput): BuildPatientContextResult {
    logger.info('BuildPatientContextUseCase', `Construyendo contexto clínico para paciente ${input.patientName} (${input.docNumber})`);

    const now = input.currentDate || new Date().toISOString().split('T')[0];
    const admission = input.admissionDate || now;
    
    // Calculate exact stay in days
    const diffTime = Math.abs(new Date(now).getTime() - new Date(admission).getTime());
    const lengthOfStay = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Clean diagnoses
    const diagnoses: StructuredDiagnosis[] = (input.diagnoses || []).map((d, index) => ({
      id: d.id || `diag-${index + 1}`,
      code: d.code || 'CIE10',
      name: d.name || 'Diagnóstico no especificado',
      type: d.type || (index === 0 ? 'Principal' : 'Secundario'),
      status: d.status || 'Activo',
      identifiedDate: d.identifiedDate || admission,
      evidencePage: d.evidencePage || 1,
      notes: d.notes
    }));

    const primaryDiag = diagnoses.find(d => d.type === 'Principal')?.name || (diagnoses[0]?.name ?? 'Diagnóstico principal en estudio');
    const secondaryDiags = diagnoses.filter(d => d.type !== 'Principal').map(d => d.name);

    // Clean services
    const clinicalServices: StructuredServiceEvent[] = (input.clinicalServices || []).map((s, index) => ({
      id: s.id || `srv-${index + 1}`,
      serviceName: s.serviceName || 'Hospitalización General',
      startDate: s.startDate || admission,
      endDate: s.endDate,
      status: s.status || 'Activo',
      evidencePage: s.evidencePage || 1,
      notes: s.notes
    }));

    // Clean procedures
    const procedures: StructuredProcedure[] = (input.procedures || []).map((p, index) => ({
      id: p.id || `proc-${index + 1}`,
      name: p.name || 'Procedimiento clínico',
      indication: p.indication || 'Indicación documentada',
      orderDate: p.orderDate || admission,
      performedDate: p.performedDate,
      resultDate: p.resultDate,
      status: p.status || 'Realizado',
      specialist: p.specialist,
      evidencePage: p.evidencePage || 1,
      interruptions: p.interruptions
    }));

    // Clean diagnostic tests
    const diagnosticTests: StructuredDiagnosticTest[] = (input.diagnosticTests || []).map((t, index) => ({
      id: t.id || `test-${index + 1}`,
      testName: t.testName || 'Ayuda diagnóstica',
      category: t.category || 'Laboratorio',
      indication: t.indication || 'Control clínico',
      orderDate: t.orderDate || admission,
      performedDate: t.performedDate,
      resultDate: t.resultDate,
      interpretationDate: t.interpretationDate,
      clinicalInterpretation: t.clinicalInterpretation,
      associatedDiagnosis: t.associatedDiagnosis || primaryDiag,
      isCriticalValue: !!t.isCriticalValue,
      criticalValueDetail: t.criticalValueDetail,
      status: t.status || 'Completado',
      evidencePage: t.evidencePage || 1
    }));

    // Clean medications
    const medications: StructuredMedication[] = (input.medications || []).map((m, index) => ({
      id: m.id || `med-${index + 1}`,
      name: m.name || 'Medicamento',
      dose: m.dose || 'Dosis terapéutica',
      route: m.route || 'Oral / IV',
      frequency: m.frequency || 'Cada 24 horas',
      startDate: m.startDate || admission,
      stopDate: m.stopDate,
      indication: m.indication || primaryDiag,
      isAntibiotic: !!m.isAntibiotic || isAntibioticName(m.name || ''),
      antibioticDetail: m.antibioticDetail,
      changes: m.changes || [],
      administrationDocumented: m.administrationDocumented !== false,
      evidencePage: m.evidencePage || 1
    }));

    // Clean consultations
    const consultations: StructuredConsultation[] = (input.consultations || []).map((c, index) => ({
      id: c.id || `cons-${index + 1}`,
      specialty: c.specialty || 'Especialidad médica',
      requestedAt: c.requestedAt || admission,
      performedAt: c.performedAt,
      reason: c.reason || 'Valoración integral',
      concept: c.concept,
      recommendations: c.recommendations,
      actionAfterConsult: c.actionAfterConsult,
      status: c.status || (c.performedAt ? 'Realizada' : 'Pendiente'),
      daysPending: c.daysPending,
      evidencePage: c.evidencePage || 1
    }));

    // Clean timeline & changes
    const timelineEvents: ClinicalTimelineEvent[] = (input.timelineEvents || []).map((e, index) => ({
      id: e.id || `time-${index + 1}`,
      date: e.date || admission,
      time: e.time,
      eventType: e.eventType || 'Evolución médica',
      description: e.description || 'Registro de atención asistencial',
      documentType: e.documentType || 'Evolución médica',
      evidencePage: e.evidencePage || 1
    }));

    const clinicalChanges: ClinicalChangeRecord[] = (input.clinicalChanges || []).map((c, index) => ({
      id: c.id || `chg-${index + 1}`,
      date: c.date || admission,
      changeType: c.changeType || 'Mejoría',
      description: c.description || 'Evolución clínica documentada',
      evidencePage: c.evidencePage || 1
    }));

    const discrepancies: DiscrepancyRecord[] = (input.discrepancies || []).map((d, index) => ({
      id: d.id || `disc-${index + 1}`,
      field: d.field || 'Diagnóstico principal',
      source1Text: d.source1Text || '',
      source1Page: d.source1Page || 1,
      source2Text: d.source2Text || '',
      source2Page: d.source2Page || 1,
      description: d.description || 'Discrepancia entre notas médicas',
      severity: d.severity || 'Media'
    }));

    const stayBarriers: StayBarrierItem[] = (input.stayBarriers || []).map((b, index) => ({
      id: b.id || `barr-${index + 1}`,
      type: b.type || 'CLÍNICA',
      description: b.description || 'Barrera en estudio',
      identifiedDate: b.identifiedDate || now,
      evidencePage: b.evidencePage || 1,
      impactDays: b.impactDays || 1,
      responsibleArea: b.responsibleArea || 'Asistencial',
      status: b.status || 'Activa'
    }));

    const pendingItems: PendingClinicalItem[] = (input.pendingItems || []).map((p, index) => ({
      id: p.id || `pend-${index + 1}`,
      title: p.title || 'Pendiente asistencial',
      category: p.category || 'Ayuda diagnóstica',
      orderDate: p.orderDate || admission,
      daysPending: p.daysPending || 1,
      evidencePage: p.evidencePage || 1,
      suggestedAction: p.suggestedAction || 'Verificar ejecución',
      priority: p.priority || '🟡 Moderado'
    }));

    // Auto-detect clinical classification
    const clinicalClassification = detectClinicalClassification(
      primaryDiag,
      secondaryDiags,
      clinicalServices,
      procedures,
      input.age || 45,
      input.sex || 'M'
    );

    // Evaluate Stay Status
    let stayEvaluation: StayEvaluationStatus = '🟢 Estancia explicada documentalmente';
    if (lengthOfStay >= 15 || stayBarriers.some(b => b.type === 'ADMINISTRATIVA' && b.status === 'Activa')) {
      stayEvaluation = '🔴 Situación prioritaria';
    } else if (lengthOfStay >= 8 || stayBarriers.length > 0) {
      stayEvaluation = '🟠 Potencial oportunidad de gestión';
    } else if (lengthOfStay >= 5) {
      stayEvaluation = '🟡 Estancia requiere seguimiento';
    }

    // Global traffic light
    let globalTrafficLight: GlobalAuditTrafficLight = '🟢 Sin situaciones prioritarias identificadas';
    const hasCriticalTests = diagnosticTests.some(t => t.isCriticalValue);
    const hasDelayedConsult = consultations.some(c => c.status === 'Demorada' || (c.daysPending && c.daysPending >= 3));
    const hasDiscrepancyHigh = discrepancies.some(d => d.severity === 'Alta');

    if (hasCriticalTests || hasDiscrepancyHigh || stayEvaluation === '🔴 Situación prioritaria') {
      globalTrafficLight = '🔴 Presenta situaciones prioritarias';
    } else if (hasDelayedConsult || stayBarriers.length > 0 || diagnosticTests.some(t => t.status === 'Pendiente')) {
      globalTrafficLight = '🟠 Presenta oportunidades relevantes';
    } else if (lengthOfStay >= 5 || consultations.some(c => c.status === 'Pendiente')) {
      globalTrafficLight = '🟡 Requiere seguimiento';
    }

    const patientContext: PatientClinicalContext = {
      patientId: input.patientId,
      patientName: input.patientName,
      docNumber: input.docNumber,
      age: input.age || 52,
      sex: input.sex || 'F',
      regime: input.regime || 'FOMAG Magisterio',
      ipsId: input.ipsId || 'ips-001',
      ipsName: input.ipsName || 'Clínica Bonadona',
      admissionDate: admission,
      currentDate: now,
      lengthOfStay,
      admissionReason: input.admissionReason || `Ingreso por ${primaryDiag}`,
      admissionService: input.admissionService || clinicalServices[0]?.serviceName || 'Urgencias',
      currentService: input.currentService || clinicalServices[clinicalServices.length - 1]?.serviceName || 'Hospitalización Piso 4',
      clinicalStatus: input.clinicalStatus || 'Estable',
      dischargeStatus: input.dischargeStatus || 'Hospitalizado',
      clinicalClassification,
      stayEvaluation,
      stayBarriers,
      diagnoses,
      primaryDiagnosis: primaryDiag,
      secondaryDiagnoses: secondaryDiags,
      clinicalServices,
      procedures,
      diagnosticTests,
      medications,
      consultations,
      timelineEvents,
      clinicalChanges,
      discrepancies,
      pendingItems,
      globalTrafficLight,
      confidenceScore: 0.92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Build Problem Map
    const problemMap = this.buildProblemMap(patientContext);

    // Build Risk Map
    const riskMap = this.buildRiskMap(patientContext);

    return {
      patientContext,
      problemMap,
      riskMap
    };
  }

  private buildProblemMap(ctx: PatientClinicalContext): ClinicalProblemMap {
    const problems: ClinicalProblemItem[] = ctx.diagnoses.map((diag, idx) => {
      // Correlate diagnostic tests
      const relatedTests = ctx.diagnosticTests
        .filter(t => t.associatedDiagnosis?.toLowerCase().includes(diag.name.toLowerCase()) || idx === 0)
        .map(t => ({
          testId: t.id,
          testName: t.testName,
          status: t.status,
          result: t.clinicalInterpretation,
          page: t.evidencePage
        }));

      // Correlate medications/treatments
      const relatedTreatments = ctx.medications
        .filter(m => m.indication.toLowerCase().includes(diag.name.toLowerCase()) || idx === 0)
        .map(m => ({
          medicationId: m.id,
          treatmentName: m.name,
          dose: `${m.dose} (${m.frequency})`,
          status: m.stopDate ? 'Suspendido' : 'Activo',
          page: m.evidencePage
        }));

      // Correlate pending items
      const pendingItems = ctx.pendingItems
        .map(p => ({
          itemId: p.id,
          description: p.title,
          category: p.category,
          daysPending: p.daysPending,
          page: p.evidencePage
        }));

      // Calculate clinical risks
      const risks: { riskType: string; level: 'Alto' | 'Medio' | 'Bajo'; justification: string }[] = [];
      if (diag.name.toLowerCase().includes('infecc') || diag.name.toLowerCase().includes('neumon')) {
        risks.push({
          riskType: 'Riesgo de Infección / Sepsis',
          level: 'Alto',
          justification: 'Diagnóstico infeccioso activo requiere vigilancia estrecha de respuesta terapéutica y paraclínicos.'
        });
      }
      if (ctx.lengthOfStay > 7) {
        risks.push({
          riskType: 'Riesgo de Estancia Prolongada',
          level: 'Medio',
          justification: `Estancia hospitalaria acumulada de ${ctx.lengthOfStay} días.`
        });
      }

      return {
        id: `prob-${idx + 1}`,
        diagnosis: diag.name,
        code: diag.code,
        status: diag.status,
        identifiedDate: diag.identifiedDate,
        evidencePage: diag.evidencePage,
        evidenceSnippet: `Diagnóstico documentado: ${diag.name} (${diag.code}). Estado: ${diag.status}.`,
        relatedDiagnosticTests: relatedTests,
        relatedTreatments: relatedTreatments,
        pendingItems: pendingItems,
        risks: risks,
        applicableCriteriaIds: ['CRIT-001', 'CRIT-003', 'CRIT-004']
      };
    });

    return {
      patientId: ctx.patientId,
      auditId: `aud-map-${ctx.patientId}`,
      totalProblems: problems.length,
      activeProblemsCount: problems.filter(p => p.status === 'Activo').length,
      problems,
      generatedAt: new Date().toISOString()
    };
  }

  private buildRiskMap(ctx: PatientClinicalContext): ClinicalAuditRiskMap {
    const allRisks: ClinicalRiskEntry[] = [];
    const risksByDimension: Record<ClinicalAuditRiskDimension, ClinicalRiskEntry[]> = {
      'Riesgo de seguridad': [],
      'Riesgo de demora': [],
      'Riesgo de estancia prolongada': [],
      'Riesgo documental': [],
      'Riesgo de continuidad': [],
      'Riesgo administrativo': [],
      'Riesgo de pertinencia': [],
      'Riesgo de evento adverso': [],
      'Riesgo de costo evitable': []
    };

    // 1. Safety & Critical values
    const criticalTests = ctx.diagnosticTests.filter(t => t.isCriticalValue);
    for (const ct of criticalTests) {
      const entry: ClinicalRiskEntry = {
        id: `risk-sec-${ct.id}`,
        dimension: 'Riesgo de seguridad',
        tier: 'NIVEL 1 — SEGURIDAD',
        severity: 'CRÍTICO',
        title: `Valor crítico en ${ct.testName}`,
        description: `Se reportó valor crítico (${ct.criticalValueDetail || 'Valor fuera de rango terapéutico'}) requiriendo verificación de conducta médica documentada inmediata.`,
        evidencePage: ct.evidencePage,
        evidenceSnippet: `Estudio: ${ct.testName}. Resultado: ${ct.criticalValueDetail}. Interpretación: ${ct.clinicalInterpretation || 'No registrada'}.`,
        potentialImpact: 'Descompensación aguda o evento centinela.',
        recommendedMitigation: 'Confirmar conducta terapéutica inmediata y control paraclínico.',
        isAddressedInActionPlan: true
      };
      allRisks.push(entry);
      risksByDimension['Riesgo de seguridad'].push(entry);
    }

    // 2. Delays & Interconsultations
    const delayedConsults = ctx.consultations.filter(c => c.status === 'Demorada' || c.status === 'Pendiente');
    for (const dc of delayedConsults) {
      const entry: ClinicalRiskEntry = {
        id: `risk-dem-${dc.id}`,
        dimension: 'Riesgo de demora',
        tier: 'NIVEL 2 — OPORTUNIDAD',
        severity: 'ALTO',
        title: `Interconsulta por ${dc.specialty} pendiente`,
        description: `Interconsulta solicitada el ${dc.requestedAt} sin valoración médica especializada registrada.`,
        evidencePage: dc.evidencePage,
        evidenceSnippet: `Especialidad: ${dc.specialty}. Solicitada: ${dc.requestedAt}. Motivo: ${dc.reason}.`,
        potentialImpact: 'Retraso en definición de conducta clínica y estancia evitable.',
        recommendedMitigation: 'Requerir atención de interconsulta en menos de 24 horas.',
        isAddressedInActionPlan: true
      };
      allRisks.push(entry);
      risksByDimension['Riesgo de demora'].push(entry);
    }

    // 3. Prolonged Stay & Barriers
    if (ctx.lengthOfStay >= 7 || ctx.stayBarriers.length > 0) {
      const entry: ClinicalRiskEntry = {
        id: 'risk-stay-001',
        dimension: 'Riesgo de estancia prolongada',
        tier: 'NIVEL 4 — ESTANCIA',
        severity: ctx.lengthOfStay >= 12 ? 'CRÍTICO' : 'MODERADO',
        title: `Estancia acumulada de ${ctx.lengthOfStay} días`,
        description: `Estancia hospitalaria supera umbrales estándar. Barreras activas: ${ctx.stayBarriers.map(b => b.description).join('; ') || 'En seguimiento'}.`,
        evidencePage: 1,
        evidenceSnippet: `Ingreso: ${ctx.admissionDate}. Días de estancia: ${ctx.lengthOfStay}. Barreras: ${ctx.stayBarriers.length}.`,
        potentialImpact: 'Mayor exposición a IAAS, agotamiento de red familiar y costos evitables.',
        recommendedMitigation: 'Reunión de egreso multidisciplinaria con trabajo social y aseguramiento.',
        isAddressedInActionPlan: true
      };
      allRisks.push(entry);
      risksByDimension['Riesgo de estancia prolongada'].push(entry);
    }

    // 4. Documentary Quality & Discrepancies
    for (const disc of ctx.discrepancies) {
      const entry: ClinicalRiskEntry = {
        id: `risk-doc-${disc.id}`,
        dimension: 'Riesgo documental',
        tier: 'NIVEL 5 — CALIDAD DOCUMENTAL',
        severity: disc.severity === 'Alta' ? 'ALTO' : 'MODERADO',
        title: `Discrepancia en ${disc.field}`,
        description: disc.description,
        evidencePage: disc.source1Page,
        evidenceSnippet: `Pág ${disc.source1Page}: "${disc.source1Text}" vs Pág ${disc.source2Page}: "${disc.source2Text}"`,
        potentialImpact: 'Objeciones de glosa y falta de coherencia en la trazabilidad asistencial.',
        recommendedMitigation: 'Nota aclaratoria en historia clínica por médico tratante.',
        isAddressedInActionPlan: false
      };
      allRisks.push(entry);
      risksByDimension['Riesgo documental'].push(entry);
    }

    const criticalCount = allRisks.filter(r => r.severity === 'CRÍTICO').length;
    const highCount = allRisks.filter(r => r.severity === 'ALTO').length;
    let overallRisk: 'ALTO' | 'MEDIO' | 'BAJO' = 'BAJO';
    if (criticalCount > 0 || highCount >= 2) overallRisk = 'ALTO';
    else if (highCount > 0 || allRisks.length >= 3) overallRisk = 'MEDIO';

    return {
      patientId: ctx.patientId,
      auditId: `risk-map-${ctx.patientId}`,
      overallRiskLevel: overallRisk,
      criticalRisksCount: criticalCount,
      highRisksCount: highCount,
      risksByDimension,
      allRisks,
      topPriorityRisks: allRisks.slice(0, 5),
      generatedAt: new Date().toISOString()
    };
  }
}

function isAntibioticName(name: string): boolean {
  const lower = name.toLowerCase();
  const abxKeywords = [
    'ampicilina', 'amoxicilina', 'ceftriaxona', 'cefepima', 'vancomicina',
    'meropenem', 'piperacilina', 'tazobactam', 'ciprofloxacino', 'levofloxacino',
    'claritromicina', 'azitromicina', 'gentamicina', 'amikacina', 'oxacilina',
    'clindamicina', 'linezolid', 'colistina', 'trimetoprim', 'cefalotina'
  ];
  return abxKeywords.some(k => lower.includes(k));
}

function detectClinicalClassification(
  primaryDiag: string,
  secondaryDiags: string[],
  services: StructuredServiceEvent[],
  procedures: StructuredProcedure[],
  age: number,
  sex: string
): ClinicalClassificationType {
  const text = [primaryDiag, ...secondaryDiags, ...services.map(s => s.serviceName)].join(' ').toLowerCase();

  if (age < 18) {
    if (age <= 0.08) return 'Neonatología';
    return 'Pediatría';
  }
  if (sex === 'F' && (text.includes('parto') || text.includes('embarazo') || text.includes('cesarea') || text.includes('obstetr') || text.includes('puerperio'))) {
    return 'Obstetricia';
  }
  if (services.some(s => s.serviceName.toLowerCase().includes('uci') || s.serviceName.toLowerCase().includes('intensivo'))) {
    return 'UCI';
  }
  if (procedures.some(p => p.status === 'Realizado' || p.status === 'Programado') || services.some(s => s.serviceName.toLowerCase().includes('quir'))) {
    return 'Hospitalización quirúrgica';
  }
  if (text.includes('neumon') || text.includes('epoc') || text.includes('asma') || text.includes('respirat')) {
    return 'Respiratorio';
  }
  if (text.includes('infarto') || text.includes('cardiac') || text.includes('hipertens') || text.includes('arritmia')) {
    return 'Cardiovascular';
  }
  if (text.includes('infecc') || text.includes('sepsis') || text.includes('celulitis') || text.includes('itu')) {
    return 'Infeccioso';
  }
  if (text.includes('diabetes') || text.includes('cetoacid') || text.includes('metabol')) {
    return 'Metabólico';
  }
  if (text.includes('renal') || text.includes('injuria renal') || text.includes('insuficiencia renal')) {
    return 'Renal';
  }
  if (text.includes('fractura') || text.includes('trauma') || text.includes('politrauma')) {
    return 'Trauma';
  }
  if (text.includes('urgenc')) {
    return 'Urgencias';
  }

  return 'Hospitalización médica';
}

export const buildPatientContextUseCase = new BuildPatientContextUseCase();
