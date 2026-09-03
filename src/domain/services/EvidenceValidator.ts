/**
 * DOMAIN LAYER - Evidence Validator (FASE 9)
 * Strictly verifies whether a claimed evidence snippet actually exists
 * in the real extracted text of the designated document page.
 * 
 * Strict Principle: NO EVIDENCE -> NO CLAIM.
 */
import { TextNormalizationService } from './TextNormalizationService';
import { EvidenceValidationResult } from '../models/ClinicalPage';

export class EvidenceValidator {
  /**
   * Validates a claimed evidence snippet against the text of the specified page
   */
  public static validateSnippet(
    snippet: string,
    pageText: string,
    pageNumber: number,
    evidenceId?: string
  ): EvidenceValidationResult {
    const timestamp = new Date().toISOString();
    const cleanSnippet = TextNormalizationService.cleanSnippet(snippet);

    if (!cleanSnippet || cleanSnippet.length < 3) {
      return {
        evidenceId,
        status: 'INVALID',
        pageNumber,
        snippet: cleanSnippet,
        similarityScore: 0,
        exactMatch: false,
        foundInPage: false,
        normalizedMatch: false,
        explanation: 'El fragmento de evidencia está vacío o no contiene texto clínicamente interpretable.',
        timestamp
      };
    }

    if (!pageText || pageText.trim().length === 0) {
      return {
        evidenceId,
        status: 'INVALID',
        pageNumber,
        snippet: cleanSnippet,
        similarityScore: 0,
        exactMatch: false,
        foundInPage: false,
        normalizedMatch: false,
        explanation: `La página ${pageNumber} no contiene texto extraído para corroborar la evidencia.`,
        timestamp
      };
    }

    // 1. Direct exact case-sensitive substring match
    if (pageText.includes(cleanSnippet)) {
      return {
        evidenceId,
        status: 'VALID',
        pageNumber,
        snippet: cleanSnippet,
        matchedText: cleanSnippet,
        similarityScore: 1.0,
        exactMatch: true,
        foundInPage: true,
        normalizedMatch: true,
        explanation: `Evidencia documental directa verificada con coincidencia exacta al 100% en la página ${pageNumber}.`,
        timestamp
      };
    }

    // 2. Normalized match (ignoring whitespace differences, newlines, and accents)
    const normPage = TextNormalizationService.normalizeForMatching(pageText);
    const normSnippet = TextNormalizationService.normalizeForMatching(cleanSnippet);

    if (normPage.includes(normSnippet)) {
      return {
        evidenceId,
        status: 'VALID',
        pageNumber,
        snippet: cleanSnippet,
        matchedText: cleanSnippet,
        similarityScore: 0.95,
        exactMatch: false,
        foundInPage: true,
        normalizedMatch: true,
        explanation: `Evidencia verificada en página ${pageNumber} (coincidencia normalizada de texto).`,
        timestamp
      };
    }

    // 3. Token-based overlap / Partial match evaluation
    const snippetTokens = normSnippet.split(/\s+/).filter(t => t.length > 2);
    if (snippetTokens.length === 0) {
      return {
        evidenceId,
        status: 'INVALID',
        pageNumber,
        snippet: cleanSnippet,
        similarityScore: 0,
        exactMatch: false,
        foundInPage: false,
        normalizedMatch: false,
        explanation: `No se identificaron palabras clave suficientes en el fragmento para verificar la página ${pageNumber}.`,
        timestamp
      };
    }

    let tokensFound = 0;
    for (const token of snippetTokens) {
      if (normPage.includes(token)) {
        tokensFound++;
      }
    }

    const tokenOverlapRatio = tokensFound / snippetTokens.length;

    // If >75% of clinical words exist on the page in close proximity
    if (tokenOverlapRatio >= 0.75) {
      return {
        evidenceId,
        status: 'PARTIAL',
        pageNumber,
        snippet: cleanSnippet,
        similarityScore: parseFloat(tokenOverlapRatio.toFixed(2)),
        exactMatch: false,
        foundInPage: true,
        normalizedMatch: false,
        explanation: `Coincidencia parcial (${Math.round(tokenOverlapRatio * 100)}% de términos encontrados en página ${pageNumber}). Requiere confirmación por el auditor.`,
        timestamp
      };
    }

    // 4. Evidence does NOT exist on the page
    return {
      evidenceId,
      status: 'INVALID',
      pageNumber,
      snippet: cleanSnippet,
      similarityScore: parseFloat(tokenOverlapRatio.toFixed(2)),
      exactMatch: false,
      foundInPage: false,
      normalizedMatch: false,
      explanation: `El texto de evidencia no fue encontrado en la página ${pageNumber} (${Math.round(tokenOverlapRatio * 100)}% coincidencia). Posible discrepancia de folio o alucinación.`,
      timestamp
    };
  }

  /**
   * Scans all pages in the document to see if an invalid snippet was cited with the wrong page number
   */
  public static findBestMatchingPage(
    snippet: string,
    pages: { pageNumber: number; text: string }[]
  ): { bestPage: number; validation: EvidenceValidationResult } | null {
    if (!snippet || pages.length === 0) return null;

    let bestScore = -1;
    let bestResult: { bestPage: number; validation: EvidenceValidationResult } | null = null;

    for (const p of pages) {
      const val = this.validateSnippet(snippet, p.text, p.pageNumber);
      if (val.similarityScore > bestScore && val.similarityScore >= 0.6) {
        bestScore = val.similarityScore;
        bestResult = { bestPage: p.pageNumber, validation: val };
      }
      if (val.exactMatch) break; // Found exact match
    }

    return bestResult;
  }
}
