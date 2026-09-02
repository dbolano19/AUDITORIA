import {
  Audit,
  Patient,
  IPS,
  Finding,
  RecommendationItem,
  DailyFollowUp,
  DiagnosticAid,
  ProcedureItem,
  TreatmentItem,
  AdditionalTreatments,
  UserSatisfaction,
  StayAnalysis,
  IngresoNote,
  AuditSession,
  GeneratedAuditReport,
  DetailedReportData,
  ExecutiveReportData,
  AuditReportType,
  AuditReportStatus
} from '../domain';
import { storageService } from './storageService';
import { generateReportUseCase, AuditReportData, PDFExportOptions } from '../application/reporting/GenerateReportUseCase';
import { generateAuditPdfUseCase } from '../application/reporting/GenerateAuditPdfUseCase';

export type { AuditReportData, PDFExportOptions };

class ReportService {
  /**
   * Prepares the full structured data bundle for the 18-section audit report
   */
  prepareFullAuditReportData(audit: Audit, patient: Patient, ips?: IPS): AuditReportData {
    const ipsData = ips || storageService.getIPS().find(i => i.id === audit.ipsId) || {
      id: audit.ipsId,
      code: 'IPS-00',
      name: 'Institución Prestadora de Servicios',
      city: 'Barranquilla',
      department: 'Atlántico',
      status: 'Activa',
      createdAt: '2025-01-01',
      contacts: [],
      observations: '',
      bedsCapacity: 100,
      servicesAvailable: []
    };

    const ingresoNote = storageService.getIngresoNote(audit.id);
    const dailyFollowUps = storageService.getDailyFollowUps(audit.id);
    const diagnosticAids = storageService.getDiagnosticAids(audit.id);
    const procedures = storageService.getProcedures(audit.id);
    const treatments = storageService.getTreatments(audit.id);
    const additionalTreatments = storageService.getAdditionalTreatments(audit.id);
    const findings = storageService.getFindings(audit.id);
    const userSatisfaction = storageService.getUserSatisfaction(audit.id);
    const stayAnalysis = storageService.getStayAnalysis(audit.id);
    const recommendations = storageService.getRecommendations(audit.id);

    return {
      audit,
      patient,
      ips: ipsData,
      ingresoNote,
      dailyFollowUps,
      diagnosticAids,
      procedures: procedures as ProcedureItem[],
      treatments: treatments as TreatmentItem[],
      additionalTreatments,
      findings,
      userSatisfaction,
      stayAnalysis,
      recommendations,
      conclusion: `Auditoría concurrente hospitalaria realizada en ${ipsData.name}. Paciente con ${stayAnalysis?.stayDays || 1} días de estancia en el servicio de ${patient.service}. Se identificaron ${findings.length} hallazgo(s) y se establecieron ${recommendations.length} recomendación(es) para optimización de pertinencia, oportunidad y seguridad clínica.`,
      generatedAt: new Date().toISOString(),
      generatedBy: audit.auditorName || 'Médico Auditor Concurrente'
    };
  }

  /**
   * Delegates rendering to the Application Layer UseCase
   */
  renderFullAuditReportHTML(data: AuditReportData): string {
    return generateReportUseCase.renderHTML(data);
  }

  /**
   * High-fidelity print preview trigger
   */
  generateAuditPDF(reportData: AuditReportData, options?: PDFExportOptions): void {
    generateReportUseCase.printPDF(reportData, options);
  }

  /**
   * Generates exportable CSV / text summary of audits for spreadsheet analysis
   */
  exportAuditsCSV(audits: Audit[], patients: Patient[], ipsList: IPS[]): string {
    return generateReportUseCase.exportCSV(audits, patients, ipsList);
  }

  // ==================== FASE 6: MOTOR PROFESIONAL DE INFORME PDF ====================

