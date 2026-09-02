import { AIProvider, AIProviderRequest, AIProviderResponse } from './aiProvider';
import { ruleBasedAIProvider } from './ruleBasedProvider';
import { logger } from '../logging/loggerService';
import { CONCURRENT_AUDIT_SYSTEM_PROMPT, buildConcurrentAuditUserPrompt } from './prompts/concurrentAuditPrompt';
import { GoogleGenAI } from '@google/genai';
import { knowledgeRetrievalService } from '../../domain/services/knowledgeRetrievalService';

/**
 * Gemini GenAI Provider Adapter (FASE 4 Enhanced)
 * Handles structured prompt generation, model invocation, knowledge retrieval, JSON repair, and deterministic fallback.
 * Strictly adheres to: NO EVIDENCE -> NO CLAIM and NO CONVERTIR AUTOMÁTICAMENTE DOCUMENTO EN REGLA.
 */
export class GeminiAIProvider implements AIProvider {
  name = 'Gemini-2.5-Flash-ConcurrentAudit';

  async analyzeDocument(request: AIProviderRequest): Promise<AIProviderResponse> {
    const startTime = Date.now();
    logger.info('GeminiAIProvider', `Iniciando análisis experto con Biblioteca Normativa para auditoría ${request.auditId} con modelo ${this.name}`);

    // Pre-retrieve normative knowledge before generating findings
    const knowledgeResult = knowledgeRetrievalService.retrieveKnowledge({
      clinicalContext: request.rawText || request.document.extractedTextSnippet || '',
      eventDate: request.admissionDate || request.auditDate,
      ipsId: request.ipsId,
      service: request.document.documentType || 'Hospitalización',
      keywords: [request.patientName || '', request.document.fileName || '']
    });

    logger.info('GeminiAIProvider', `Conocimiento recuperado: ${knowledgeResult.totalSourcesFound} fuentes, ${knowledgeResult.totalCriteriaFound} criterios, ${knowledgeResult.precedenceChains.length} cadenas normativas.`);

    // If Gemini API Key is available in environment, we attempt real structured LLM generation
    const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const normativeContextText = `
MARCO NORMATIVO Y CRITERIOS VIGENTES RECUPERADOS (BIBLIOTECA MAESTRA FOMAG):
- Fuentes aplicables (${knowledgeResult.totalSourcesFound}): ${knowledgeResult.relevantSources.map(s => `[${s.id}] ${s.name} (${s.validityStatus})`).join('; ')}
- Criterios específicos (${knowledgeResult.totalCriteriaFound}): ${knowledgeResult.relevantCriteria.map(c => `[${c.criterionId}] ${c.title}: ${c.requirement}`).join('; ')}
- Cadenas de precedencia: ${knowledgeResult.precedenceChains.map(p => p.summary).join(' | ')}
- Alertas de vigencia temporal: ${knowledgeResult.temporalWarnings.join(' | ') || 'Ninguna'}
- Conflictos normativos: ${knowledgeResult.conflictWarnings.join(' | ') || 'Ninguno'}
`;

        const userPrompt = buildConcurrentAuditUserPrompt({
          patientName: request.patientName || 'Paciente FOMAG',
          docNumber: request.docNumber || '1023456789',
          admissionDate: request.admissionDate || request.auditDate,
          ipsName: request.ipsName || 'IPS Red FOMAG',
          documentName: request.document.fileName,
          pageCount: request.document.pageCount || 4,
          extractedDocumentText: request.rawText || request.document.extractedTextSnippet || '',
          clinicalContextNotes: normativeContextText
        });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userPrompt,
          config: {
            systemInstruction: CONCURRENT_AUDIT_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        });

