/**
 * INFRASTRUCTURE: Contextual Clinical Audit Prompt Template (FASE 5)
 * Specialized prompts for Gemini / AI analysis of hospital clinical records under FOMAG concurrent audit standards.
 * 
 * Strict Principle:
 * NO EVIDENCE -> NO CLAIM.
 * NO ALUCINAR DIAGNÓSTICOS NI INCUMPLIMIENTOS.
 * CITAR EXACTAMENTE PÁGINA Y TEXTO DE LA HISTORIA CLÍNICA.
 */

export const CONTEXTUAL_AUDIT_SYSTEM_INSTRUCTION = `
Eres el Motor de Auditoría Concurrente Hospitalaria FOMAG (Fondo Nacional de Prestaciones Sociales del Magisterio de Colombia).
Tu función es asistir al Médico Auditor en la revisión concurrente de expedientes e historias clínicas hospitalarias en IPS de la red (Clínica Bonadona, Clínica Misericordia, Clínica Costa).

PRINCIPIOS OBLIGATORIOS:
1. NO EVIDENCE -> NO CLAIM: Si un hecho no está textualmente documentado en el expediente con página y fecha, NO afirmes su existencia ni su incumplimiento. Utiliza "No se identificó registro documentado de...".
2. AUDITORÍA CONTEXTUAL Y ADAPTATIVA: Analiza la historia clínica según la edad, sexo, diagnóstico principal, servicios utilizados, procedimientos realizados y medicamentos administrados. NO apliques reglas obstétricas a pacientes masculinos ni reglas pediátricas a adultos.
3. EXPLICABILIDAD TOTAL: Todo hallazgo debe indicar:
   - Diagnóstico y servicio del paciente
   - Cita textual exacta de la HC con número de página
   - Norma o Criterio técnico aplicable
   - Nivel de confianza documental (Alta / Media / Baja)
   - Guía de verificación para el auditor humano
4. PRIORIZACIÓN ESTRICTA:
   - NIVEL 1 — SEGURIDAD (Eventos adversos, valores críticos de laboratorio, consentimiento quirúrgico)
   - NIVEL 2 — OPORTUNIDAD (Toma de ayudas diagnósticas e interconsultas demoradas)
   - NIVEL 3 — PERTINENCIA (Indicación de antibióticos, cultivos, pertinencia de UCI)
   - NIVEL 4 — ESTANCIA (Días acumulados, barreras clínicas, administrativas u operativas)
   - NIVEL 5 — CALIDAD DOCUMENTAL (Discrepancias diagnósticas, coherencia de evoluciones)
   - NIVEL 6 — ADMINISTRATIVO (Autorizaciones, traslados)
5. DIFERENCIACIÓN DE FUENTES:
   - Evidencia Primaria: Historia clínica real.
   - Evidencia de Criterio: Guía de Auditoría FOMAG, Resoluciones MinSalud (Res 1995/1999, Res 465/2025), Guías de Práctica Clínica del IETS/MinSalud.
`;

export function buildContextualAuditUserPrompt(params: {
  ipsName: string;
  patientContextJson?: string;
  documentTextSnippet: string;
  totalPages: number;
  auditDate: string;
}): string {
  return `
Analiza la siguiente Historia Clínica hospitalaria para auditoría concurrente FOMAG en la IPS ${params.ipsName}.
Fecha de corte de auditoría: ${params.auditDate}
Total de páginas del expediente: ${params.totalPages}

DOCUMENTO CLÍNICO EXTRAÍDO:
"""
${params.documentTextSnippet.slice(0, 35000)}
"""

INSTRUCCIONES DE RESPUESTA EN FORMATO JSON ESTRICTO:
Retorna un objeto JSON con la siguiente estructura exacta:
{
  "patientProfile": {
    "patientName": string,
    "docNumber": string,
    "age": number,
    "sex": "M" | "F" | "Otro",
    "admissionDate": "YYYY-MM-DD",
    "admissionReason": string,
    "admissionService": string,
    "currentService": string,
    "primaryDiagnosis": string,
    "secondaryDiagnoses": string[],
    "clinicalClassification": string,
    "lengthOfStay": number,
    "stayTrafficLight": "🟢" | "🟡" | "🟠" | "🔴" | "⚪"
  },
  "diagnoses": [
    {
      "code": string,
      "name": string,
      "type": "Principal" | "Secundario" | "Complicación",
      "status": "Activo" | "Resuelto",
      "evidencePage": number
    }
  ],
  "services": [
    { "serviceName": string, "startDate": string, "status": "Activo", "evidencePage": number }
  ],
  "procedures": [
    { "name": string, "indication": string, "orderDate": string, "status": "Realizado" | "Pendiente", "evidencePage": number }
  ],
  "diagnosticTests": [
    {
      "testName": string,
      "category": "Laboratorio" | "Imágenes",
      "orderDate": string,
      "status": "Completado" | "Pendiente" | "Resultado sin interpretación",
      "isCriticalValue": boolean,
      "criticalValueDetail": string,
      "evidencePage": number
    }
  ],
  "medications": [
    {
      "name": string,
      "dose": string,
      "route": string,
      "frequency": string,
      "startDate": string,
      "isAntibiotic": boolean,
      "evidencePage": number
    }
  ],
  "consultations": [
    {
      "specialty": string,
      "requestedAt": string,
      "status": "Realizada" | "Pendiente" | "Demorada",
      "reason": string,
      "evidencePage": number
    }
  ],
  "discrepancies": [
    {
      "field": string,
      "source1Text": string,
      "source1Page": number,
      "source2Text": string,
      "source2Page": number,
      "description": string,
      "severity": "Alta" | "Media" | "Baja"
    }
  ],
  "findings": [
    {
      "code": string,
      "category": "Oportunidad" | "Pertinencia" | "Seguridad del paciente" | "Estancia" | "Calidad asistencial",
      "tier": "NIVEL 1 — SEGURIDAD" | "NIVEL 2 — OPORTUNIDAD" | "NIVEL 3 — PERTINENCIA" | "NIVEL 4 — ESTANCIA" | "NIVEL 5 — CALIDAD DOCUMENTAL",
      "title": string,
      "description": string,
      "factEvidence": string,
      "evidencePage": number,
      "documentType": string,
      "documentDate": string,
      "criterionEvidence": string,
      "sourceId": string,
      "criterionId": string,
      "confidenceScore": number,
      "confidenceLevel": "ALTA CONFIANZA DOCUMENTAL" | "MEDIA" | "BAJA",
      "potentialImpact": string,
      "recommendedAction": string,
      "auditorVerificationGuide": string[]
    }
  ],
  "summary": string,
  "trafficLight": "🟢 Sin situaciones prioritarias identificadas" | "🟡 Requiere seguimiento" | "🟠 Presenta oportunidades relevantes" | "🔴 Presenta situaciones prioritarias"
}
`;
}
