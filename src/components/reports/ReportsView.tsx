import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Search,
  Building2,
  Calendar,
  FileCheck2,
  FileSpreadsheet,
  Eye,
  ShieldCheck,
  TrendingUp,
  History,
  CheckCircle2,
  Lock,
  UserCheck,
  Layers,
  Sparkles
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { reportService } from '../../services/reportService';
import { generateAuditPdfUseCase } from '../../application/reporting/GenerateAuditPdfUseCase';
import { Audit, Patient, IPS, User, GeneratedAuditReport, AuditSession } from '../../types';
import { AuditorValidationModal } from './AuditorValidationModal';
import { ReportHistoryModal } from './ReportHistoryModal';
import { ExecutiveReportModal } from './ExecutiveReportModal';
import { ReportTestSuiteRunner } from './ReportTestSuiteRunner';

interface ReportsViewProps {
  onOpenExpediente: (auditId: string) => void;
  activeUser: User;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onOpenExpediente,
  activeUser
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILED' | 'EXECUTIVE' | 'HISTORY' | 'TESTS'>('DETAILED');
  const audits = storageService.getAudits();
  const patients = storageService.getPatients();
  const ipsList = storageService.getIPS();
  const sessions = storageService.getAuditSessions();
  const [reportsList, setReportsList] = useState<GeneratedAuditReport[]>(storageService.getGeneratedReports());

