/**
 * COMPONENT: MultiIPSComparisonView (FASE 5)
 * Comparative hospital audit dashboard across FOMAG network provider IPS in Barranquilla:
 * Clínica Bonadona, Clínica Misericordia, Clínica Costa.
 */

import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { IPSAggregatedMetrics } from '../../types';
import {
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Layers
} from 'lucide-react';

export const MultiIPSComparisonView: React.FC = () => {
  const [metrics, setMetrics] = useState<IPSAggregatedMetrics[]>(() =>
    storageService.getMultiIPSAggregatedMetrics()
  );

  return (
    <div id="multi-ips-comparison-view" className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Red Hospitalaria FOMAG — Barranquilla (Atlántico)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Tablero Comparativo y Desempeño Concurrente por IPS
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Monitoreo analítico de estancias, hallazgos críticos, oportunidades de atención y cumplimiento de planes de acción en la red prestadora.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
              3 IPS Activas en Auditoría
            </span>
          </div>
        </div>
      </div>

      {/* IPS Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((ips) => (
          <div
            key={ips.ipsId}
            id={`ips-card-${ips.ipsId}`}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {ips.ipsId.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{ips.ipsName}</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Nivel III
                </span>
              </div>

              {/* Core Indicators */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Estancia Promedio</span>
                  <strong className={`text-xl font-black ${
                    ips.averageStayDays > 6.5 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {ips.averageStayDays} días
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Cumplimiento Planes 24h</span>
                  <strong className={`text-xl font-black ${
                    ips.actionPlanComplianceRate >= 85 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {ips.actionPlanComplianceRate}%
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Hallazgos Críticos</span>
                  <strong className="text-xl font-black text-rose-600">
                    {ips.criticalFindings}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">de {ips.totalFindings} totales</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Pacientes Auditados</span>
                  <strong className="text-xl font-black text-slate-900">
                    {ips.activePatients}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">{ips.totalAudits} auditorías</span>
                </div>
              </div>

              {/* Recurring Issues */}
              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-slate-700 block">
                  Principales Motivos de Auditoría:
                </span>
                {ips.topRecurringFindings.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-700">{rec.category}</span>
                    <span className="font-bold text-slate-900">{rec.count} casos</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Tasa Inconsistencias: <strong>{ips.documentaryIssuesRate}%</strong></span>
              <span className="text-indigo-600 font-bold hover:underline cursor-pointer">
                Ver Censo IPS →
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
