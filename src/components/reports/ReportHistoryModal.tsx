import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  FileText,
  Download,
  Printer,
  Calendar,
  User,
  PlusCircle,
  XCircle,
  Copy,
  Check,
  FileCheck2,
  Tag
} from 'lucide-react';
import { GeneratedAuditReport } from '../../domain/models/AuditReport';
import { storageService } from '../../services/storageService';
import { reportService } from '../../services/reportService';
import { generateAuditPdfUseCase } from '../../application/reporting/GenerateAuditPdfUseCase';

interface ReportHistoryModalProps {
  report: GeneratedAuditReport;
  isOpen: boolean;
  onClose: () => void;
  onVersionCreated?: (updatedReport: GeneratedAuditReport) => void;
}

export const ReportHistoryModal: React.FC<ReportHistoryModalProps> = ({
  report,
  isOpen,
  onClose,
  onVersionCreated
}) => {
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState<boolean>(false);
  const [newVersionSummary, setNewVersionSummary] = useState<string>('');
  const [currentReport, setCurrentReport] = useState<GeneratedAuditReport>(report);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(currentReport.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCreateNewVersion = async () => {
    if (!newVersionSummary.trim()) {
      alert('Por favor describa el motivo o cambios de la nueva versión.');
      return;
    }

    const updated = await reportService.createNewReportVersion(
      currentReport.id,
      newVersionSummary,
      'Dra. Patricia Charry',
      'Médico Auditor Concurrente',
      currentReport.detailedData
    );

    if (updated) {
      setCurrentReport(updated);
      setIsCreatingVersion(false);
      setNewVersionSummary('');
      if (onVersionCreated) onVersionCreated(updated);
    }
  };

  const handleDownloadPdf = async () => {
    if (currentReport.detailedData) {
      const html = generateAuditPdfUseCase.renderDetailedReportHTML(currentReport.detailedData);
      const blob = await generateAuditPdfUseCase.exportPdfBlob(html, currentReport.fileName);
      generateAuditPdfUseCase.triggerFileDownload(blob, currentReport.fileName);
    } else if (currentReport.executiveData) {
      const html = generateAuditPdfUseCase.renderExecutiveReportHTML(currentReport.executiveData);
      const blob = await generateAuditPdfUseCase.exportPdfBlob(html, currentReport.fileName);
      generateAuditPdfUseCase.triggerFileDownload(blob, currentReport.fileName);
    }
  };

  const handlePrint = () => {
    if (currentReport.detailedData) {
      const html = generateAuditPdfUseCase.renderDetailedReportHTML(currentReport.detailedData);
      generateAuditPdfUseCase.openPrintPreview(html);
    } else if (currentReport.executiveData) {
      const html = generateAuditPdfUseCase.renderExecutiveReportHTML(currentReport.executiveData);
      generateAuditPdfUseCase.openPrintPreview(html);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  CONTROL DE VERSIONES E INTEGRIDAD — {currentReport.reportCode}
                </h2>
                <span className="text-2xs bg-cyan-900 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-700">
                  Versión {currentReport.version}.0
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {currentReport.ipsName} · {currentReport.fileName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Integrity Hash Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Firma Criptográfica de Integridad (SHA-256)</span>
              </div>
              <span className="text-2xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Verificado Oficial
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-cyan-900 break-all select-all">
                {currentReport.hash}
              </code>
              <button
                onClick={handleCopyHash}
                className="shrink-0 p-2 text-slate-500 hover:text-cyan-700 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer"
                title="Copiar Hash"
              >
                {copiedHash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-2xs text-slate-500 mt-2">
              Este código garantiza que el informe no ha sufrido modificaciones no autorizadas tras su emisión por el auditor.
            </p>
          </div>

          {/* Version Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-700" />
                <span>Historial de Versiones Emitidas ({currentReport.versionChanges?.length || 1})</span>
              </h3>

              <button
                onClick={() => setIsCreatingVersion(!isCreatingVersion)}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Generar Nueva Versión (v{currentReport.version + 1}.0)</span>
              </button>
            </div>

            {/* Create Version Form */}
            {isCreatingVersion && (
              <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="text-xs font-bold text-cyan-950">
                  Emitir Versión {currentReport.version + 1}.0
                </div>
                <textarea
                  value={newVersionSummary}
                  onChange={(e) => setNewVersionSummary(e.target.value)}
                  rows={2}
                  placeholder="Describa el motivo de la nueva versión (ej. Adición de soporte de paraclínicos o reevaluación de hallazgo)..."
                  className="w-full text-xs p-2.5 bg-white border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreatingVersion(false)}
                    className="px-3 py-1.5 bg-white text-slate-600 rounded-lg text-xs font-medium border border-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateNewVersion}
                    className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Guardar e Incrementar Versión
                  </button>
                </div>
              </div>
            )}

            {/* Version List */}
            <div className="space-y-3">
              {(currentReport.versionChanges || []).map((v, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded-md">
                        Versión {v.version}.0
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {v.user} ({v.role})
                      </span>
                    </div>
                    <span className="text-2xs text-slate-500">
                      {new Date(v.timestamp).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {v.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Formato oficial: <code className="text-2xs font-mono font-bold text-slate-800">{currentReport.fileName}</code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Vista de Impresión</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
