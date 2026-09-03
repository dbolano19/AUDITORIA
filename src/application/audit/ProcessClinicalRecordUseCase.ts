/**
 * APPLICATION LAYER - Process Clinical Record Use Case (FASE 9)
 * Full pipeline for real PDF ingestion, OCR, evidence validation, and concurrent audit execution.
 * 
 * Strict Principle: NO EVIDENCE -> NO CLAIM.
 */
import { pdfTextExtractor, PageProcessingProgress } from '../../infrastructure/pdf/PdfTextExtractor';
import { FileSecurityService } from '../../infrastructure/security/FileSecurityService';
import { EvidenceValidator } from '../../domain/services/EvidenceValidator';
import { concurrentAuditEngine } from '../../domain/services/concurrentAuditEngine';
import { storageService } from '../../services/storageService';
import { logger } from '../../infrastructure/logging/loggerService';
import {
  ClinicalPage,
  DocumentCoverage,
  EvidenceValidationResult
} from '../../domain/models/ClinicalPage';
import {
  ClinicalDocHC,
  Patient,
  Audit
} from '../../domain/models';
import {
  CompleteConcurrentAuditResult,
  ConcurrentAuditFinding
} from '../../domain/models/concurrentAudit';

export interface ProcessClinicalRecordInput {
  file: File;
  patient: Patient;
  audit: Audit;
  ipsId: string;
  ipsName: string;
  userId: string;
  userName: string;
  userRole: string;
  onProgress?: (progress: PageProcessingProgress) => void;
}

export interface ProcessClinicalRecordOutput {
  success: boolean;
  document: ClinicalDocHC;
  pages: ClinicalPage[];
  coverage: DocumentCoverage;
  auditResult: CompleteConcurrentAuditResult;
  evidenceValidations: EvidenceValidationResult[];
  unverifiedFindingsCount: number;
  message: string;
}

