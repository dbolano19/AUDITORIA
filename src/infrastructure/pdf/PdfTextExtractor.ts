/**
 * INFRASTRUCTURE LAYER - PDF Text Extractor Pipeline (FASE 9)
 * Orchestrates real native extraction, scanned page detection, and OCR fallback per page.
 * Strictly maintains exact pageNumber mapping at all times.
 */
import { RealPdfProcessor, realPdfProcessor } from './RealPdfProcessor';
import { OcrProvider } from '../ocr/OcrProvider';
import { tesseractOcrProvider } from '../ocr/TesseractOcrProvider';
import { ScannedPageDetector, scannedPageDetector } from '../../domain/services/ScannedPageDetector';
import { TextNormalizationService } from '../../domain/services/TextNormalizationService';
import { ClinicalSectionDetector } from '../../domain/services/ClinicalSectionDetector';
import { ChronologyExtractor } from '../../domain/services/ChronologyExtractor';
import { ClinicalPage, DocumentCoverage, ExtractionMethod } from '../../domain/models/ClinicalPage';
import { logger } from '../logging/loggerService';

export interface PageProcessingProgress {
  currentPage: number;
  totalPages: number;
  currentStage: string;
  percentage: number;
  status: 'processing' | 'ocr' | 'completed' | 'error';
}

export class PdfTextExtractor {
  private pdfProcessor: RealPdfProcessor;
  private ocrProvider: OcrProvider;
  private scannedDetector: ScannedPageDetector;

  constructor(
    pdfProcessor: RealPdfProcessor = realPdfProcessor,
    ocrProvider: OcrProvider = tesseractOcrProvider,
    scannedDetector: ScannedPageDetector = scannedPageDetector
  ) {
    this.pdfProcessor = pdfProcessor;
    this.ocrProvider = ocrProvider;
    this.scannedDetector = scannedDetector;
  }

