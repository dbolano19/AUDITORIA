import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { IPSComparisonResult, IPSComparativeProfile } from '../../domain/models/IPSComparison';

interface IPSComparisonProps {
  comparison: IPSComparisonResult;
  onSelectIPS?: (ipsId: string) => void;
}

export const IPSComparison: React.FC<IPSComparisonProps> = ({
  comparison,
  onSelectIPS
}) => {
  const [activeMatrixTab, setActiveMatrixTab] = useState<'category' | 'service'>('category');
  const [matrixSortBy, setMatrixSortBy] = useState<'total' | 'bonadona' | 'misericordia' | 'costa'>('total');

  const { profiles, categoryMatrix, serviceMatrix, comparabilitySafeguards } = comparison;

  return (
    <div className="space-y-6">
      
      {/* Sample Size Warning Banner (Rule 16: Regla de Comparabilidad) */}
      {comparabilitySafeguards.hasInsufficientSampleWarning && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold uppercase tracking-wider">Aviso de Regla de Comparabilidad Estadística</h4>
            <p>{comparabilitySafeguards.notice}</p>
            <p className="text-[11px] text-amber-700 italic">
              Para evitar sesgos interpretativos, se calculan tasas normalizadas por cada 100 auditorías en lugar de porcentajes directos no ponderados.
            </p>
          </div>
        </div>
      )}

      {/* 3-IPS Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { key: 'bonadona', data: profiles.bonadona, color: 'border-cyan-600' },
          { key: 'misericordia', data: profiles.misericordia, color: 'border-indigo-600' },
          { key: 'costa', data: profiles.costa, color: 'border-emerald-600' }
        ].map(({ key, data, color }) => (
          <div
            key={key}
            className={`bg-white rounded-2xl border-2 ${color} p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {data.ipsCode}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 tracking-tight">
                    {data.ipsName}
                  </h3>
                  <p className="text-xs text-slate-500">{data.city} • Red FOMAG</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  data.trafficLightState === 'FAVORABLE' ? 'bg-emerald-100 text-emerald-800' :
                  data.trafficLightState === 'SITUACIONES_PRIORITARIAS' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {data.trafficLightState}
                </span>
              </div>

              {/* Volume & Rates */}
              <div className="grid grid-cols-2 gap-2.5 py-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Auditorías</span>
                  <span className="text-base font-bold text-slate-900">{data.totalAudits}</span>
                  <span className="text-[10px] text-slate-400 block">{data.auditedPatients} pacientes</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Hallazgos Totales</span>
                  <span className="text-base font-bold text-cyan-800">{data.totalFindings}</span>
                  <span className="text-[10px] text-rose-600 block font-semibold">{data.priorityFindings} prioritarios</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Tasa Hallazgos/100</span>
                  <span className="text-base font-bold text-slate-900">{data.rateFindingsPer100Audits}%</span>
                  <span className="text-[10px] text-slate-400 block">Normalizado</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Cierre Acciones 24h</span>
                  <span className="text-base font-bold text-emerald-700">{data.actionComplianceRateText}</span>
                  <span className="text-[10px] text-slate-400 block">{data.openActions} abiertas</span>
                </div>
              </div>

              {/* Stays and Top Category */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Estancia Media:</span>
                  <strong className="text-slate-900">{data.averageStayDays} días</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Acciones Vencidas:</span>
                  <strong className={data.overdueActions > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                    {data.overdueActions}
                  </strong>
                </div>
              </div>

              {data.sampleWarningText && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2 italic">
                  ⚠️ {data.sampleWarningText}
                </p>
              )}
            </div>

            {onSelectIPS && (
              <button
                onClick={() => onSelectIPS(data.ipsId)}
                className="w-full flex items-center justify-center gap-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                <span>Filtrar sólo {data.ipsName}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Cross Comparative Matrices (IPS x Category & IPS x Service) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 md:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-700" />
              <span>Matriz Comparativa Cruzada entre IPS</span>
            </h3>
            <p className="text-xs text-slate-500">
              Datos consolidados a partir de auditorías concurrentes en entorno de demostración.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMatrixTab('category')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeMatrixTab === 'category'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Matriz IPS × Categoría
            </button>
            <button
              onClick={() => setActiveMatrixTab('service')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeMatrixTab === 'service'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Matriz IPS × Servicio
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          {activeMatrixTab === 'category' ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Categoría Asistencial</th>
                  <th className="p-3.5 text-center">Bonadona (Cant. / Tasa x100)</th>
                  <th className="p-3.5 text-center">Misericordia (Cant. / Tasa x100)</th>
                  <th className="p-3.5 text-center">Clínica Costa (Cant. / Tasa x100)</th>
                  <th className="p-3.5 text-center font-black">Total Red</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categoryMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-800">{row.category}</td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-slate-900">{row.bonadonaCount}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">({row.bonadonaRate}%)</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-slate-900">{row.misericordiaCount}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">({row.misericordiaRate}%)</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-slate-900">{row.costaCount}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">({row.costaRate}%)</span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-cyan-900 bg-slate-50/50">
                      {row.totalNetwork}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Servicio Hospitalario</th>
                  <th className="p-3.5 text-center">Bonadona (Hallazgos / Priorit.)</th>
                  <th className="p-3.5 text-center">Misericordia (Hallazgos / Priorit.)</th>
                  <th className="p-3.5 text-center">Clínica Costa (Hallazgos / Priorit.)</th>
                  <th className="p-3.5 text-center font-black">Total Hallazgos Red</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {serviceMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-800">{row.service}</td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-slate-900">{row.bonadonaFindings}</span>
                      <span className="text-[11px] text-rose-600 block">({row.bonadonaPriority} crít.)</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-slate-900">{row.misericordiaFindings}</span>
                      <span className="text-[11px] text-rose-600 block">({row.misericordiaPriority} crít.)</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-slate-900">{row.costaFindings}</span>
                      <span className="text-[11px] text-rose-600 block">({row.costaPriority} crít.)</span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-cyan-900 bg-slate-50/50">
                      {row.totalFindings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