  /**
   * Generates and stores a Detailed Audit Report from an AuditSession
   */
  async generateDetailedReportRecord(
    session: AuditSession,
    options: {
      status?: AuditReportStatus;
      version?: number;
      auditorName?: string;
      auditorRole?: string;
    } = {}
  ): Promise<GeneratedAuditReport> {
    const detailedData = generateAuditPdfUseCase.buildDetailedReportData(session, options);
    const html = generateAuditPdfUseCase.renderDetailedReportHTML(detailedData, options.status === 'BORRADOR');
    const hash = await generateAuditPdfUseCase.computeIntegrityHash(html);
    const fileName = generateAuditPdfUseCase.generateStandardFileName(
      session.ipsName,
      session.id,
      session.auditDate
    );

    const reportRecord: GeneratedAuditReport = {
      id: `rep-${session.id}-${Date.now()}`,
      reportCode: `REP-${session.auditDate.substring(0, 4)}-${session.id.replace(/\D/g, '').padStart(5, '0') || '00101'}`,
      auditId: session.id,
      sessionId: session.id,
      ipsId: session.ipsId,
      ipsName: session.ipsName,
      patientId: session.patientId,
      patientName: session.docNumber ? `Paciente CC ${session.docNumber}` : 'Paciente Hospitalizado',
      type: 'INFORME_DETALLADO',
      status: options.status || (session.status === 'Cerrada' ? 'CERRADO' : session.status === 'Validada y Firmada' ? 'FINAL' : 'BORRADOR'),
      version: options.version || 1,
      generatedAt: new Date().toISOString(),
      generatedBy: options.auditorName || session.auditorName,
      auditorRole: options.auditorRole || session.auditorRole,
      fileName,
      hash,
      findingsCount: {
        total: session.findings.length,
        confirmed: detailedData.confirmedFindings.length,
        modified: detailedData.modifiedFindings.length,
        rejected: detailedData.rejectedFindings.length,
        pendingEvidence: detailedData.pendingEvidenceFindings.length,
        notApplicable: detailedData.notApplicableFindings.length,
        critical: detailedData.summaryStats.prioritySituationsCount
      },
      actions24hCount: detailedData.actionPlan24h.length,
      versionChanges: [
        {
          version: options.version || 1,
          timestamp: new Date().toISOString(),
          user: options.auditorName || session.auditorName,
          role: options.auditorRole || session.auditorRole,
          summary: `Generación de informe detallado con ${detailedData.confirmedFindings.length} hallazgos confirmados.`
        }
      ],
      detailedData
    };

    storageService.saveGeneratedReport(reportRecord);
    return reportRecord;
  }

  /**
   * Generates and stores an Executive Audit Report
   */
  async generateExecutiveReportRecord(
    ipsName: string,
    ipsId: string,
    period: string = 'Período 2026',
    auditorName: string = 'Dra. Patricia Charry'
  ): Promise<GeneratedAuditReport> {
    const sessions = storageService.getAuditSessions();
    const executiveData = generateAuditPdfUseCase.buildExecutiveReportData(ipsName, ipsId, sessions, period, auditorName);
    const html = generateAuditPdfUseCase.renderExecutiveReportHTML(executiveData);
    const hash = await generateAuditPdfUseCase.computeIntegrityHash(html);
    const fileName = `Auditoria_FOMAG_${generateAuditPdfUseCase.sanitizeIpsName(ipsName)}_EJECUTIVO_${new Date().toISOString().split('T')[0]}.pdf`;

    const reportRecord: GeneratedAuditReport = {
      id: `rep-exec-${ipsId}-${Date.now()}`,
      reportCode: `REP-EXEC-${new Date().getFullYear()}-${ipsId.replace(/\D/g, '') || '01'}`,
      auditId: `AUD-CONSOLIDADO-${ipsId.toUpperCase()}`,
      ipsId,
      ipsName,
      patientId: 'all',
      patientName: 'Consolidado Institucional',
      type: 'INFORME_EJECUTIVO',
      status: 'FINAL',
      version: 1,
      generatedAt: new Date().toISOString(),
      generatedBy: auditorName,
      auditorRole: 'Médico Auditor Coordinador',
      fileName,
      hash,
      findingsCount: {
        total: executiveData.totalConfirmedFindings + 3,
        confirmed: executiveData.totalConfirmedFindings,
        modified: 2,
        rejected: 3,
        pendingEvidence: 1,
        notApplicable: 0,
        critical: executiveData.totalPriorityFindings
      },
      actions24hCount: executiveData.pendingActionsSummary.total,
      versionChanges: [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          user: auditorName,
          role: 'Coordinador Auditoría',
          summary: `Emisión de informe ejecutivo consolidado para ${ipsName}.`
        }
      ],
      executiveData
    };

    storageService.saveGeneratedReport(reportRecord);
    return reportRecord;
  }

  /**
   * Creates a new version (e.g. v1 -> v2) for a report record with change tracking
   */
  async createNewReportVersion(
    reportId: string,
    changeSummary: string,
    user: string,
    role: string,
    updatedDetailedData?: DetailedReportData
  ): Promise<GeneratedAuditReport | undefined> {
    let newHash: string | undefined;
    if (updatedDetailedData) {
      const html = generateAuditPdfUseCase.renderDetailedReportHTML(updatedDetailedData);
      newHash = await generateAuditPdfUseCase.computeIntegrityHash(html);
    }

    return storageService.createReportVersion(
      reportId,
      {
        ...(updatedDetailedData ? { detailedData: updatedDetailedData } : {}),
        ...(newHash ? { hash: newHash } : {})
      },
      changeSummary,
      user,
      role
    );
  }
}

export const reportService = new ReportService();