  /**
   * Processes all pages of a real PDF document with progress reporting
   */
  async processDocument(
    file: File | ArrayBuffer,
    onProgress?: (progress: PageProcessingProgress) => void
  ): Promise<{ pages: ClinicalPage[]; coverage: DocumentCoverage; fullText: string }> {
    const startTime = Date.now();
    const metadata = await this.pdfProcessor.inspectDocument(file);

    if (!metadata.isValidPdf || metadata.actualPageCount === 0) {
      throw new Error(metadata.error || 'Documento PDF inválido o no procesable.');
    }

    const totalPages = metadata.actualPageCount;
    const pages: ClinicalPage[] = [];
    const warnings: string[] = [];

    let nativePagesCount = 0;
    let ocrPagesCount = 0;
    let failedPagesCount = 0;
    let totalChars = 0;
    let totalWords = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const pageStartTime = Date.now();
      
      onProgress?.({
        currentPage: pageNum,
        totalPages,
        currentStage: `Extrayendo texto nativo en página ${pageNum} de ${totalPages}...`,
        percentage: Math.round(((pageNum - 0.5) / totalPages) * 100),
        status: 'processing'
      });

      try {
        // 1. Extract native text stream
        const extract = await this.pdfProcessor.extractPageText(file, pageNum);
        const scanEval = this.scannedDetector.evaluatePage(pageNum, extract.rawText);

        let finalRawText = extract.rawText;
        let extractionMethod: ExtractionMethod = 'native_pdf';
        let confidence: number | null = 1.0;
        let isScanned = scanEval.isScanned;

        // 2. If page is detected as scanned/empty and OCR provider is available -> Execute OCR
        if (scanEval.isScanned && this.ocrProvider.isAvailable()) {
          onProgress?.({
            currentPage: pageNum,
            totalPages,
            currentStage: `Ejecutando OCR óptico en página escaneada ${pageNum} de ${totalPages}...`,
            percentage: Math.round(((pageNum - 0.2) / totalPages) * 100),
            status: 'ocr'
          });

          try {
            const canvas = await this.pdfProcessor.renderPageToCanvas(file, pageNum, 1.8);
            const ocrResult = await this.ocrProvider.recognize(canvas);

            if (ocrResult.text && ocrResult.text.trim().length > 0) {
              finalRawText = ocrResult.text;
              extractionMethod = 'ocr';
              confidence = ocrResult.confidence;
              ocrPagesCount++;
            } else {
              warnings.push(`Página ${pageNum}: OCR no pudo extraer texto legible.`);
            }
          } catch (ocrErr: any) {
            logger.warn('PdfTextExtractor', `Error en OCR para página ${pageNum}: ${ocrErr.message}`);
            warnings.push(`Página ${pageNum}: Fallo en motor OCR (${ocrErr.message}).`);
          }
        } else if (!scanEval.isScanned) {
          nativePagesCount++;
        }

        // 3. Normalize text & extract clinical metadata
        const normalizedText = TextNormalizationService.normalizeText(finalRawText);
        const words = normalizedText.split(/\s+/).filter(w => w.length > 0);
        const detectedSections = ClinicalSectionDetector.detectSectionsInPage(pageNum, normalizedText).map(s => s.name);
        const chronology = ChronologyExtractor.extractFromPage(pageNum, normalizedText);
        const detectedDates = Array.from(new Set(chronology.map(c => c.date)));
        const detectedServices = Array.from(new Set(chronology.filter(c => c.service).map(c => c.service!)));

        const charCount = normalizedText.length;
        const wordCount = words.length;
        const hasText = charCount > 0;

        totalChars += charCount;
        totalWords += wordCount;
        if (confidence !== null) {
          confidenceSum += confidence;
          confidenceCount++;
        }

        pages.push({
          pageNumber: pageNum,
          text: finalRawText,
          normalizedText,
          charCount,
          wordCount,
          extractionMethod,
          confidence,
          hasText,
          isScanned,
          scannedReason: scanEval.reason,
          detectedSections,
          detectedServices,
          detectedDates,
          processingDurationMs: Date.now() - pageStartTime
        });
      } catch (err: any) {
        failedPagesCount++;
        warnings.push(`Página ${pageNum}: Error de extracción (${err.message}).`);
        pages.push({
          pageNumber: pageNum,
          text: '',
          normalizedText: '',
          charCount: 0,
          wordCount: 0,
          extractionMethod: 'failed',
          confidence: null,
          hasText: false,
          isScanned: true,
          scannedReason: 'Error en procesamiento de página',
          detectedSections: [],
          detectedServices: [],
          detectedDates: [],
          processingDurationMs: Date.now() - pageStartTime,
          error: err.message
        });
      }
    }

    const processedPages = pages.filter(p => p.hasText).length;
    const totalDuration = Date.now() - startTime;
    const coveragePercentage = totalPages > 0 ? parseFloat(((processedPages / totalPages) * 100).toFixed(1)) : 0;
    const nativeCoverage = totalPages > 0 ? parseFloat(((nativePagesCount / totalPages) * 100).toFixed(1)) : 0;
    const ocrCoverage = totalPages > 0 ? parseFloat(((ocrPagesCount / totalPages) * 100).toFixed(1)) : 0;
    const avgConfidence = confidenceCount > 0 ? parseFloat((confidenceSum / confidenceCount).toFixed(2)) : null;

    const coverage: DocumentCoverage = {
      totalPages,
      processedPages,
      nativeTextPages: nativePagesCount,
      ocrPages: ocrPagesCount,
      failedPages: failedPagesCount,
      coveragePercentage,
      nativeTextCoveragePercentage: nativeCoverage,
      ocrCoveragePercentage: ocrCoverage,
      totalExtractedCharacters: totalChars,
      totalExtractedWords: totalWords,
      averageConfidence: avgConfidence,
      processingTotalDurationMs: totalDuration,
      isFullyCovered: failedPagesCount === 0 && processedPages === totalPages,
      warnings
    };

    onProgress?.({
      currentPage: totalPages,
      totalPages,
      currentStage: `Procesamiento completado (${coveragePercentage}% cobertura documental).`,
      percentage: 100,
      status: 'completed'
    });

    const fullText = pages
      .map(p => `--- PÁGINA ${p.pageNumber} [Método: ${p.extractionMethod}] ---\n${p.normalizedText}`)
      .join('\n\n');

    return { pages, coverage, fullText };
  }
}

export const pdfTextExtractor = new PdfTextExtractor();
