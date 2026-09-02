import { AuditRule } from '../models';

/**
 * FOMAG / Colombian Concurrent Hospital Audit Rules Catalogue
 * Encapsulates standards for pertinence, opportunity, clinical quality, safety, and stay.
 */
export const DEFAULT_AUDIT_RULES: AuditRule[] = [
  {
    id: 'RULE_PERT_01',
    code: 'PERT-01',
    name: 'Pertinencia de Estancia Hospitalaria',
    description: 'Verificación de que el paciente requiere nivel de complejidad y cuidados intrahospitalarios activos vs manejo ambulatorio o PAD.',
    category: 'Pertinencia',
    severity: 'Alto',
    enabled: true,
    evaluationCriteria: 'Presencia de signos de alarma, requerimiento de medicamentos parenterales, monitoreo continuo o estudios de urgencia.',
    legalNormative: 'Resolución 3100 de 2019 / Guía de Auditoría Concurrente'
  },
  {
    id: 'RULE_OPOR_01',
    code: 'OPOR-01',
    name: 'Oportunidad en Interconsultas Médicas Especializadas',
    description: 'Respuesta de valoración por especialista dentro de las 24 horas siguientes a la solicitud médica.',
    category: 'Oportunidad',
    severity: 'Crítico',
    enabled: true,
    evaluationCriteria: 'Tiempo transcurrido entre orden médica de interconsulta y nota de valoración por especialista.',
    legalNormative: 'Decreto 780 de 2016'
  },
  {
    id: 'RULE_OPOR_02',
    code: 'OPOR-02',
    name: 'Oportunidad en Reporte y Ejecución de Ayudas Diagnósticas',
    description: 'Toma e informe de imágenes diagnósticas o paraclínicos especializados en tiempos clínicos pertinentes.',
    category: 'Oportunidad',
    severity: 'Alto',
    enabled: true,
    evaluationCriteria: 'Demoras no justificadas >24h en ecografías, TAC, RMN, biopsias o cultivos microbiológicos.',
    legalNormative: 'Resolución 256 de 2016'
  },
  {
    id: 'RULE_SEG_01',
    code: 'SEG-01',
    name: 'Seguridad del Paciente y Vigilancia de IAAS',
    description: 'Monitoreo de eventos adversos, infecciones asociadas al cuidado de la salud, caídas y bacteriemias.',
    category: 'Seguridad del paciente',
    severity: 'Crítico',
    enabled: true,
    evaluationCriteria: 'Uso prolongado de catéter venoso central sin retiro oportuno, flebitis, UPP o caídas.',
    legalNormative: 'Política Nacional de Seguridad del Paciente'
  },
  {
    id: 'RULE_CAL_01',
    code: 'CAL-01',
    name: 'Calidad y Completitud del Registro Clínico',
    description: 'Diligenciamiento de notas de evolución diaria, curvas de signos vitales, consentimientos y reconciliación.',
    category: 'Calidad asistencial',
    severity: 'Moderado',
    enabled: true,
    evaluationCriteria: 'Existencia de notas de evolución médica cada 24h, registro legible de dosis y firmas institucionales.',
    legalNormative: 'Resolución 1995 de 1999'
  },
  {
    id: 'RULE_FARM_01',
    code: 'FARM-01',
    name: 'Uso Racional de Antibióticos (PROA)',
    description: 'Desescalamiento antibiótico oportuno con base en resultados de cultivo y antibiograma.',
    category: 'Pertinencia',
    severity: 'Alto',
    enabled: true,
    evaluationCriteria: 'Mantenimiento de antibioterapia de amplio espectro tras reporte de sensibilidad o >7 días sin ajuste.',
    legalNormative: 'Lineamientos PROA MinSalud'
  },
  {
    id: 'RULE_ADM_01',
    code: 'ADM-01',
    name: 'Trámites Administrativos y Autorizaciones',
    description: 'Ausencia de barreras administrativas en trámites de referencia, insumos o medicamentos de alto costo.',
    category: 'Administrativo',
    severity: 'Moderado',
    enabled: true,
    evaluationCriteria: 'Retraso de egreso o procedimiento atribuible a demoras en autorizaciones o MIPRES.',
    legalNormative: 'Ley Estatutaria 1751 de 2015'
  }
];