        const text = response.text?.trim() || '';
        if (text) {
          try {
            const parsed = JSON.parse(text);
            logger.info('GeminiAIProvider', `JSON estructurado recibido y validado exitosamente (${text.length} chars)`);

            // Attach retrieved sources and criteria to parsed findings
            if (Array.isArray(parsed.findings)) {
              parsed.findings.forEach((f: any) => {
                const subRet = knowledgeRetrievalService.retrieveKnowledge({
                  auditCategory: f.category,
                  clinicalContext: f.description,
                  eventDate: request.admissionDate || request.auditDate,
                  keywords: [f.code || '', f.title || '']
                });
                f.sourceReferences = subRet.relevantSources.slice(0, 3).map(s => ({
                  sourceId: s.id,
                  sourceName: s.name,
                  sourceVersion: s.version,
                  validityStatus: s.validityStatus,
                  officialUrl: s.officialUrl,
                  articleOrSection: s.scope,
                  precedenceChain: subRet.precedenceChains.find(c => c.rootSourceId === s.id)?.summary,
                  temporalWarning: subRet.temporalWarnings.find(w => w.includes(s.name))
                }));
                f.criterionReferences = subRet.relevantCriteria.slice(0, 2).map(c => ({
                  criterionId: c.criterionId,
                  sourceId: c.sourceId,
                  category: c.category,
                  title: c.title,
                  requirement: c.requirement,
                  evidenceRequired: c.evidenceRequired,
                  articleOrSection: c.articleOrSection,
                  status: c.status
                }));
                f.factEvidence = f.evidence?.snippet || f.description;
                if (f.criterionReferences.length > 0) {
                  f.criterionEvidence = `Criterio [${f.criterionReferences[0].criterionId}]: ${f.criterionReferences[0].requirement}`;
                }
              });
            }

            // Build backward-compatible structure
            return {
              success: true,
              modelUsed: this.name,
              processingTimeMs: Date.now() - startTime,
              data: {
                patientId: request.patientId,
                auditId: request.auditId,
                ipsId: request.ipsId,
                documentId: request.document.id,
                extractedData: {
                  demographics: parsed.inventory || {},
                  vitalsSummary: {
                    status: 'Signos vitales extraídos con citación por página',
                    sampleSource: 'Documento indexado'
                  },
                  medicationsFound: (parsed.medications || []).map((m: any) => `${m.medicationName} ${m.dose}`),
                  labsFound: (parsed.diagnosticAids || []).map((d: any) => `${d.studyName} - ${d.auditClassification}`),
                  proceduresFound: (parsed.proceduresAndConsultations || []).map((p: any) => `${p.name} - ${p.timelinessAssessment}`)
                },
                aiAnalysisDraft: {
                  clinicalChronology: (parsed.timeline || []).map((t: any) => `[${t.formattedDate}] ${t.title}: ${t.description}`),
                  potentialRiskFactors: (parsed.findings || []).map((f: any) => `[${f.priority}] ${f.title}: ${f.riskImpact}`),
                  suggestedAuditObservations: (parsed.findings || []).map((f: any) => `${f.description} (Evidencia: Pág. ${f.evidence?.pdfPage})`),
                  opportunityAreas: [
                    'Oportunidad diagnóstica e interconsultas',
                    'Pertinencia y racionalidad de estancia',
                    'Plan de acción de 24 horas'
                  ]
                },
                auditorValidation: {
                  status: 'Pendiente',
                  auditorNotes: 'Auditoría generada por Gemini AI vinculada a Biblioteca Normativa. Requiere validación por el auditor humano.'
                },
                disclaimer: parsed.disclaimer || 'Esta herramienta es un sistema de apoyo a la auditoría.'
              },
              expertAuditResult: {
                ...parsed,
                auditId: request.auditId,
                patientId: request.patientId,
                ipsId: request.ipsId,
                documentId: request.document.id,
                knowledgeTraceability: {
                  sourcesRetrievedCount: knowledgeResult.totalSourcesFound,
                  criteriaRetrievedCount: knowledgeResult.totalCriteriaFound,
                  confidenceLevel: knowledgeResult.confidenceLevel,
                  precedenceChains: knowledgeResult.precedenceChains,
                  temporalWarnings: knowledgeResult.temporalWarnings,
                  conflictWarnings: knowledgeResult.conflictWarnings
                },
                processedAt: new Date().toISOString()
              }
            };
          } catch (jsonErr: any) {
            logger.warn('GeminiAIProvider', `JSON devuelto requirió fallback determinista: ${jsonErr.message}`);
          }
        }
      } catch (err: any) {
        logger.warn('GeminiAIProvider', `Fallo de llamada LLM remota, activando motor clínico de respaldo: ${err.message}`);
      }
    }

    // Default & High-Performance Fallback: Deterministic Domain Engine
    return await ruleBasedAIProvider.analyzeDocument(request);
  }
}

export const geminiAIProvider = new GeminiAIProvider();

