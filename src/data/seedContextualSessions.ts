/**
 * SEED DATA: Contextual Audit Sessions (FASE 5)
 * Realistic, fully structured contextual audit encounters for Bonadona, Misericordia, and Clínica Costa.
 */

import { AuditSession } from '../domain/models/AuditSession';
import { PatientClinicalContext } from '../domain/models/PatientClinicalContext';
import { ClinicalProblemMap } from '../domain/models/ClinicalProblemMap';
import { ClinicalAuditRiskMap } from '../domain/models/ClinicalAuditRiskMap';
import { ContextualFinding, ActionPlan24Hour, ConflictReview } from '../domain/models/ContextualFinding';

export const SEED_PATIENT_1_CONTEXT: PatientClinicalContext = {
  patientId: 'pat-001',
  patientName: 'María Elena Torres',
  docNumber: 'CC 32.845.912',
  age: 58,
  sex: 'F',
  regime: 'FOMAG Magisterio',
  ipsId: 'ips-001',
  ipsName: 'Clínica Bonadona',
  admissionDate: '2025-05-10',
  currentDate: '2025-05-18',
  lengthOfStay: 8,
  admissionReason: 'Fiebre cuantificada de 38.8°C, disnea progresiva mMRC 3/4 y tos con expectoración mucopurulenta.',
  admissionService: 'Urgencias Adultos',
  currentService: 'Hospitalización Medicina Interna Piso 4',
  clinicalStatus: 'Estable',
  dischargeStatus: 'Hospitalizado',
  clinicalClassification: 'Respiratorio',
  stayEvaluation: '🟠 Potencial oportunidad de gestión',
  stayBarriers: [
    {
      id: 'barr-001',
      type: 'OPERATIVA',
      description: 'Pendiente entrega de reporte oficial de hemocultivos y valoración presencial por Neumología para autorizar egreso.',
      identifiedDate: '2025-05-16',
      evidencePage: 14,
      impactDays: 3,
      responsibleArea: 'Laboratorio y Especialidades',
      status: 'Activa'
    }
  ],
  diagnoses: [
    {
      id: 'diag-001',
      code: 'J18.9',
      name: 'Neumonía adquirida en la comunidad (NAC) con índice CURB-65 = 2',
      type: 'Principal',
      status: 'Activo',
      identifiedDate: '2025-05-10',
      evidencePage: 2,
      notes: 'Confirmada por consolidación basal derecha en Rx de tórax.'
    },
    {
      id: 'diag-002',
      code: 'E11.9',
      name: 'Diabetes Mellitus tipo 2 no insulinodependiente',
      type: 'Secundario',
      status: 'Activo',
      identifiedDate: '2025-05-10',
      evidencePage: 2
    },
    {
      id: 'diag-003',
      code: 'I10',
      name: 'Hipertensión arterial esencial',
      type: 'Secundario',
      status: 'Activo',
      identifiedDate: '2025-05-10',
      evidencePage: 2
    }
  ],
  primaryDiagnosis: 'Neumonía adquirida en la comunidad (NAC) con índice CURB-65 = 2',
  secondaryDiagnoses: [
    'Diabetes Mellitus tipo 2 no insulinodependiente',
    'Hipertensión arterial esencial'
  ],
  clinicalServices: [
    {
      id: 'srv-001',
      serviceName: 'Urgencias Adultos',
      startDate: '2025-05-10',
      endDate: '2025-05-11',
      status: 'Finalizado',
      evidencePage: 1
    },
    {
      id: 'srv-002',
      serviceName: 'Hospitalización Medicina Interna Piso 4',
      startDate: '2025-05-11',
      status: 'Activo',
      evidencePage: 8
    }
  ],
  procedures: [],
  diagnosticTests: [
    {
      id: 'test-001',
      testName: 'Radiografía de Tórax AP y Lateral',
      category: 'Imágenes',
      indication: 'Sospecha de foco neumónico',
      orderDate: '2025-05-10',
      performedDate: '2025-05-10',
      resultDate: '2025-05-10',
      interpretationDate: '2025-05-10',
      clinicalInterpretation: 'Opacidad alveolar basal derecha compatible con foco de consolidación neumónica.',
      associatedDiagnosis: 'Neumonía adquirida en la comunidad',
      isCriticalValue: false,
      status: 'Completado',
      evidencePage: 4
    },
    {
      id: 'test-002',
      testName: 'Hemocultivos Pareados Automatizados (2 botellas)',
      category: 'Laboratorio',
      indication: 'Aislamiento microbiológico en neumonía moderada-severa',
      orderDate: '2025-05-10',
      performedDate: '2025-05-10',
      status: 'Realización sin resultado identificado',
      isCriticalValue: false,
      evidencePage: 6
    },
    {
      id: 'test-003',
      testName: 'Gases Arteriales en Aire Ambiente',
      category: 'Laboratorio',
      indication: 'Evaluación de oxigenación y ventilación',
      orderDate: '2025-05-10',
      performedDate: '2025-05-10',
      resultDate: '2025-05-10',
      interpretationDate: '2025-05-10',
      clinicalInterpretation: 'PaO2 62 mmHg, PaCO2 34 mmHg, pH 7.42, PaFi 295 (Hipoxemia leve)',
      associatedDiagnosis: 'Neumonía adquirida en la comunidad',
      isCriticalValue: true,
      criticalValueDetail: 'Hipoxemia moderada inicial PaO2 62 mmHg',
      status: 'Completado',
      evidencePage: 5
    }
  ],
  medications: [
    {
      id: 'med-001',
      name: 'Ceftriaxona Solución Inyectable',
      dose: '2 g',
      route: 'Intravenosa',
      frequency: 'Cada 24 horas',
      startDate: '2025-05-10',
      indication: 'Neumonía adquirida en la comunidad',
      isAntibiotic: true,
      antibioticDetail: {
        indication: 'NAC moderada CURB-65 = 2',
        relatedDiagnosis: 'Neumonía adquirida en la comunidad',
        startDate: '2025-05-10',
        cultureOrdered: true,
        cultureDate: '2025-05-10',
        antibiogramReported: false,
        durationDays: 8,
        status: 'Empírico',
        evidencePage: 9
      },
      changes: ['Ajuste de 1g a 2g IV día al ingreso'],
      administrationDocumented: true,
      evidencePage: 9
    },
    {
      id: 'med-002',
      name: 'Claritromicina',
      dose: '500 mg',
      route: 'Oral',
      frequency: 'Cada 12 horas',
      startDate: '2025-05-10',
      stopDate: '2025-05-15',
      indication: 'Cobertura de atípicos en NAC',
      isAntibiotic: true,
      changes: ['Suspendido al completar 5 días de esquema oral'],
      administrationDocumented: true,
      evidencePage: 12
    }
  ],
  consultations: [
    {
      id: 'cons-001',
      specialty: 'Neumología',
      requestedAt: '2025-05-15',
      reason: 'Evaluación de persistencia de estertores basales y criterio de desescalamiento antibiótico a vía oral para alta.',
      status: 'Demorada',
      daysPending: 3,
      evidencePage: 15
    }
  ],
  timelineEvents: [
    {
      id: 'time-001',
      date: '2025-05-10',
      time: '14:30',
      eventType: 'Ingreso',
      description: 'Ingreso por Urgencias con dificultad respiratoria y fiebre. Se inicia Ceftriaxona + Claritromicina.',
      documentType: 'Historia clínica de ingreso',
      evidencePage: 1
    },
    {
      id: 'time-002',
      date: '2025-05-11',
      time: '09:15',
      eventType: 'Traslado',
      description: 'Traslado a Hospitalización Piso 4 con oxígeno por cánula nasal a 2 L/min.',
      documentType: 'Evolución médica',
      evidencePage: 8
    },
    {
      id: 'time-003',
      date: '2025-05-15',
      time: '11:00',
      eventType: 'Interconsulta',
      description: 'Orden de interconsulta prioritaria a Neumología para definición de alta.',
      documentType: 'Órdenes médicas',
      evidencePage: 15
    }
  ],
  clinicalChanges: [
    {
      id: 'chg-001',
      date: '2025-05-13',
      changeType: 'Mejoría',
      description: 'Afebril por 48 horas continuas, saturación 95% al aire ambiente, se retira soporte de oxígeno.',
      evidencePage: 11
    }
  ],
  discrepancies: [
    {
      id: 'disc-001',
      field: 'Motivo de ingreso',
      source1Text: 'Ingreso por crisis asmática severa (Nota de enfermería pág. 3)',
      source1Page: 3,
      source2Text: 'Neumonía adquirida en la comunidad CURB-65 = 2 sin antecedente de asma (Historia de ingreso médico pág. 1)',
      source2Page: 1,
      description: 'Nota de enfermería registra crisis asmática mientras la nota médica descarta asma y enfoca como NAC infecciosa.',
      severity: 'Baja'
    }
  ],
  pendingItems: [
    {
      id: 'pend-001',
      title: 'Valoración presencial por Neumología',
      category: 'Interconsulta',
      orderDate: '2025-05-15',
      daysPending: 3,
      evidencePage: 15,
      suggestedAction: 'Gestionar con coordinación médica la valoración el día de hoy para definir egreso.',
      priority: '🔴 Crítico'
    },
    {
      id: 'pend-002',
      title: 'Reporte definitivo de hemocultivos pareados',
      category: 'Ayuda diagnóstica',
      orderDate: '2025-05-10',
      daysPending: 8,
      evidencePage: 6,
      suggestedAction: 'Solicitar reporte preliminar o negativo al 5to día a bacteriología.',
      priority: '🟠 Alto'
    }
  ],
  globalTrafficLight: '🟠 Presenta oportunidades relevantes',
  confidenceScore: 0.94,
  createdAt: '2025-05-18T10:00:00Z',
  updatedAt: '2025-05-18T10:00:00Z'
};

