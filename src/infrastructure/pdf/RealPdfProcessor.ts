/**
 * INFRASTRUCTURE LAYER - Real PDF Processor (FASE 9)
 * Full binary reading, page extraction, and canvas rendering using pdfjs-dist.
 * Strictly replaces simulated page counts and mock text streams.
 */
import * as pdfjsLib from 'pdfjs-dist';
import { logger } from '../logging/loggerService';

// Initialize PDF.js worker safely for Vite/Browser environments
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface RealPDFMetadata {
  fileName: string;
  fileSize: number;
  actualPageCount: number;
  isEncrypted: boolean;
  isValidPdf: boolean;
  error?: string;
}

export interface RealPageExtract {
  pageNumber: number;
  rawText: string;
  hasNativeText: boolean;
  charCount: number;
  canvasElement?: HTMLCanvasElement;
  thumbnailUrl?: string;
  error?: string;
}

export class RealPdfProcessor {
  /**
   * Validates and extracts true page count and metadata from binary file buffer
   */
  async inspectDocument(file: File | ArrayBuffer): Promise<RealPDFMetadata> {
    const fileName = file instanceof File ? file.name : 'document.pdf';
    const fileSize = file instanceof File ? file.size : file.byteLength;

    logger.info('RealPdfProcessor', `Iniciando inspección binaria real de: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)`);

    try {
      const buffer = file instanceof File ? await file.arrayBuffer() : file;
      const loadingTask = pdfjsLib.getDocument({
        data: buffer,
        useSystemFonts: true
      });

      const pdf = await loadingTask.promise;
      const actualPageCount = pdf.numPages;

      logger.info('RealPdfProcessor', `PDF abierto exitosamente. Conteo real de páginas: ${actualPageCount}`);

      return {
        fileName,
        fileSize,
        actualPageCount,
        isEncrypted: false,
        isValidPdf: true
      };
    } catch (err: any) {
      logger.error('RealPdfProcessor', `Error abriendo archivo PDF: ${err.message}`);
      return {
        fileName,
        fileSize,
        actualPageCount: 0,
        isEncrypted: err.name === 'PasswordException',
        isValidPdf: false,
        error: err.message || 'El archivo no es un documento PDF válido o se encuentra corrupto.'
      };
    }
  }

  /**
   * Extracts real native text stream for a specific page
   */
  async extractPageText(file: File | ArrayBuffer, pageNumber: number): Promise<RealPageExtract> {
    try {
      const buffer = file instanceof File ? await file.arrayBuffer() : file;
      const loadingTask = pdfjsLib.getDocument({
        data: buffer
      });

      const pdf = await loadingTask.promise;
      if (pageNumber < 1 || pageNumber > pdf.numPages) {
        throw new Error(`Página ${pageNumber} fuera de rango (1 - ${pdf.numPages})`);
      }

      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      
      // Combine text items preserving whitespace and line structure
      const textItems: string[] = [];
      let lastY: number | null = null;

      for (const item of textContent.items as any[]) {
        if (!item.str) continue;
        const currentY = item.transform ? item.transform[5] : null;
        
        // Add line break if vertical displacement is detected
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          textItems.push('\n');
        } else if (textItems.length > 0 && !textItems[textItems.length - 1].endsWith(' ')) {
          textItems.push(' ');
        }

        textItems.push(item.str);
        lastY = currentY;
      }

      const rawText = textItems.join('').trim();
      const hasNativeText = rawText.length > 0;

      return {
        pageNumber,
        rawText,
        hasNativeText,
        charCount: rawText.length
      };
    } catch (err: any) {
      logger.error('RealPdfProcessor', `Error extrayendo texto en página ${pageNumber}: ${err.message}`);
      return {
        pageNumber,
        rawText: '',
        hasNativeText: false,
        charCount: 0,
        error: err.message
      };
    }
  }

  /**
   * Renders a page to an HTML canvas element (for OCR or thumbnail preview)
   */
  async renderPageToCanvas(
    file: File | ArrayBuffer,
    pageNumber: number,
    scale: number = 1.5
  ): Promise<HTMLCanvasElement> {
    const buffer = file instanceof File ? await file.arrayBuffer() : file;
    const loadingTask = pdfjsLib.getDocument({
      data: buffer
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) {
      throw new Error('No se pudo obtener el contexto 2D del canvas.');
    }

    await page.render({
      canvasContext: context,
      viewport,
      canvas
    } as any).promise;

    return canvas;
  }
}

export const realPdfProcessor = new RealPdfProcessor();
