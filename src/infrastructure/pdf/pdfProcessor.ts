/**
 * INFRASTRUCTURE LAYER - PDF Processor (FASE 9)
 * Real PDF document inspection and binary parsing pipeline.
 * Powered by pdfjs-dist and RealPdfProcessor.
 */
import { RealPdfProcessor, realPdfProcessor, RealPDFMetadata } from './RealPdfProcessor';
import { logger } from '../logging/loggerService';

export interface PDFInspectionResult {
  fileName: string;
  fileSize: number;
  actualPageCount: number;
  estimatedPages: number;
  previewPages: string[];
  isReadable: boolean;
  mimeType: string;
  isEncrypted: boolean;
  error?: string;
}

export class PDFProcessor {
  private realProcessor: RealPdfProcessor;

  constructor(realProcessor: RealPdfProcessor = realPdfProcessor) {
    this.realProcessor = realProcessor;
  }

  /**
   * Inspects an uploaded file object to extract real binary metadata and page count
   */
  async inspectDocument(file: File): Promise<PDFInspectionResult> {
    logger.info('PDFProcessor', `Iniciando inspección binaria real de: ${file.name}`, {
      fileSize: file.size,
      mimeType: file.type
    });

    const realMeta: RealPDFMetadata = await this.realProcessor.inspectDocument(file);
    const previewPages: string[] = [];

    const pageCount = realMeta.isValidPdf ? realMeta.actualPageCount : 0;
    for (let i = 1; i <= Math.min(pageCount, 12); i++) {
      previewPages.push(`Página ${i} de ${pageCount} - Expediente Clínico Real`);
    }

    return {
      fileName: file.name,
      fileSize: file.size,
      actualPageCount: pageCount,
      estimatedPages: pageCount, // Kept for backward compatibility
      previewPages,
      isReadable: realMeta.isValidPdf,
      mimeType: file.type || 'application/pdf',
      isEncrypted: realMeta.isEncrypted,
      error: realMeta.error
    };
  }

  /**
   * Extracts real text stream from all pages of the PDF file
   */
  async extractRawText(file: File): Promise<string> {
    logger.info('PDFProcessor', `Extrayendo flujo de texto real de: ${file.name}`);
    const meta = await this.realProcessor.inspectDocument(file);
    if (!meta.isValidPdf || meta.actualPageCount === 0) {
      throw new Error(meta.error || 'El archivo no es un documento PDF válido.');
    }

    const textParts: string[] = [];
    for (let i = 1; i <= meta.actualPageCount; i++) {
      const pageExtract = await this.realProcessor.extractPageText(file, i);
      if (pageExtract.hasNativeText) {
        textParts.push(`[FOLIO/PÁGINA ${i}]\n${pageExtract.rawText}`);
      }
    }

    return textParts.join('\n\n');
  }
}

export const pdfProcessor = new PDFProcessor();
