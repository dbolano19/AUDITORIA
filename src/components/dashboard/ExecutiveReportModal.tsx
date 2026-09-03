import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { ExecutiveReportDocument } from '../../application/dashboard/GenerateExecutiveReportUseCase';

interface ExecutiveReportModalProps {
  report: ExecutiveReportDocument;
  onClose: () => void;
  onExportCSV: () => void;
  onExportActionsCSV: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  report,
  onClose,
  onExportCSV,
  onExportActionsCSV
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'exports'>('preview');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-900/80 rounded-lg text-cyan-300 border border-cyan-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">
                  {report.reportCode}
                </span>
                <span className="text-2xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                  ENTORNO DE DEMOSTRACIÓN
                </span>
                <span className="text-xs text-slate-400">• Informe Ejecutivo de Auditoría</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                {report.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-cyan-700 text-cyan-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Vista de Documento Ejecutivo</span>
          </button>

          <button
            onClick={() => setActiveTab('exports')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'exports'
                ? 'border-cyan-700 text-cyan-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Descarga de Datos (CSV / Excel)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm bg-slate-100/50">
          
          {activeTab === 'preview' ? (
            /* Printable Formal Document Sheet */
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200 space-y-6 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
              
              {/* Mandatory Clinical Safety Banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-center text-xs font-bold text-amber-900">
                ⚠️ {report.safetyBanner}
              </div>

              {/* Institution & Title Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-800 block">
                    FOMAG — Fondo Nacional de Prestaciones Sociales del Magisterio
                  </span>
                  <h1 className="text-xl font-black text-slate-900 mt-1">
                    INFORME GERENCIAL CONSOLIDADO DE AUDITORÍA
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Red Hospitalaria de Barranquilla: Bonadona · Misericordia · Costa
                  </p>
                </div>

                <div className="text-right text-xs text-slate-600 space-y-0.5 border-l-2 sm:border-l sm:border-slate-200 sm:pl-4">
                  <p><strong className="text-slate-800">Código:</strong> {report.reportCode}</p>
                  <p><strong className="text-slate-800">Fecha:</strong> {new Date(report.generatedAt).toLocaleDateString('es-CO')}</p>
                  <p><strong className="text-slate-800">Auditor:</strong> {report.generatedBy}</p>
                  <p><strong className="text-slate-800">Período:</strong> {report.periodText}</p>
                </div>
              </div>

              {/* 1. Resumen Ejecutivo */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Resumen Ejecutivo
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {report.executiveSummary}
                </p>
              </div>

              {/* 2. Resultados Generales */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  2. Resultados y Métricas Consolidadas
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Auditorías</span>
                    <span className="text-xl font-bold text-slate-900">{report.generalResults.totalAudits}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Hallazgos Validados</span>
                    <span className="text-xl font-bold text-cyan-800">{report.generalResults.totalFindings}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Críticos / Altos</span>
                    <span className="text-xl font-bold text-rose-700">{report.generalResults.priorityFindings}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Cierre Acciones 24h</span>
                    <span className="text-xl font-bold text-emerald-700">{report.generalResults.actionClosureRate}</span>
                  </div>
                </div>
              </div>

              {/* 3. Comparativo de las 3 IPS */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  3. Comparativo de Desempeño por IPS (Barranquilla)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">IPS Auditada</th>
                        <th className="p-2.5 text-center">Auditorías</th>
                        <th className="p-2.5 text-center">Tasa Hallazgos/100</th>
                        <th className="p-2.5 text-center">Tasa Prioritarios/100</th>
                        <th className="p-2.5 text-center">Cierre Compromisos</th>
                        <th className="p-2.5 text-center">Calificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {report.ipsComparisonSummary.map((ips, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">{ips.ipsName}</td>
                          <td className="p-2.5 text-center">{ips.audits}</td>
                          <td className="p-2.5 text-center">{ips.findingsRatePer100}%</td>
                          <td className="p-2.5 text-center font-semibold text-rose-700">{ips.priorityRatePer100}%</td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">{ips.closureRate}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ips.status === 'FAVORABLE' ? 'bg-emerald-100 text-emerald-800' :
                              ips.status === 'SITUACIONES_PRIORITARIAS' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ips.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Tendencias y Reincidencias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-700" />
                    4. Análisis de Tendencias
                  </h4>
                  <p className="text-slate-700 text-justify">{report.trendsSummary}</p>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-700" />
                    5. Análisis de Reincidencias
                  </h4>
                  <p className="text-slate-700 text-justify">{report.recurrenceSummary}</p>
                </div>
              </div>

              {/* 6. Compromisos y Acciones Pendientes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  6. Compromisos Asistenciales de 24 Horas en Seguimiento
                </h3>
                {report.pendingActions.length === 0 ? (
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    No se registran acciones de 24h pendientes o vencidas en este corte.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {report.pendingActions.map((act, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-800 block">{act.description}</span>
                          <span className="text-slate-500 text-[11px]">{act.ips} • Responsable: {act.responsible}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-600">Límite: {act.deadline}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.status === 'Vencida' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {act.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 7. Oportunidades y Recomendaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    7. Oportunidades de Mejora
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {report.improvementOpportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    8. Recomendaciones Asistenciales
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {report.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Signature & Cryptographic Integrity Footer */}
              <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="w-48 border-b border-slate-400 pb-1">
                    <span className="font-serif italic font-bold text-slate-800">Dr. Alejandro Morales</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold">{report.generatedBy} — Médico Auditor Concurrente</p>
                  <p className="text-[10px] text-slate-500">Registro Médico: RM-084920-ATL / FOMAG</p>
                </div>

                <div className="text-right font-mono text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1 justify-end text-emerald-700 font-bold mb-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>INTEGRIDAD CRIPTOGRÁFICA SHA-256</span>
                  </div>
                  <span>{report.hashSHA256}</span>
                </div>
              </div>

            </div>
          ) : (
            /* Export Hub Tab */
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="text-center space-y-1">
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  Descarga Directa de Indicadores y Acciones (CSV / Excel)
                </h3>
                <p className="text-xs text-slate-500">
                  Exporte los datos tabulares filtrados para su procesamiento en hojas de cálculo o sistemas de inteligencia de negocios.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    Indicadores y Comparativo IPS
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Incluye totales de auditorías, pacientes, hallazgos, tasas normalizadas por 100 y matriz por IPS.
                  </p>
                  <button
                    onClick={onExportCSV}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Indicadores (CSV)</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-700" />
                    Planes de Acción y Compromisos 24h
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Incluye el listado de acciones asistenciales, responsables, plazos, estados y evidencias de cierre.
                  </p>
                  <button
                    onClick={onExportActionsCSV}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Acciones 24h (CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Documento gerencial oficial emitido bajo estándares de confidencialidad FOMAG
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar Informe
          </button>
        </div>

      </div>
    </div>
  );
};
