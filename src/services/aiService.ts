import { ClinicalDocHC, AIAnalysisStructure, CompleteConcurrentAuditResult } from '../domain';
import { geminiAIProvider } from '../infrastructure/ai';
import { appConfig } from '../infrastructure/config/appConfig';
import { logger } from '../infrastructure/logging/loggerService';

export interface AIAnalysisRequest {
  document: ClinicalDocHC;
  patientId: string;
  auditId: string;
  ipsId: string;
  auditDate: string;
  patientName?: string;
  docType?: string;
  docNumber?: string;
  age?: number;
  sex?: string;
  roomBed?: string;
  service?: string;
  ipsName?: string;
  admissionDate?: string;
  mainDiagnosis?: string;
  rawText?: string;
}

export interface AIAnalysisResponse {
  success: boolean;
  message: string;
  analysisData: AIAnalysisStructure;
  expertAuditResult?: CompleteConcurrentAuditResult;
  readinessState: 'PREPARED_FOR_PHASE_2_EXPERT_ENGINE' | 'PHASE_3_EXPERT_ENGINE_ACTIVE';
}

/**
 * AI Service for Concurrent Clinical Audits (Phase 3 Expert Engine Layer)
 * Uses the decoupled AI Provider infrastructure while maintaining full backward compatibility.
 * 
 * Strict Architectural Separation:
 * 1. DATOS EXTRAÍDOS (Verifiable OCR / Document extraction)
 * 2. ANÁLISIS IA (Machine generated suggestions, risk patterns, drafts)
 * 3. VALIDACIÓN DEL AUDITOR (Human-in-the-loop clinical oversight & approval)
 */
class AIService {
  public static readonly CLINICAL_SAFETY_DISCLAIMER = appConfig.safetyDisclaimer;

  /**
   * Coordinates clinical document analysis via the decoupled AI Provider
   */
  async analyzeClinicalDocument(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    logger.info('AIService', `Procesando análisis asistido para doc ${request.document.fileName} en auditoría ${request.auditId}`);

    const providerResult = await geminiAIProvider.analyzeDocument({
      document: request.document,
      patientId: request.patientId,
      auditId: request.auditId,
      ipsId: request.ipsId,
      auditDate: request.auditDate,
      patientName: request.patientName,
      docType: request.docType,
      docNumber: request.docNumber,
      age: request.age,
      sex: request.sex,
      roomBed: request.roomBed,
      service: request.service,
      ipsName: request.ipsName,
      admissionDate: request.admissionDate,
      mainDiagnosis: request.mainDiagnosis,
      rawText: request.rawText
    });

    return {
      success: providerResult.success,
      message: 'Documento procesado con éxito por el Motor Experto de Auditoría Concurrente FOMAG.',
      analysisData: providerResult.data,
      expertAuditResult: providerResult.expertAuditResult,
      readinessState: 'PHASE_3_EXPERT_ENGINE_ACTIVE'
    };
  }
}

export const aiService = new AIService();