export class ProcessClinicalRecordUseCase {
  /**
   * Executes the end-to-end real clinical document ingestion and audit pipeline
   */
  async execute(input: ProcessClinicalRecordInput): Promise<ProcessClinicalRecordOutput> {
    const startTime = Date.now();
    logger.info('ProcessClinicalRecordUseCase', `Iniciando ingesta real de archivo ${input.file.name} para paciente ${input.patient.fullName}`);

    // 1. File Security Validation (Magic bytes, MIME, size, 0-byte corrupt check)
    const securityCheck = await FileSecurityService.validateUploadedFile(input.file);
    if (!securityCheck.valid) {
      throw new Error(`Archivo no válido: ${securityCheck.errorMessage}`);
    }

    // 2. Real PDF Extraction (Native + OCR fallback per page)
    const { pages, coverage, fullText } = await pdfTextExtractor.processDocument(
      input.file,
      input.onProgress
    );

    if (pages.length === 0) {
      throw new Error('No se pudo extraer ninguna página del archivo PDF.');
    }

    // 3. Create ClinicalDocHC entity
    const newDocId = `doc-${Date.now()}`;
    const clinicalDoc: ClinicalDocHC = {
      id: newDocId,
      patientId: input.patient.id,
      auditId: input.audit.id,
      fileName: input.file.name,
      fileSize: input.file.size,
      pageCount: coverage.totalPages,
      uploadDate: new Date().toISOString(),
      uploadedBy: input.userName,
      status: 'Procesado',
      documentType: 'Historia Clínica Completa',
      extractedTextSnippet: fullText.substring(0, 500) + (fullText.length > 500 ? '...' : ''),
      notes: `Procesado mediante Pipeline Real FASE 9: ${coverage.nativeTextPages} págs nativas, ${coverage.ocrPages} págs OCR. Cobertura: ${coverage.coveragePercentage}%.`
    };

    // Save document to storage
    storageService.saveDocument(clinicalDoc);
    storageService.saveProcessedDocumentPages(newDocId, pages, coverage);

    // 4. Execute Concurrent Audit Engine with REAL extracted text
    input.onProgress?.({
      currentPage: coverage.totalPages,
      totalPages: coverage.totalPages,
      currentStage: 'Ejecutando motor de reglas clínicas con texto real extraído...',
      percentage: 90,
      status: 'processing'
    });

    const auditResult = concurrentAuditEngine.analyzeClinicalRecord({
      patientId: input.patient.id,
      patientName: input.patient.fullName,
      docType: input.patient.docType,
      docNumber: input.patient.docNumber,
      age: input.patient.age,
      sex: input.patient.sex,
      roomBed: input.patient.roomBed,
      service: input.patient.service,
      ipsId: input.ipsId,
      ipsName: input.ipsName,
      auditId: input.audit.id,
      auditDate: input.audit.auditDate || new Date().toISOString(),
      admissionDate: input.patient.admissionDate,
      mainDiagnosis: input.patient.mainDiagnosis,
      documentId: newDocId,
      documentName: input.file.name,
      pageCount: coverage.totalPages,
      rawText: fullText
    });

    // 5. Evidence Verification against REAL page texts (NO EVIDENCE -> NO CLAIM)
    input.onProgress?.({
      currentPage: coverage.totalPages,
      totalPages: coverage.totalPages,
      currentStage: 'Verificando citas de evidencia contra texto real de folios...',
      percentage: 95,
      status: 'processing'
    });

    const evidenceValidations: EvidenceValidationResult[] = [];
    let unverifiedCount = 0;

    const pageTextMap = new Map<number, string>();
    pages.forEach(p => pageTextMap.set(p.pageNumber, p.normalizedText));

    const validatedFindings: ConcurrentAuditFinding[] = (auditResult.findings || []).map(finding => {
      const pageNum = finding.evidence?.pdfPage || 1;
      const snippet = finding.evidence?.snippet || finding.factEvidence || '';
      const pageText = pageTextMap.get(pageNum) || '';

      const validation = EvidenceValidator.validateSnippet(snippet, pageText, pageNum, finding.id);
      evidenceValidations.push(validation);

      if (validation.status === 'INVALID') {
        unverifiedCount++;
        // If evidence wasn't found on the cited page, search across other pages
        const bestMatch = EvidenceValidator.findBestMatchingPage(snippet, pages.map(p => ({ pageNumber: p.pageNumber, text: p.normalizedText })));
        if (bestMatch && bestMatch.validation.status !== 'INVALID') {
          return {
            ...finding,
            evidence: {
              ...finding.evidence,
              pdfPage: bestMatch.bestPage,
              snippet: bestMatch.validation.snippet
            },
            certaintyLevel: 'POSIBLE HALLAZGO',
            riskImpact: `${finding.riskImpact} (Reubicado en pág. ${bestMatch.bestPage} tras verificación automática)`,
            temporalWarning: `Evidencia relocalizada en pág. ${bestMatch.bestPage} (${bestMatch.validation.explanation})`
          };
        }

        // Tag finding as unverified rather than hallucinating
        return {
          ...finding,
          certaintyLevel: 'INFORMACIÓN INSUFICIENTE',
          title: `[POR VERIFICAR EN HC] ${finding.title}`,
          description: `${finding.description} — NOTA: No se localizó coincidencia exacta en página ${pageNum}.`,
          temporalWarning: 'Alerta de Evidencia: Fragmento no verificado textualmente en la página indicada.'
        };
      }

      return finding;
    });

    auditResult.findings = validatedFindings;
    storageService.saveEvidenceValidations(newDocId, evidenceValidations);

    // 6. Update storage with verified findings
    validatedFindings.forEach(f => {
      storageService.saveFinding({
        id: f.id,
        auditId: input.audit.id,
        patientId: input.patient.id,
        ipsId: input.ipsId,
        code: f.code,
        description: f.description,
        category: f.category,
        priority: f.priority.replace(/[^a-zA-ZáéíóúÁÉÍÓÚ]/g, '').trim() as any,
        status: 'Abierto',
        evidence: f.factEvidence || f.evidence?.snippet || '',
        evidenceText: f.factEvidence || f.evidence?.snippet || '',
        evidenceDetails: {
          sourceDocId: newDocId,
          sourceDocName: input.file.name,
          pdfPage: f.evidence?.pdfPage || 1,
          evidenceText: f.factEvidence || f.evidence?.snippet || '',
          observation: f.criterionEvidence
        },
        impact: f.riskImpact,
        clinicalImpact: f.clinicalAnalysis,
        recommendation: f.recommendation,
        responsible: f.suggestedResponsible,
        deadline: f.suggestedDeadline === '24 horas' ? '24 horas' : '48 horas',
        createdAt: new Date().toISOString()
      });
    });

    const durationMs = Date.now() - startTime;
    logger.info('ProcessClinicalRecordUseCase', `Ingesta y auditoría completada en ${durationMs}ms`, {
      totalPages: coverage.totalPages,
      findingsCount: validatedFindings.length,
      unverifiedCount
    });

    return {
      success: true,
      document: clinicalDoc,
      pages,
      coverage,
      auditResult,
      evidenceValidations,
      unverifiedFindingsCount: unverifiedCount,
      message: `Documento "${input.file.name}" procesado con éxito. ${coverage.totalPages} páginas analizadas (${coverage.nativeTextPages} nativas, ${coverage.ocrPages} OCR).`
    };
  }
}

export const processClinicalRecordUseCase = new ProcessClinicalRecordUseCase();