export const SEED_FINDINGS_PATIENT_1: ContextualFinding[] = [
  {
    id: 'fnd-bon-001',
    auditId: 'aud-ctx-bon-001',
    patientId: 'pat-001',
    code: 'AUD-CONS-OPORTUNIDAD',
    category: 'Oportunidad',
    tier: 'NIVEL 2 — OPORTUNIDAD',
    title: 'Interconsulta especializada por Neumología pendiente de valoración (3 días)',
    description: 'Se observa orden de valoración por Neumología emitida el 15/05/2025 para definir alta médica, acumulando 3 días sin nota de valoración en la historia clínica.',
    factEvidence: 'Página 15: "15/05/2025 11:00 - Se solicita interconsulta a Neumología para concepto de egreso y cambio a terapia oral". No se evidencia nota de respuesta posterior.',
    evidencePage: 15,
    documentType: 'Órdenes médicas / Interconsultas',
    documentDate: '2025-05-15',
    criterionEvidence: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG (FOMAG-001) — Criterio CRIT-006: Oportunidad en respuesta médica a interconsultas hospitalarias.',
    sourceReferences: [
      {
        sourceId: 'FOMAG-001',
        sourceName: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG',
        entity: 'FOMAG',
        validityStatus: 'VIGENTE',
        priority: 'MÁXIMA',
        officialUrl: 'https://www.fomag.gov.co'
      }
    ],
    criterionReferences: [
      {
        criterionId: 'CRIT-006',
        sourceId: 'FOMAG-001',
        title: 'Oportunidad y trazabilidad de interconsultas hospitalarias',
        requirement: 'Toda interconsulta debe responderse en menos de 24 horas y generar conducta médica documentada.',
        articleOrSection: 'Numeral 4.6',
        evidenceRequired: 'Nota de valoración médica por especialista y evolución de ajuste terapéutico.'
      }
    ],
    multiSourceBreakdown: {
      medicalRecordSnippet: 'Página 15: "Se solicita interconsulta a Neumología". Sin nota de respuesta.',
      fomagGuideline: 'Guía FOMAG 2025 - Criterio CRIT-006'
    },
    confidenceScore: 0.95,
    confidenceLevel: 'ALTA CONFIANZA DOCUMENTAL',
    explainability: {
      ruleId: 'R-CONS-001',
      ruleName: 'Oportunidad y Trazabilidad de Interconsultas por Especialidad',
      activatedReason: 'Interconsulta a Neumología acumula 3 días calendario sin registro de atención en HC.',
      patientDiagnosis: 'Neumonía adquirida en la comunidad (NAC)',
      service: 'Hospitalización Medicina Interna Piso 4',
      eventDetected: 'Solicitud de interconsulta el 15/05/2025',
      sourceUsed: 'FOMAG-001',
      criterionUsed: 'CRIT-006',
      analysisPerformed: 'Confrontación entre fecha de orden médica (15/05/2025) y ausencia de nota asistencial de Neumología al 18/05/2025.',
      confidenceScore: 0.95,
      confidenceJustification: 'Evidencia documental directa con fecha, hora y folio de órdenes médicas.',
      auditorVerificationGuide: [
        'Comprobar si el especialista realizó la visita y está pendiente el cargue del concepto digital.',
        'Revisar si el médico internista tratante puede asumir el criterio de alta con la mejoría clínica documentada.'
      ]
    },
    auditorValidation: {
      status: 'CONFIRMADO',
      validatedBy: 'Dr. Alejandro Morales (Auditor Concurrente)',
      validatedAt: '2025-05-18T11:30:00Z',
      auditorNotes: 'Se confirma hallazgo. Se contacta a coordinación médica de Clínica Bonadona para exigir valoración hoy.'
    },
    temporalStatus: 'NUEVO',
    isCriticalOrHighPriority: true,
    createdAt: '2025-05-18T10:00:00Z',
    updatedAt: '2025-05-18T11:30:00Z'
  },
  {
    id: 'fnd-bon-002',
    auditId: 'aud-ctx-bon-001',
    patientId: 'pat-001',
    code: 'AUD-ABX-CULTIVO',
    category: 'Pertinencia',
    tier: 'NIVEL 3 — PERTINENCIA',
    title: 'Terapia con Ceftriaxona por 8 días sin reporte de cultivo ni desescalamiento documentado',
    description: 'El paciente completa 8 días continuos de Ceftriaxona parenteral manteniendo esquema empírico sin reporte de hemocultivos en la historia clínica ni justificación de no cambio a vía oral.',
    factEvidence: 'Página 9 y 13: "Kárdex Ceftriaxona 2g IV día desde 10/05/2025". Pág 11: "Paciente afebril y estable". No consta reporte de cultivo ni nota de desescalamiento.',
    evidencePage: 9,
    documentType: 'Kárdex / Evolución Médica',
    documentDate: '2025-05-18',
    criterionEvidence: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG (FOMAG-001) — Criterio CRIT-004: Pertinencia en prescripción antimicrobiana.',
    sourceReferences: [
      {
        sourceId: 'FOMAG-001',
        sourceName: 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG',
        entity: 'FOMAG',
        validityStatus: 'VIGENTE',
        priority: 'MÁXIMA',
        officialUrl: 'https://www.fomag.gov.co'
      },
      {
        sourceId: 'GPC-001',
        sourceName: 'Guía de Práctica Clínica para Infección Respiratoria Aguda y Neumonía en Adultos',
        entity: 'IETS / MinSalud',
        validityStatus: 'VIGENTE',
        priority: 'ALTA',
        officialUrl: 'https://www.iets.org.co'
      }
    ],
    criterionReferences: [
      {
        criterionId: 'CRIT-004',
        sourceId: 'FOMAG-001',
        title: 'Evaluación y pertinencia del uso de antibióticos',
        requirement: 'Reevaluación a las 48-72h para desescalamiento temprano o cambio a vía oral una vez exista estabilidad clínica.',
        articleOrSection: 'Numeral 4.4',
        evidenceRequired: 'Reporte microbiológico o nota médica que justifique continuar terapia IV empírica.'
      }
    ],
    confidenceScore: 0.92,
    confidenceLevel: 'ALTA CONFIANZA DOCUMENTAL',
    explainability: {
      ruleId: 'R-ABX-001',
      ruleName: 'Terapia Antimicrobiana: Indicación, Cultivo y Desescalamiento',
      activatedReason: 'Paciente cumple 8 días de antibiótico IV con 5 días afebril sin desescalamiento a vía oral.',
      patientDiagnosis: 'Neumonía adquirida en la comunidad',
      service: 'Hospitalización Medicina Interna Piso 4',
      eventDetected: 'Prescripción continua de Ceftriaxona desde 10/05/2025',
      sourceUsed: 'FOMAG-001 y GPC-001',
      criterionUsed: 'CRIT-004',
      analysisPerformed: 'Análisis de estabilidad clínica documentada vs prolongación de antibiótico intravenoso.',
      confidenceScore: 0.92,
      confidenceJustification: 'Evidencia documental en Kárdex de enfermería y evolución médica.',
      auditorVerificationGuide: [
        'Comprobar si existe reporte verbal del laboratorio de microbiología.',
        'Verificar si el paciente tolera la vía oral adecuadamente para cambio a amoxicilina/clavulanato o similar.'
      ]
    },
    auditorValidation: {
      status: 'CONFIRMADO',
      validatedBy: 'Dr. Alejandro Morales',
      validatedAt: '2025-05-18T11:30:00Z',
      auditorNotes: 'Pertinencia de cambio a oral para alta hospitalaria.'
    },
    temporalStatus: 'NUEVO',
    isCriticalOrHighPriority: true,
    createdAt: '2025-05-18T10:00:00Z',
    updatedAt: '2025-05-18T11:30:00Z'
  }
];

