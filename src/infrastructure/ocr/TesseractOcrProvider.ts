/**
 * INFRASTRUCTURE LAYER - Tesseract.js OCR Provider (FASE 9)
 * Real in-browser / WebAssembly OCR implementation for scanned clinical documents.
 */
import { OcrProvider } from './OcrProvider';
import { OCRResult } from '../../domain/models/ClinicalPage';
import { logger } from '../logging/loggerService';
import { createWorker } from 'tesseract.js';

export class TesseractOcrProvider implements OcrProvider {
  name = 'Tesseract.js OCR Engine (WASM)';
  private worker: any = null;
  private isInitializing = false;

  isAvailable(): boolean {
    return typeof window !== 'undefined';
  }

  private async getWorker() {
    if (this.worker) return this.worker;
    if (this.isInitializing) {
      // Wait for initialization to finish
      let attempts = 0;
      while (this.isInitializing && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      if (this.worker) return this.worker;
    }

    this.isInitializing = true;
    try {
      logger.info('TesseractOcrProvider', 'Inicializando worker WASM de Tesseract...');
      // Initialize with Spanish and English language recognition
      const worker = await createWorker('spa+eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            // Can track OCR progress
          }
        }
      });
      this.worker = worker;
      return worker;
    } catch (err: any) {
      logger.warn('TesseractOcrProvider', `Error al inicializar worker spa+eng, intentando fallback eng: ${err.message}`);
      try {
        const fallbackWorker = await createWorker('eng');
        this.worker = fallbackWorker;
        return fallbackWorker;
      } catch (fallbackErr: any) {
        logger.error('TesseractOcrProvider', `Error crítico inicializando Tesseract: ${fallbackErr.message}`);
        throw fallbackErr;
      }
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Executes real OCR on a canvas element or image source
   */
  async recognize(imageData: HTMLCanvasElement | ImageData | Blob | string): Promise<OCRResult> {
    const startTime = Date.now();
    try {
      logger.info('TesseractOcrProvider', 'Ejecutando reconocimiento óptico de caracteres...');
      const worker = await this.getWorker();
      const ret = await worker.recognize(imageData);

      const durationMs = Date.now() - startTime;
      const text = ret.data.text || '';
      const confidence = ret.data.confidence ? parseFloat((ret.data.confidence / 100).toFixed(2)) : null;

      const blocks = (ret.data.blocks || []).map((b: any) => ({
        text: b.text || '',
        confidence: b.confidence ? parseFloat((b.confidence / 100).toFixed(2)) : null,
        bbox: b.bbox ? { x0: b.bbox.x0, y0: b.bbox.y0, x1: b.bbox.x1, y1: b.bbox.y1 } : undefined
      }));

      logger.info('TesseractOcrProvider', `OCR completado en ${durationMs}ms`, {
        extractedChars: text.length,
        confidence
      });

      return {
        text,
        confidence,
        language: 'spa+eng',
        provider: this.name,
        blocks,
        durationMs
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      logger.error('TesseractOcrProvider', `Fallo en el pipeline de OCR: ${err.message}`);
      return {
        text: '',
        confidence: null,
        provider: this.name,
        durationMs
      };
    }
  }

  /**
   * Clean up worker resources when done
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (e) {
        // Ignore
      }
      this.worker = null;
    }
  }
}

export const tesseractOcrProvider = new TesseractOcrProvider();
