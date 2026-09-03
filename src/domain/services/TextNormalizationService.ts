/**
 * DOMAIN LAYER - Text Normalization Service (FASE 9)
 * Normalizes technical artifacts (spaces, line breaks, control characters, unicode)
 * while STRICTLY preserving clinical specifics:
 * - Dosages & Units (mg, g, mcg, UI, ml, cc, mmHg, lpm, rpm, °C)
 * - Dates & Times (DD/MM/YYYY, HH:mm)
 * - Medication names
 * - Diagnoses & ICD-10 / CIE-10 codes
 * - Negation terms (NO, NIEGA, SIN, AUSENCIA DE)
 * 
 * Strict Principle: NEVER alter clinical meaning or factual values.
 */

export class TextNormalizationService {
  /**
   * Normalizes raw extracted text for consistent search and verification
   */
  public static normalizeText(text: string): string {
    if (!text) return '';

    return text
      // Replace non-standard whitespace and control chars with regular space
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, ' ')
      // Normalize line breaks to single \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Clean up multiple consecutive line breaks (max 2)
      .replace(/\n{3,}/g, '\n\n')
      // Remove spaces before line breaks
      .replace(/[ \t]+\n/g, '\n')
      // Replace multiple horizontal spaces with a single space
      .replace(/[ \t]{2,}/g, ' ')
      // Fix broken common words with hyphens across linebreaks: e.g. "hospi-\ntal" -> "hospital"
      .replace(/(\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)-\n([a-zA-ZáéíóúÁÉÍÓÚñÑ]+\b)/g, '$1$2')
      .trim();
  }

  /**
   * Generates a strict search-friendly string for evidence snippet matching:
   * lowercased, single spaces, accents preserved or simplified, punctuation normalized.
   */
  public static normalizeForMatching(text: string): string {
    if (!text) return '';

    return text
      .toLowerCase()
      // Normalize accented characters to facilitate robust substring search while keeping letters
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Replace punctuation and newlines with space
      .replace(/[.,;:()\-—_[\]{}"'/\\|\n\r\t]/g, ' ')
      // Collapse spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Sanitizes a snippet for presentation while keeping its exact casing
   */
  public static cleanSnippet(snippet: string): string {
    if (!snippet) return '';
    return snippet
      .replace(/\s+/g, ' ')
      .replace(/^["'«“]/, '')
      .replace(/["'»”]$/, '')
      .trim();
  }
}
