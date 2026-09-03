import React, { useState } from 'react';
import {
  FileText,
  Building2,
  Download,
  Printer,
  XCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ExecutiveReportData } from '../../domain/models/AuditReport';
import { storageService } from '../../services/storageService';
import { reportService } from '../../services/reportService';
import { generateAuditPdfUseCase } from '../../application/reporting/GenerateAuditPdfUseCase';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIpsId?: string;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  defaultIpsId = 'ips-001'
}) => {
  const ipsList = storageService.getIPS();
  const [selectedIpsId, setSelectedIpsId] = useState<string>(defaultIpsId);
  const [period, setPeriod] = useState<string>('Tercer Trimestre 2026');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentIps = ipsList.find(i => i.id === selectedIpsId) || ipsList[0] || {
    id: 'ips-001',
    name: 'Clínica Bonadona'
  };

  const sessions = storageService.getAuditSessions();
  const executiveData: ExecutiveReportData = generateAuditPdfUseCase.buildExecutiveReportData(
    currentIps.name,
    currentIps.id,
    sessions,
    period,
    'Dra. Patricia Charry'
  );

  const htmlPreview = generateAuditPdfUseCase.renderExecutiveReportHTML(executiveData);

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const reportRecord = await reportService.generateExecutiveReportRecord(
        currentIps.name,
        currentIps.id,
        period,
        'Dra. Patricia Charry'
      );
      const blob = await generateAuditPdfUseCase.exportPdfBlob(htmlPreview, reportRecord.fileName);
      generateAuditPdfUseCase.triggerFileDownload(blob, reportRecord.fileName);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    generateAuditPdfUseCase.openPrintPreview(htmlPreview);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  GENERADOR DE INFORME EJECUTIVO GERENCIAL
                </h2>
                <span className="text-2xs bg-amber-900/80 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-700">
                  Nivel Directivo
                </span>
                <span className="text-2xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                  ENTORNO DE DEMOSTRACIÓN
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Consolidación de indicadores, tendencias asistenciales y matriz comparativa multi-IPS.
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

        {/* Controls Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Seleccionar IPS:
              </label>
              <select
                value={selectedIpsId}
                onChange={(e) => setSelectedIpsId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-hidden"
              >
                {ipsList.map(ips => (
                  <option key={ips.id} value={ips.id}>{ips.name} ({ips.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Período Auditado:
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar Informe Ejecutivo PDF'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body: HTML Preview Frame */}
        <div className="flex-1 overflow-hidden p-4 bg-slate-100/70">
          <div className="h-full bg-white rounded-xl shadow-inner border border-slate-300 overflow-hidden">
            <iframe
              srcDoc={htmlPreview}
              title="Vista Previa Informe Ejecutivo"
              className="w-full h-full border-0"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
