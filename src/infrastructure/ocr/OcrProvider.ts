/**
 * INFRASTRUCTURE LAYER - OCR Provider Interface (FASE 9)
 * Decouples optical character recognition from specific engine implementations (Tesseract / Cloud Vision).
 */
import { OCRResult } from '../../domain/models/ClinicalPage';

export interface OcrProvider {
  name: string;
  isAvailable(): boolean;
  recognize(imageData: HTMLCanvasElement | ImageData | Blob | string): Promise<OCRResult>;
}
