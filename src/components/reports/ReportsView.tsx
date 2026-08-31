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
  Eye
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { reportService } from '../../services/reportService';
import { Audit, Patient, IPS, User } from '../../types';

interface ReportsViewProps {
  onOpenExpediente: (auditId: string) => void;
  activeUser: User;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onOpenExpediente,
  activeUser
}) => {
  const audits = storageService.getAudits();
  const patients = storageService.getPatients();
  const ipsList = storageService.getIPS();

  const [selectedAuditForPreview, setSelectedAuditForPreview] = useState<Audit | null>(audits[0] || null);
  const [filterIPS, setFilterIPS] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentPatient = selectedAuditForPreview ? patients.find(p => p.id === selectedAuditForPreview.patientId) : null;
  const currentIPS = selectedAuditForPreview ? ipsList.find(i => i.id === selectedAuditForPreview.ipsId) : null;

  // Render HTML preview
  const reportHTML = selectedAuditForPreview && currentPatient
    ? reportService.renderFullAuditReportHTML(
        reportService.prepareFullAuditReportData(selectedAuditForPreview, currentPatient, currentIPS || undefined)
      )
    : '';

  const handlePrint = () => {
    if (!reportHTML) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  };

  const handleExportCSV = () => {
    const csvContent = reportService.exportAuditsCSV(audits, patients, ipsList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `informe_auditorias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAudits = audits.filter(a => {
    const p = patients.find(pat => pat.id === a.patientId);
    const matchesSearch =
      a.auditCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p && p.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIPS = filterIPS === 'all' || a.ipsId === filterIPS;
    return matchesSearch && matchesIPS;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Centro de Informes y Notas de Auditoría Concurrente
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Generación y exportación oficial en PDF y CSV de notas de auditoría clínica según estándar de 18 secciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV Consolidado</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!selectedAuditForPreview}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of Audits (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Seleccionar Expediente Clínico
            </h2>

            {/* Filter Bar */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Buscar por paciente o código..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
              />

              <select
                value={filterIPS}
                onChange={e => setFilterIPS(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
              >
                <option value="all">Todas las IPS</option>
                {ipsList.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            {/* Audit Cards List */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredAudits.map(a => {
                const pat = patients.find(p => p.id === a.patientId);
                const ips = ipsList.find(i => i.id === a.ipsId);
                const isSelected = selectedAuditForPreview?.id === a.id;

                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAuditForPreview(a)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-50/50 shadow-2xs font-medium'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-800">{a.auditCode}</span>
                      <span className="text-[10px] text-slate-500">{a.auditDate}</span>
                    </div>
                    <div className="font-semibold text-slate-900 mt-1">{pat?.fullName}</div>
                    <div className="text-[11px] text-slate-500">{ips?.name} · {pat?.service}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: PDF Preview Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-700" />
                <h3 className="font-bold text-sm text-slate-900">
                  Vista Previa del Informe Oficial (18 Secciones)
                </h3>
              </div>

              {selectedAuditForPreview && (
                <button
                  onClick={() => onOpenExpediente(selectedAuditForPreview.id)}
                  className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold underline cursor-pointer"
                >
                  Editar Datos en Expediente
                </button>
              )}
            </div>

            <div className="mt-3">
              {reportHTML ? (
                <iframe
                  srcDoc={reportHTML}
                  title="Informe de auditoría concurrente"
                  className="w-full h-[650px] bg-white rounded-lg border border-slate-300"
                />
              ) : (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Seleccione una auditoría para generar la vista previa.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
