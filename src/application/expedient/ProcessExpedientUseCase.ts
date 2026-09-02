/**
 * APPLICATION LAYER - Process Expedient Use Case
 * Coordinates clinical document inspection, OCR extraction, and metadata indexing.
 */
import { ClinicalDocHC, AIAnalysisStructure, CompleteConcurrentAuditResult } from '../../domain/models';
import { pdfProcessor } from '../../infrastructure/pdf/pdfProcessor';
import { ocrService } from '../../infrastructure/ocr/ocrService';
import { geminiAIProvider } from '../../infrastructure/ai';
import { logger } from '../../infrastructure/logging/loggerService';

export interface ProcessExpedientInput {
  file: File;
  patientId: string;
  auditId: string;
  ipsId: string;
  auditDate: string;
  documentType: ClinicalDocHC['documentType'];
  uploadedBy: string;
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
}

export interface ProcessExpedientResult {
  document: ClinicalDocHC;
  ocrSnippet: string;
  aiDraft: AIAnalysisStructure;
  expertAuditResult?: CompleteConcurrentAuditResult;
}

export class ProcessExpedientUseCase {
  async execute(input: ProcessExpedientInput): Promise<ProcessExpedientResult> {
    logger.info('ProcessExpedientUseCase', `Iniciando procesamiento de expediente para auditoría: ${input.auditId}`);

    // 1. PDF Inspection
    const inspection = await pdfProcessor.inspectDocument(input.file);

    // 2. Document Entity Creation
    const documentId = 'doc_' + Date.now();
    const document: ClinicalDocHC = {
      id: documentId,
      patientId: input.patientId,
      auditId: input.auditId,
      fileName: input.file.name,
      fileSize: input.file.size,
      pageCount: inspection.estimatedPages,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: input.uploadedBy,
      status: 'Procesado',
      documentType: input.documentType,
      previewPages: inspection.previewPages,
      extractedTextSnippet: `Procesado: ${input.file.name} (${inspection.estimatedPages} págs)`
    };

    // 3. OCR Pipeline
    const ocrResult = await ocrService.processOCR(input.file.name, inspection.estimatedPages);
    document.extractedTextSnippet = ocrResult.normalizedText.slice(0, 180) + '...';

    // 4. AI Provider Structuring & Expert Audit Engine
    const aiResponse = await geminiAIProvider.analyzeDocument({
      document,
      patientId: input.patientId,
      auditId: input.auditId,
      ipsId: input.ipsId,
      auditDate: input.auditDate,
      patientName: input.patientName,
      docType: input.docType,
      docNumber: input.docNumber,
      age: input.age,
      sex: input.sex,
      roomBed: input.roomBed,
      service: input.service,
      ipsName: input.ipsName,
      admissionDate: input.admissionDate,
      mainDiagnosis: input.mainDiagnosis,
      rawText: ocrResult.normalizedText
    });

    logger.info('ProcessExpedientUseCase', `Expediente procesado exitosamente: ${document.id}`);

    return {
      document,
      ocrSnippet: ocrResult.normalizedText,
      aiDraft: aiResponse.data,
      expertAuditResult: aiResponse.expertAuditResult
    };
  }
}

export const processExpedientUseCase = new ProcessExpedientUseCase();