  // Detailed preview selection
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || 'AUD-000145');
  const [filterIPS, setFilterIPS] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isValidatingModalOpen, setIsValidatingModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isExecutiveModalOpen, setIsExecutiveModalOpen] = useState<boolean>(false);
  const [selectedReportForHistory, setSelectedReportForHistory] = useState<GeneratedAuditReport | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];
  const currentIps = currentSession ? ipsList.find(i => i.id === currentSession.ipsId) : null;
  const currentPatient = currentSession ? patients.find(p => p.id === currentSession.patientId) : null;

  // Build real detailed data for current session
  const detailedReportData = currentSession
    ? generateAuditPdfUseCase.buildDetailedReportData(currentSession, {
        auditorName: activeUser.name,
        auditorRole: activeUser.role === 'Auditor' ? 'Médico Auditor Concurrente' : activeUser.role
      })
    : null;

  const reportHTML = detailedReportData
    ? generateAuditPdfUseCase.renderDetailedReportHTML(detailedReportData, detailedReportData.status === 'BORRADOR')
    : '';

  const pendingFindingsCount = currentSession?.findings.filter(f => f.auditorValidation.status === 'PENDIENTE').length || 0;

  const handlePrint = () => {
    if (!reportHTML) return;
    generateAuditPdfUseCase.openPrintPreview(reportHTML);
  };

  const handleDownloadPdf = async () => {
    if (!currentSession || !detailedReportData) return;
    setIsExportingPdf(true);
    try {
      const generatedReport = await reportService.generateDetailedReportRecord(currentSession, {
        status: currentSession.status === 'Validada y Firmada' ? 'FINAL' : 'BORRADOR',
        auditorName: activeUser.name,
        auditorRole: activeUser.role
      });
      setReportsList(storageService.getGeneratedReports());

      const blob = await generateAuditPdfUseCase.exportPdfBlob(reportHTML, generatedReport.fileName);
      generateAuditPdfUseCase.triggerFileDownload(blob, generatedReport.fileName);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = reportService.exportAuditsCSV(audits, patients, ipsList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `informe_auditorias_FOMAG_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenHistoryForReport = (report: GeneratedAuditReport) => {
    setSelectedReportForHistory(report);
    setIsHistoryModalOpen(true);
  };

  const filteredSessions = sessions.filter(s => {
    const p = patients.find(pat => pat.id === s.patientId);
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p && p.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.docNumber.includes(searchTerm);
    const matchesIPS = filterIPS === 'all' || s.ipsId === filterIPS;
    return matchesSearch && matchesIPS;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center border border-cyan-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Generador Profesional de Informes de Auditoría (Fase 6)
                </h1>
                <span className="text-2xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  PDF Oficial & SHA-256
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Emisión de informes detallados (18 secciones), informes ejecutivos consolidados y validación humana vinculante.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExecutiveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 cursor-pointer transition-colors shadow-2xs"
          >
            <TrendingUp className="w-4 h-4 text-amber-700" />
            <span>Informe Ejecutivo</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV Global</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('DETAILED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'DETAILED'
              ? 'bg-cyan-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Informes Detallados por Expediente</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-cyan-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial de Versiones e Integridad ({reportsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TESTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'TESTS'
              ? 'bg-cyan-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>Banco de Pruebas (20 Casos)</span>
        </button>
      </div>

      {/* TAB 1: DETAILED REPORTS */}
      {activeTab === 'DETAILED' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Expediente Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Expedientes Disponibles
                </h2>
                <span className="text-2xs font-semibold text-slate-500">
                  {filteredSessions.length} auditorías
                </span>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por código o documento..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <select
                  value={filterIPS}
                  onChange={e => setFilterIPS(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="all">Todas las IPS de Barranquilla</option>
                  {ipsList.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.city})</option>
                  ))}
                </select>
              </div>

              {/* Session Cards */}
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {filteredSessions.map(s => {
                  const pat = patients.find(p => p.id === s.patientId);
                  const isSelected = selectedSessionId === s.id;
                  const isConfirmed = s.status === 'Validada y Firmada' || s.status === 'Cerrada';

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSessionId(s.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-50/70 shadow-sm ring-1 ring-cyan-500 font-medium'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-cyan-900 bg-cyan-100/80 px-2 py-0.5 rounded text-2xs">
                          {s.id}
                        </span>
                        <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${
                          isConfirmed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {isConfirmed ? 'FINAL' : 'BORRADOR'}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-1">{pat?.fullName || `Paciente CC ${s.docNumber}`}</div>
                      <div className="text-2xs text-slate-600 mt-0.5">{s.ipsName} · Estancia: {s.clinicalContext.lengthOfStay}d</div>
                      
                      <div className="flex items-center justify-between text-2xs text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                        <span>{s.findings.length} hallazgos</span>
                        <span>{s.clinicalContext.totalHcPages} pág. HC</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: PDF Preview Canvas & Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 overflow-hidden">
              
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-cyan-700" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Vista Previa Oficial (18 Secciones) — {currentSession?.id}
                    </h3>
                  </div>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    Archivo: <code className="font-mono text-slate-700">{generateAuditPdfUseCase.generateStandardFileName(currentSession?.ipsName || 'IPS', currentSession?.id || 'AUD', currentSession?.auditDate || '2026-09-01')}</code>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentSession && (
                    <button
                      onClick={() => setIsValidatingModalOpen(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                        pendingFindingsCount > 0
                          ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      title="Abrir validación humana vinculante de hallazgos"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Validación Auditor {pendingFindingsCount > 0 ? `(${pendingFindingsCount} pend.)` : '(Listo)'}</span>
                    </button>
                  )}

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Imprimir</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingPdf ? 'Exportando...' : 'Descargar PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 mt-3 text-2xs text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Certificación de Seguridad:</strong> Este documento cuenta con firma criptográfica de integridad y trazabilidad a las páginas exactas del expediente digital.
                </span>
              </div>

              {/* Iframe Preview */}
              <div className="mt-4">
                {reportHTML ? (
                  <iframe
                    srcDoc={reportHTML}
                    title="Informe de auditoría concurrente"
                    className="w-full h-[650px] bg-white rounded-xl border border-slate-300 shadow-inner"
                  />
                ) : (
                  <div className="p-16 text-center text-slate-400 text-sm">
                    Seleccione una auditoría para renderizar el informe de 18 secciones.
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: VERSION HISTORY & INTEGRITY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Registro Histórico de Informes Emitidos e Integridad SHA-256
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trazabilidad inmutable de versiones (v1, v2, etc.), firmas electrónicas y bitácora de modificaciones.
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-200">
              Total Informes: {reportsList.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-2xs border-b border-slate-200">
                  <th className="p-3">Código Informe</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">IPS Auditada</th>
                  <th className="p-3">Versión</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Hash SHA-256</th>
                  <th className="p-3">Generado Por</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportsList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-900">
                      {r.reportCode}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">
                        {r.type === 'INFORME_DETALLADO' ? 'Detallado (18 Sec)' : 'Ejecutivo Consolidado'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      {r.ipsName}
                    </td>
                    <td className="p-3">
                      <span className="bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full text-2xs">
                        v{r.version}.0
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${
                        r.status === 'FINAL' || r.status === 'CERRADO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <code className="font-mono text-2xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {r.hash.substring(0, 16)}...
                      </code>
                    </td>
                    <td className="p-3 text-slate-600">
                      {r.generatedBy}<br />
                      <small className="text-2xs text-slate-400">{new Date(r.generatedAt).toLocaleDateString('es-CO')}</small>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenHistoryForReport(r)}
                        className="px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg font-bold border border-cyan-200 cursor-pointer"
                      >
                        Ver Historial & Hash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED TEST SUITE (FASE 6) */}
      {activeTab === 'TESTS' && (
        <ReportTestSuiteRunner />
      )}

      {/* MODAL: Auditor Final Validation */}
      {currentSession && (
        <AuditorValidationModal
          session={currentSession}
          isOpen={isValidatingModalOpen}
          onClose={() => setIsValidatingModalOpen(false)}
          onValidationComplete={(updatedSession) => {
            setSelectedSessionId(updatedSession.id);
          }}
          activeUserName={activeUser.name}
          activeUserRole={activeUser.role}
        />
      )}

      {/* MODAL: Report History & Versioning */}
      {selectedReportForHistory && (
        <ReportHistoryModal
          report={selectedReportForHistory}
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          onVersionCreated={(updatedReport) => {
            setReportsList(storageService.getGeneratedReports());
          }}
        />
      )}

      {/* MODAL: Executive Report Generator */}
      <ExecutiveReportModal
        isOpen={isExecutiveModalOpen}
        onClose={() => setIsExecutiveModalOpen(false)}
        defaultIpsId={currentSession?.ipsId || 'ips-001'}
      />

    </div>
  );
};
