/**
 * INFRASTRUCTURE LAYER - AI Provider Interface
 * Decouples AI models/engines from business logic and application use cases.
 */
import { AIAnalysisStructure, ClinicalDocHC, CompleteConcurrentAuditResult } from '../../domain/models';

export interface AIProviderRequest {
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

export interface AIProviderResponse {
  success: boolean;
  modelUsed: string;
  processingTimeMs: number;
  data: AIAnalysisStructure;
  expertAuditResult?: CompleteConcurrentAuditResult;
  error?: string;
}


export interface AIProvider {
  name: string;
  analyzeDocument(request: AIProviderRequest): Promise<AIProviderResponse>;
}