export const SEED_ACTIONS_PATIENT_1: ActionPlan24Hour[] = [
  {
    id: 'act-24h-bon-001',
    findingId: 'fnd-bon-001',
    actionTitle: 'Gestión prioritaria: Valoración presencial por Neumología',
    actionDescription: 'Requerir atención presencial inmediata por especialista de Neumología en Clínica Bonadona para expedir concepto de alta médica en menos de 24 horas.',
    suggestedResponsible: 'Coordinación Médica IPS',
    createdAt: '2025-05-18T10:00:00Z',
    deadlineDate: '2025-05-19T10:00:00Z',
    status: 'En gestión',
    notes: 'Notificado al Dr. Rafael Gómez (Coordinador Hospitalario Bonadona).'
  },
  {
    id: 'act-24h-bon-002',
    findingId: 'fnd-bon-002',
    actionTitle: 'Oportunidad Asistencial: Desescalamiento y Entrega de Cultivo',
    actionDescription: 'Solicitar al laboratorio de bacteriología reporte oficial de hemocultivos y evaluar por médico tratante pase a vía oral.',
    suggestedResponsible: 'Servicio Farmacéutico',
    createdAt: '2025-05-18T10:00:00Z',
    deadlineDate: '2025-05-19T10:00:00Z',
    status: 'Pendiente',
    notes: 'Prioridad alta para habilitar egreso hospitalario.'
  }
];

