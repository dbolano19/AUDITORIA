/**
 * DOMAIN LAYER - Document Repository Interface
 * Abstracts storage of raw and processed clinical documents.
 */
import { ClinicalPage, DocumentCoverage } from '../models/ClinicalPage';
import { ClinicalDocHC } from '../../types';

export interface ProcessedDocumentData {
  document: ClinicalDocHC;
  pages: ClinicalPage[];
  coverage: DocumentCoverage;
  fullExtractedText: string;
  processedAt: string;
}

export interface DocumentRepository {
  saveDocument(doc: ClinicalDocHC): Promise<ClinicalDocHC>;
  getDocumentById(id: string): Promise<ClinicalDocHC | null>;
  getDocumentsByAudit(auditId: string): Promise<ClinicalDocHC[]>;
  saveProcessedData(data: ProcessedDocumentData): Promise<void>;
  getProcessedData(documentId: string): Promise<ProcessedDocumentData | null>;
  deleteDocument(id: string): Promise<boolean>;
}

export interface EvidenceRepository {
  saveEvidence(evidence: any): Promise<any>;
  getEvidenceByDocument(documentId: string): Promise<any[]>;
  getEvidenceByPage(documentId: string, pageNumber: number): Promise<any[]>;
}

export interface ClinicalRecordRepository {
  saveRecord(record: any): Promise<any>;
  getRecordById(id: string): Promise<any | null>;
}
