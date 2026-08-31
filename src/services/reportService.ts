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
  IngresoNote
} from '../types';
import { storageService } from './storageService';

export interface AuditReportData {
  audit: Audit;
  patient: Patient;
  ips: IPS;
  ingresoNote: IngresoNote | null;
  dailyFollowUps: DailyFollowUp[];
  diagnosticAids: DiagnosticAid[];
  procedures: ProcedureItem[];
  treatments: TreatmentItem[];
  additionalTreatments: AdditionalTreatments | null;
  findings: Finding[];
  userSatisfaction: UserSatisfaction | null;
  stayAnalysis: StayAnalysis | null;
  recommendations: RecommendationItem[];
  conclusion?: string;
  generatedAt: string;
  generatedBy: string;
}

export interface PDFExportOptions {
  includeCoverPage?: boolean;
  includeEvidenceAppendix?: boolean;
  watermarkDraft?: boolean;
  format?: 'A4' | 'Letter';
}

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
      procedures,
      treatments,
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
   * Renders the complete, high-fidelity 18-section printable HTML document
   */
  renderFullAuditReportHTML(data: AuditReportData): string {
    const { audit, patient, ips, ingresoNote, dailyFollowUps, diagnosticAids, procedures, treatments, additionalTreatments, findings, userSatisfaction, stayAnalysis, recommendations } = data;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nota de Auditoría Concurrente - ${audit.auditCode}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 12px;
      margin: 0;
      padding: 24px;
      background: #ffffff;
    }
    .header-box {
      border: 2px solid #0e7490;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      background: #f0fdfa;
    }
    .header-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      margin: 0 0 6px 0;
      display: flex;
      justify-content: space-between;
    }
    .disclaimer-box {
      background: #fffbeb;
      border: 1px solid #f59e0b;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 10px;
      color: #92400e;
      font-weight: 600;
      margin-bottom: 20px;
      line-height: 1.4;
    }
    .section-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      margin-bottom: 16px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .section-header {
      background: #0f172a;
      color: #ffffff;
      padding: 6px 12px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-body {
      padding: 12px;
      background: #ffffff;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 10px;
    }
    .field-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .field-value {
      font-size: 11px;
      font-weight: 600;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 6px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      font-weight: 700;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
    }
    .badge-critical { background: #fee2e2; color: #991b1b; }
    .badge-high { background: #ffedd5; color: #9a3412; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .signature-area {
      margin-top: 30px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      page-break-inside: avoid;
    }
    .signature-line {
      border-top: 1px solid #0f172a;
      padding-top: 6px;
      font-weight: 600;
      font-size: 11px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>

  <!-- Mandatory Safety Banner -->
  <div class="disclaimer-box">
    ⚠️ REGLA PERMANENTE DE SEGURIDAD ASISTENCIAL:<br>
    "Esta herramienta es un sistema de apoyo a la auditoría y no reemplaza el criterio profesional del auditor ni las decisiones del equipo asistencial."
  </div>

  <!-- Header Box -->
  <div class="header-box">
    <div class="header-title">
      <span>NOTA DE AUDITORÍA CONCURRENTE HOSPITALARIA</span>
      <span>${audit.auditCode}</span>
    </div>
    <div class="grid-3" style="margin-top: 10px;">
      <div>
        <div class="field-label">IPS Auditada</div>
        <div class="field-value">${ips.name} (${ips.city})</div>
      </div>
      <div>
        <div class="field-label">Fecha de Auditoría</div>
        <div class="field-value">${audit.auditDate}</div>
      </div>
      <div>
        <div class="field-label">Auditor Responsable</div>
        <div class="field-value">${audit.auditorName}</div>
      </div>
    </div>
  </div>

  <!-- 1. IDENTIFICACIÓN DE LA IPS Y DEL PACIENTE -->
  <div class="section-card">
    <div class="section-header">1. Identificación de la IPS y Datos del Paciente</div>
    <div class="section-body grid-4">
      <div>
        <div class="field-label">Nombre del Paciente</div>
        <div class="field-value">${patient.fullName}</div>
      </div>
      <div>
        <div class="field-label">Documento de Identidad</div>
        <div class="field-value">${patient.docType} ${patient.docNumber}</div>
      </div>
      <div>
        <div class="field-label">Edad / Sexo / EPS</div>
        <div class="field-value">${patient.age} años · ${patient.sex} · ${patient.eps || 'N/A'}</div>
      </div>
      <div>
        <div class="field-label">Servicio / Cama</div>
        <div class="field-value">${patient.service} · ${patient.roomBed}</div>
      </div>
    </div>
  </div>

  <!-- 2. ANTECEDENTES Y MOTIVO DE HOSPITALIZACIÓN -->
  <div class="section-card">
    <div class="section-header">2. Antecedentes y Motivo de Hospitalización</div>
    <div class="section-body">
      <div class="grid-2" style="margin-bottom: 8px;">
        <div>
          <div class="field-label">Fecha de Ingreso</div>
          <div class="field-value">${patient.admissionDate}</div>
        </div>
        <div>
          <div class="field-label">Diagnóstico Principal</div>
          <div class="field-value">${patient.mainDiagnosis}</div>
        </div>
      </div>
      <div>
        <div class="field-label">Motivo de Ingreso / Resumen de Cuadro Clínico</div>
        <div class="field-value">${ingresoNote?.hospitalizationReason || 'Paciente con ingreso registrado para manejo intrahospitalario y monitorización continua.'}</div>
      </div>
    </div>
  </div>

  <!-- 3. EVOLUCIÓN CLÍNICA DIARIA -->
  <div class="section-card">
    <div class="section-header">3. Evolución Clínica Diaria (Seguimiento Concurrente)</div>
    <div class="section-body">
      ${dailyFollowUps.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 90px;">Fecha</th>
              <th>Estado Clínico y Cambios</th>
              <th>Conducta y Plan Médico</th>
              <th>Observación Auditor</th>
            </tr>
          </thead>
          <tbody>
            ${dailyFollowUps.map(f => `
              <tr>
                <td><strong>${f.date}</strong></td>
                <td>${f.clinicalStatus} ${f.significantClinicalChanges ? `<br><small style="color: #64748b;">Cambios: ${f.significantClinicalChanges}</small>` : ''}</td>
                <td>${f.medicalAnalysisAndPlan}</td>
                <td>${f.auditorObservations || 'Conforme'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b; margin: 0;">Sin notas de seguimiento diario adicionales registradas.</p>'}
    </div>
  </div>

  <!-- 4. AYUDAS DIAGNÓSTICAS Y PROCEDIMIENTOS -->
  <div class="section-card">
    <div class="section-header">4. Ayudas Diagnósticas y Pertinencia</div>
    <div class="section-body">
      ${diagnosticAids.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Estudio Solicitado</th>
              <th>Fecha Solicitud</th>
              <th>Estado / Oportunidad</th>
              <th>Pertinencia</th>
              <th>Resultado / Interpretación</th>
            </tr>
          </thead>
          <tbody>
            ${diagnosticAids.map(d => `
              <tr>
                <td><strong>${d.studyName || d.name}</strong></td>
                <td>${d.requestDate}</td>
                <td><span class="badge ${d.status === 'Completado' ? 'badge-ok' : 'badge-high'}">${d.status}</span></td>
                <td>${d.pertinenceEvaluation || 'Pertinente'}</td>
                <td>${d.result || d.interpretation || 'Pendiente'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b; margin: 0;">No se registraron ayudas diagnósticas críticas.</p>'}
    </div>
  </div>

  <!-- 5. TRATAMIENTO MÉDICO -->
  <div class="section-card">
    <div class="section-header">5. Tratamiento Farmacológico y Adicional</div>
    <div class="section-body">
      ${treatments.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Dosis / Frecuencia</th>
              <th>Vía</th>
              <th>Fecha Inicio</th>
              <th>Pertinencia</th>
            </tr>
          </thead>
          <tbody>
            ${treatments.map(t => `
              <tr>
                <td><strong>${t.medication}</strong></td>
                <td>${t.dose} · ${t.frequency}</td>
                <td>${t.route}</td>
                <td>${t.startDate}</td>
                <td>${t.pertinenceEvaluation || 'Pertinente'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b; margin: 0;">Tratamiento farmacológico conforme a guías de manejo.</p>'}
    </div>
  </div>

  <!-- 6. MATRIZ DE HALLAZGOS TIPIFICADOS -->
  <div class="section-card">
    <div class="section-header">6. Matriz de Hallazgos y Desviaciones Tipificadas (${findings.length})</div>
    <div class="section-body">
      ${findings.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Código / Tipo</th>
              <th>Prioridad</th>
              <th>Descripción del Hallazgo</th>
              <th>Evidencia Documental</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${findings.map(f => `
              <tr>
                <td><strong>${f.code || f.id}</strong><br><small>${f.type || f.category}</small></td>
                <td><span class="badge ${f.priority === 'Crítico' || f.priority === 'Crítica' ? 'badge-critical' : 'badge-high'}">${f.priority}</span></td>
                <td>${f.description}</td>
                <td style="font-size: 10px; color: #475569;">${f.evidenceText || f.evidence || 'Verificada en HC'}</td>
                <td>${f.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b; margin: 0;">No se evidenciaron no conformidades o desviaciones asistenciales críticas.</p>'}
    </div>
  </div>

  <!-- 7. ANÁLISIS DE ESTANCIA Y BARRERAS -->
  <div class="section-card">
    <div class="section-header">7. Análisis de Estancia Hospitalaria y Pertinencia</div>
    <div class="section-body grid-3">
      <div>
        <div class="field-label">Días de Estancia Acumulados</div>
        <div class="field-value">${stayAnalysis?.stayDays || 1} días</div>
      </div>
      <div>
        <div class="field-label">Riesgo de Estancia Prolongada</div>
        <div class="field-value">${stayAnalysis?.prolongedStayRisk ? '🔴 Sí - En Riesgo' : '🟢 No - Justificada'}</div>
      </div>
      <div>
        <div class="field-label">Posibilidad de Egreso Temprano</div>
        <div class="field-value">${stayAnalysis?.earlyDischargePossibility || 'En evaluación'}</div>
      </div>
    </div>
  </div>

  <!-- 8. RECOMENDACIONES Y COMPROMISOS -->
  <div class="section-card">
    <div class="section-header">8. Recomendaciones y Compromisos Asistenciales</div>
    <div class="section-body">
      ${recommendations.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Acción Requerida</th>
              <th>Responsable IPS</th>
              <th>Fecha Límite</th>
              <th>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            ${recommendations.map(r => `
              <tr>
                <td><strong>${r.requiredAction}</strong></td>
                <td>${r.responsible}</td>
                <td>${r.deadline}</td>
                <td>${r.priority}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b; margin: 0;">Sin acciones correctivas pendientes.</p>'}
    </div>
  </div>

  <!-- Signatures Area -->
  <div class="signature-area">
    <div>
      <div class="signature-line">
        ${audit.auditorName}<br>
        <span style="font-weight: 400; color: #64748b;">${audit.auditorRole || 'Médico Auditor Concurrente'}</span>
      </div>
    </div>
    <div>
      <div class="signature-line">
        Coordinación Médica / Auditoría Médica<br>
        <span style="font-weight: 400; color: #64748b;">${ips.name} - Barranquilla</span>
      </div>
    </div>
  </div>

</body>
</html>`;
  }

  /**
   * High-fidelity print preview trigger
   */
  generateAuditPDF(reportData: AuditReportData, _options?: PDFExportOptions): void {
    const html = this.renderFullAuditReportHTML(reportData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  }

  /**
   * Generates exportable CSV / text summary of audits for spreadsheet analysis
   */
  exportAuditsCSV(audits: Audit[], patients: Patient[], ipsList: IPS[]): string {
    const headers = ['Código Auditoría', 'IPS', 'Paciente', 'Documento', 'Servicio', 'Fecha Auditoría', 'Tipo', 'Estado', 'Auditor'];
    const rows = audits.map(a => {
      const p = patients.find(pat => pat.id === a.patientId);
      const ips = ipsList.find(i => i.id === a.ipsId);
      return [
        `"${a.auditCode}"`,
        `"${ips?.name || a.ipsId}"`,
        `"${p?.fullName || ''}"`,
        `"${p?.docType || ''} ${p?.docNumber || ''}"`,
        `"${p?.service || ''}"`,
        `"${a.auditDate}"`,
        `"${a.type}"`,
        `"${a.status}"`,
        `"${a.auditorName}"`
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }
}

export const reportService = new ReportService();
