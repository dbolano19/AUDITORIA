/**
 * DOMAIN LAYER - Scanned Page Detector (FASE 9)
 * Evaluates whether a PDF page lacks a viable native text stream
 * and therefore requires Optical Character Recognition (OCR).
 */
import { ScannedPageEvaluation } from '../models/ClinicalPage';

export interface ScannedPageDetectionConfig {
  minCharactersPerPage: number;
  minWordCount: number;
  maxNonAsciiRatio: number;
  minTextDensity: number;
}

export const DEFAULT_DETECTION_CONFIG: ScannedPageDetectionConfig = {
  minCharactersPerPage: 35, // Typical clinical record headers/notes exceed 50+ chars
  minWordCount: 5,
  maxNonAsciiRatio: 0.35, // High non-ascii or corrupted characters ratio indicates bad font encoding
  minTextDensity: 20
};

export class ScannedPageDetector {
  private config: ScannedPageDetectionConfig;

  constructor(config: Partial<ScannedPageDetectionConfig> = {}) {
    this.config = { ...DEFAULT_DETECTION_CONFIG, ...config };
  }

  /**
   * Evaluates a page's extracted native text to determine if it is scanned or empty
   */
  public evaluatePage(pageNumber: number, rawText: string): ScannedPageEvaluation {
    const trimmed = rawText.trim();
    const charCount = trimmed.length;
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // 1. Completely empty text stream
    if (charCount === 0) {
      return {
        pageNumber,
        isScanned: true,
        reason: 'Página sin capa de texto vectorial nativo (0 caracteres). Requiere OCR.',
        confidence: 0.98,
        textDensity: 0,
        nonAsciiRatio: 0
      };
    }

    // 2. Insufficient text (e.g. only page number or isolated symbol)
    if (charCount < this.config.minCharactersPerPage || wordCount < this.config.minWordCount) {
      return {
        pageNumber,
        isScanned: true,
        reason: `Texto insuficiente (${charCount} caracteres, ${wordCount} palabras). Posible escaneo con artefactos menores.`,
        confidence: 0.85,
        textDensity: charCount,
        nonAsciiRatio: 0
      };
    }

    // 3. Check for gibberish / corrupted encoding (unmapped PDF glyphs)
    let nonAsciiCount = 0;
    for (let i = 0; i < trimmed.length; i++) {
      const code = trimmed.charCodeAt(i);
      // Valid range: standard printable ascii (32-126) + Spanish latin-1 supplement (192-255) + common symbols
      if ((code < 32 || code > 126) && (code < 160 || code > 255) && code !== 10 && code !== 13) {
        nonAsciiCount++;
      }
    }

    const nonAsciiRatio = nonAsciiCount / charCount;
    if (nonAsciiRatio > this.config.maxNonAsciiRatio) {
      return {
        pageNumber,
        isScanned: true,
        reason: `Codificación defectuosa de fuentes (${Math.round(nonAsciiRatio * 100)}% caracteres no estándar). Se recomienda OCR.`,
        confidence: 0.80,
        textDensity: charCount,
        nonAsciiRatio
      };
    }

    // 4. Page has sufficient and legible native text
    return {
      pageNumber,
      isScanned: false,
      reason: `Texto nativo legible identificado (${charCount} caracteres, ${wordCount} palabras).`,
      confidence: 0.95,
      textDensity: charCount,
      nonAsciiRatio
    };
  }
}

export const scannedPageDetector = new ScannedPageDetector();