export const SEED_AUDIT_SESSION_1: AuditSession = {
  id: 'aud-ctx-bon-001',
  auditType: 'AUDITORÍA INICIAL',
  patientId: 'pat-001',
  patientName: 'María Elena Torres',
  docNumber: 'CC 32.845.912',
  ipsId: 'ips-001',
  ipsName: 'Clínica Bonadona',
  auditDate: '2025-05-18',
  auditorId: 'usr-aud-001',
  auditorName: 'Dr. Alejandro Morales',
  auditorRole: 'Médico Auditor Concurrente FOMAG',
  clinicalContext: SEED_PATIENT_1_CONTEXT,
  problemMap: {
    patientId: 'pat-001',
    auditId: 'aud-ctx-bon-001',
    totalProblems: 3,
    activeProblemsCount: 3,
    problems: [
      {
        id: 'prob-001',
        diagnosis: 'Neumonía adquirida en la comunidad (NAC)',
        code: 'J18.9',
        status: 'Activo',
        identifiedDate: '2025-05-10',
        evidencePage: 2,
        evidenceSnippet: 'Diagnóstico principal de ingreso con CURB-65 = 2 y consolidación basal derecha.',
        relatedDiagnosticTests: [
          { testId: 'test-001', testName: 'Radiografía de Tórax', status: 'Completado', result: 'Opacidad basal derecha', page: 4 },
          { testId: 'test-002', testName: 'Hemocultivos Pareados', status: 'Realización sin resultado identificado', page: 6 }
        ],
        relatedTreatments: [
          { treatmentName: 'Ceftriaxona 2g IV día', status: 'Activo', page: 9 },
          { treatmentName: 'Claritromicina 500mg VO', status: 'Suspendido (completado)', page: 12 }
        ],
        pendingItems: [
          { itemId: 'pend-001', description: 'Interconsulta a Neumología', category: 'Interconsulta', daysPending: 3, page: 15 },
          { itemId: 'pend-002', description: 'Resultado de hemocultivos', category: 'Ayuda diagnóstica', daysPending: 8, page: 6 }
        ],
        risks: [
          { riskType: 'Estancia prolongada evitable', level: 'Alto', justification: 'Paciente estable clínicamente demorado por interconsulta.' },
          { riskType: 'Resistencia bacteriana', level: 'Medio', justification: '8 días de ceftriaxona sin desescalamiento.' }
        ],
        applicableCriteriaIds: ['CRIT-004', 'CRIT-006', 'CRIT-008']
      }
    ],
    generatedAt: '2025-05-18T10:00:00Z'
  },
  riskMap: {
    patientId: 'pat-001',
    auditId: 'aud-ctx-bon-001',
    overallRiskLevel: 'MEDIO',
    criticalRisksCount: 0,
    highRisksCount: 2,
    risksByDimension: {
      'Riesgo de seguridad': [],
      'Riesgo de demora': [
        {
          id: 'r-dem-001',
          dimension: 'Riesgo de demora',
          tier: 'NIVEL 2 — OPORTUNIDAD',
          severity: 'ALTO',
          title: 'Demora en Interconsulta de Neumología (3 días)',
          description: 'Retrasa la decisión de egreso hospitalario en paciente clínicamente estabilizado.',
          evidencePage: 15,
          evidenceSnippet: 'Solicitada el 15/05/2025 sin nota médica registrada.',
          potentialImpact: 'Estancia evitable de 3 días adicionales en la institución.',
          recommendedMitigation: 'Atención presencial prioritaria en menos de 24h.',
          isAddressedInActionPlan: true
        }
      ],
      'Riesgo de estancia prolongada': [
        {
          id: 'r-stay-001',
          dimension: 'Riesgo de estancia prolongada',
          tier: 'NIVEL 4 — ESTANCIA',
          severity: 'ALTO',
          title: 'Estancia acumulada de 8 días para NAC moderada',
          description: 'Supera el promedio esperado institucional (5 días) debido a barreras operativas de laboratorio y respuesta de especialista.',
          evidencePage: 1,
          evidenceSnippet: 'Ingreso 10/05/2025 a 18/05/2025 (8 días).',
          potentialImpact: 'Riesgo de sobrecostos no pertinentes e IAAS.',
          recommendedMitigation: 'Mesa de gestión de alta el 18/05/2025.',
          isAddressedInActionPlan: true
        }
      ],
      'Riesgo documental': [],
      'Riesgo de continuidad': [],
      'Riesgo administrativo': [],
      'Riesgo de pertinencia': [],
      'Riesgo de evento adverso': [],
      'Riesgo de costo evitable': []
    },
    allRisks: [],
    topPriorityRisks: [],
    generatedAt: '2025-05-18T10:00:00Z'
  },
  findings: SEED_FINDINGS_PATIENT_1,
  actions24h: SEED_ACTIONS_PATIENT_1,
  conflicts: [
    {
      id: 'conf-001',
      conflictType: 'HC_CONTRADICTION',
      title: 'Discrepancia en antecedente de asma vs neumonía',
      source1: 'Nota de enfermería Pág 3: "Crisis asmática"',
      source2: 'Historia clínica médica Pág 1: "Neumonía NAC, niega asma"',
      detectedConflict: 'Enfermería rotula ingreso por asma en contradicción con el diagnóstico médico documentado.',
      evidencePage1: 3,
      evidencePage2: 1,
      date: '2025-05-10',
      context: 'Admisión a Urgencias Clínica Bonadona',
      humanReviewRecommendation: 'El auditor verificó que prevalece el diagnóstico médico con soporte radiológico.'
    }
  ],
  globalTrafficLight: '🟠 Presenta oportunidades relevantes',
  confidenceScore: 0.94,
  totalFindingsCount: 2,
  criticalFindingsCount: 1,
  validatedFindingsCount: 2,
  clinicalDocumentarySummary: 'Paciente de 58 años, femenina, docente afiliada a FOMAG, hospitalizada en Clínica Bonadona desde el 10/05/2025 (8 días de estancia) por Neumonía Adquirida en la Comunidad. Se encuentra afebril y clínicamente estable desde hace 5 días. Presenta interrupción en oportunidad de interconsulta por Neumología (3 días de retraso) y prolongación de Ceftriaxona IV sin desescalamiento.',
  auditorExecutiveConclusion: 'Auditoría Inicial Concurrente completada. Paciente con oportunidad de alta médica expedita supeditada a valoración prioritaria por Neumología y desescalamiento a vía oral. Se activó Plan de Acción a 24 horas con Coordinación Médica de Clínica Bonadona.',
  recommendations: [
    'Gestionar valoración presencial inmediata por Neumología hoy 18/05/2025.',
    'Requerir entrega inmediata del reporte de hemocultivos pareados a bacteriología.',
    'Evaluar por médico internista egreso con esquema oral de amoxicilina/clavulanato.',
    'Garantizar formulación ambulatoria y cita de control poshospitalaria FOMAG.'
  ],
  dataOrigin: 'DEMO',
  status: 'Validada y Firmada',
  createdAt: '2025-05-18T10:00:00Z',
  updatedAt: '2025-05-18T11:30:00Z'
};

export const INITIAL_AUDIT_SESSIONS: AuditSession[] = [
  SEED_AUDIT_SESSION_1
];
