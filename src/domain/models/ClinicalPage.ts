/**
 * DOMAIN LAYER - Clinical Ingestion & Page Models (FASE 9)
 * Strict principle: NO EVIDENCE -> NO CLAIM
 */

export type ExtractionMethod = 'native_pdf' | 'ocr' | 'hybrid' | 'failed';

export type EvidenceValidationStatus = 'VALID' | 'PARTIAL' | 'INVALID' | 'UNVERIFIED';

/**
 * Single clinical page extracted from a real PDF document
 */
export interface ClinicalPage {
  pageNumber: number;
  text: string;
  normalizedText: string;
  charCount: number;
  wordCount: number;
  extractionMethod: ExtractionMethod;
  confidence: number | null;
  hasText: boolean;
  isScanned: boolean;
  scannedReason?: string;
  detectedSections: string[];
  detectedServices: string[];
  detectedDates: string[];
  processingDurationMs: number;
  error?: string;
  imageDataUrl?: string; // Optional thumbnail/rendered canvas for preview
}

/**
 * Result of OCR execution on a scanned page
 */
export interface OCRResult {
  text: string;
  confidence: number | null;
  language?: string;
  provider: string;
  blocks?: {
    text: string;
    confidence: number | null;
    bbox?: { x0: number; y0: number; x1: number; y1: number };
  }[];
  durationMs: number;
}

/**
 * Result of scanned page detection
 */
export interface ScannedPageEvaluation {
  pageNumber: number;
  isScanned: boolean;
  reason: string;
  confidence: number;
  textDensity: number; // chars per page
  nonAsciiRatio: number;
}

/**
 * Document Processing Coverage Metrics
 */
export interface DocumentCoverage {
  totalPages: number;
  processedPages: number;
  nativeTextPages: number;
  ocrPages: number;
  failedPages: number;
  coveragePercentage: number;
  nativeTextCoveragePercentage: number;
  ocrCoveragePercentage: number;
  totalExtractedCharacters: number;
  totalExtractedWords: number;
  averageConfidence: number | null;
  processingTotalDurationMs: number;
  isFullyCovered: boolean;
  warnings: string[];
}

/**
 * Evidence Validation Result against actual page text
 */
export interface EvidenceValidationResult {
  evidenceId?: string;
  status: EvidenceValidationStatus;
  pageNumber: number;
  snippet: string;
  matchedText?: string;
  similarityScore: number; // 0.0 to 1.0 (1.0 = exact match)
  exactMatch: boolean;
  foundInPage: boolean;
  normalizedMatch: boolean;
  explanation: string;
  timestamp: string;
}

/**
 * Detected Clinical Section in page or document
 */
export interface DetectedClinicalSection {
  name: string;
  standardKey: string;
  pageNumber: number;
  startCharIndex?: number;
  contentSnippet: string;
  confidence: number;
  isMandatory: boolean;
  status: 'FOUND' | 'NOT_FOUND' | 'INCOMPLETE';
}
