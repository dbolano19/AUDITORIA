/**
 * Privacy and Data Minimization Guard for Clinical Information (FOMAG)
 */
export class PrivacyGuard {
  /**
   * Masks a national identification number (e.g. 1045892481 -> CC-104****481)
   */
  static maskDocNumber(docType: string = 'CC', docNumber: string = ''): string {
    if (!docNumber) return `${docType}-******`;
    const clean = docNumber.trim();
    if (clean.length <= 4) return `${docType}-${clean}`;
    const start = clean.substring(0, 3);
    const end = clean.substring(clean.length - 3);
    return `${docType}-${start}****${end}`;
  }

  /**
   * Anonymizes patient name for generic / aggregated listings (e.g. 'PACIENTE PAC-0012')
   */
  static anonymizePatientName(fullName: string, internalId: string): string {
    if (!fullName) return `Paciente ${internalId}`;
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0].toUpperCase())
      .join('.');
    return `Paciente (${initials}) · ${internalId}`;
  }

  /**
   * Safe preview for clinical text to prevent full HC leakage in logs/reports
   */
  static sanitizeClinicalSnippet(text: string, maxLength: number = 180): string {
    if (!text) return '';
    const clean = text.replace(/[\r\n]+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    return clean.substring(0, maxLength) + '... [Texto clínico truncado por política de privacidad]';
  }

  /**
   * Sanitizes user inputs or text to eliminate script injection / HTML tags
   */
  static sanitizeText(input: string): string {
    if (!input) return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/javascript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '')
      .trim();
  }
}
