/**
 * INFRASTRUCTURE LAYER - OCR Service (FASE 9)
 * Optical Character Recognition for scanned pages and clinical documents.
 * Powered by TesseractOcrProvider (WASM).
 */
import { TesseractOcrProvider, tesseractOcrProvider } from './TesseractOcrProvider';
import { TextNormalizationService } from '../../domain/services/TextNormalizationService';
import { logger } from '../logging/loggerService';

export interface OCRExtractionResult {
  rawText: string;
  normalizedText: string;
  confidence: number | null;
  extractedSections: {
    title: string;
    page: number;
    content: string;
  }[];
  durationMs: number;
  provider: string;
}

export class OCRService {
  private provider: TesseractOcrProvider;

  constructor(provider: TesseractOcrProvider = tesseractOcrProvider) {
    this.provider = provider;
  }

  /**
   * Processes an image or canvas source through real OCR
   */
  async processOCR(
    imageSource: HTMLCanvasElement | ImageData | Blob | string,
    pageNumber: number = 1
  ): Promise<OCRExtractionResult> {
    const startTime = Date.now();
    logger.info('OCRService', `Ejecutando pipeline OCR real para página ${pageNumber}...`);

    const result = await this.provider.recognize(imageSource);
    const normalizedText = TextNormalizationService.normalizeText(result.text);
    const durationMs = Date.now() - startTime;

    return {
      rawText: result.text,
      normalizedText,
      confidence: result.confidence,
      extractedSections: [
        {
          title: `Texto extraído por OCR (Pág. ${pageNumber})`,
          page: pageNumber,
          content: normalizedText.substring(0, 300)
        }
      ],
      durationMs,
      provider: result.provider
    };
  }
}

export const ocrService = new OCRService();
