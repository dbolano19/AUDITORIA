/**
 * DOMAIN LAYER - Chronology Extractor (FASE 9)
 * Identifies and structures clinical dates, times, and care services from extracted page text.
 * Strict principle: NO hallucinated dates. Ambiguous dates are labeled 'unknown'.
 */

export interface ExtractedChronologyItem {
  date: string; // Formatted YYYY-MM-DD or raw string
  time?: string;
  rawDateString: string;
  pageNumber: number;
  service?: string;
  snippet: string;
}

export class ChronologyExtractor {
  private static readonly SERVICE_PATTERNS: { name: string; regex: RegExp }[] = [
    { name: 'Urgencias', regex: /\b(urgencias|triage|sala\s+de\s+reanimaci[oó]n|observaci[oó]n\s+urgencias)\b/i },
    { name: 'UCI Adultos', regex: /\b(uci|unidad\s+de\s+cuidados\s+intensivos|terapia\s+intensiva|uci\s+adultos)\b/i },
    { name: 'UCE / Cuidados Intermedios', regex: /\b(uce|cuidados\s+intermedios|unidad\s+intermedia)\b/i },
    { name: 'Hospitalización General', regex: /\b(hospitalizaci[oó]n|piso|habitaci[oó]n|cama|sala\s+general)\b/i },
    { name: 'Quirófano / Cirugía', regex: /\b(quir[oó]fano|cirug[ií]a|sala\s+de\s+cirug[ií]a|postquir[uú]rgico|recuperaci[oó]n)\b/i },
    { name: 'Consulta Externa', regex: /\b(consulta\s+externa|ambulatorio|control\s+m[eé]dico)\b/i }
  ];

  /**
   * Extracts dates and timestamps from a page text
   */
  public static extractFromPage(pageNumber: number, pageText: string): ExtractedChronologyItem[] {
    if (!pageText) return [];

    const items: ExtractedChronologyItem[] = [];

    // Match DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD with optional time HH:mm
    const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})(?:\s+(?:a\s+las\s+)?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[aApP][mM])?))?\b/g;

    let match: RegExpExecArray | null;
    while ((match = dateRegex.exec(pageText)) !== null) {
      const rawDate = match[1];
      const time = match[2];
      const start = Math.max(0, match.index - 30);
      const end = Math.min(pageText.length, match.index + match[0].length + 50);
      const snippet = pageText.substring(start, end).replace(/\s+/g, ' ').trim();

      // Normalize date to YYYY-MM-DD if possible
      const normalizedDate = this.normalizeDateString(rawDate);
      const detectedService = this.detectServiceInSnippet(snippet) || this.detectServiceInSnippet(pageText);

      items.push({
        date: normalizedDate || rawDate,
        time,
        rawDateString: match[0],
        pageNumber,
        service: detectedService,
        snippet
      });

      // Avoid matching too many redundant items per page
      if (items.length >= 10) break;
    }

    return items;
  }

  /**
   * Detects hospital service mention in a text snippet
   */
  public static detectServiceInSnippet(text: string): string | undefined {
    for (const service of this.SERVICE_PATTERNS) {
      if (service.regex.test(text)) {
        return service.name;
      }
    }
    return undefined;
  }

  /**
   * Attempts normalization of standard Colombian date formats
   */
  private static normalizeDateString(dateStr: string): string | null {
    const parts = dateStr.split(/[/-]/);
    if (parts.length === 3) {
      // If YYYY/MM/DD
      if (parts[0].length === 4) {
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      // If DD/MM/YYYY
      if (parts[2].length === 4 || parts[2].length === 2) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${y}-${m}-${d}`;
      }
    }
    return null;
  }
}
