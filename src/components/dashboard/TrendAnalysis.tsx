import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Clock,
  Activity,
  Layers,
  Building2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { TrendAnalysisResult, TimeSeriesPoint, RecurrencePatternItem } from '../../domain/models/TrendAnalysis';

interface TrendAnalysisProps {
  trendData: TrendAnalysisResult;
  onSelectPeriodGrouping?: (grouping: 'day' | 'week' | 'month' | 'quarter') => void;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  trendData,
  onSelectPeriodGrouping
}) => {
  const [selectedPatternType, setSelectedPatternType] = useState<string>('all');
  const { granularity, timeSeries, trends, recurrencePatterns, observedPatternsSummary } = trendData;

  const filteredRecurrences = recurrencePatterns.filter(r => {
    if (selectedPatternType === 'all') return true;
    return r.observedPatternType === selectedPatternType;
  });

  const getTrendIcon = (direction: string) => {
    if (direction === 'AUMENTO') return <TrendingUp className="w-4 h-4 text-rose-600" />;
    if (direction === 'DISMINUCION') return <TrendingDown className="w-4 h-4 text-emerald-600" />;
    if (direction === 'ESTABLE') return <Minus className="w-4 h-4 text-amber-600" />;
    return <AlertCircle className="w-4 h-4 text-slate-400" />;
  };

  const getTrendBadge = (direction: string, label: string) => {
    let style = 'bg-slate-100 text-slate-700 border-slate-300';
    if (direction === 'AUMENTO') style = 'bg-rose-100 text-rose-800 border-rose-300';
    if (direction === 'DISMINUCION') style = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (direction === 'ESTABLE') style = 'bg-amber-100 text-amber-800 border-amber-300';

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}`}>
        {getTrendIcon(direction)}
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Period Selector & Trend Direction Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-700" />
              <span>Análisis de Tendencias Temporales</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluación rigurosa de trayectoria por cortes temporales (sin denominar 'tendencia' a variaciones aisladas).
            </p>
          </div>

          {onSelectPeriodGrouping && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              {(['day', 'week', 'month', 'quarter'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => onSelectPeriodGrouping(g)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    granularity === g ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g === 'day' ? 'Día' : g === 'week' ? 'Semana' : g === 'month' ? 'Mes' : 'Trimestre'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4 Metric Slope Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { item: trends.findingsTrend, name: 'Hallazgos Totales', current: trends.findingsTrend.currentValue, unit: 'hallazgos' },
            { item: trends.priorityFindingsTrend, name: 'Hallazgos Críticos/Altos', current: trends.priorityFindingsTrend.currentValue, unit: 'prioritarios' },
            { item: trends.openActionsTrend, name: 'Acciones 24h Abiertas', current: trends.openActionsTrend.currentValue, unit: 'compromisos' },
            { item: trends.stayTrend, name: 'Estancia Promedio', current: trends.stayTrend.currentValue, unit: 'días estancia' }
          ].map((t, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">{t.name}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{t.current}</span>
                <span className="text-[11px] text-slate-400 font-medium">{t.unit}</span>
              </div>
              <div>
                {getTrendBadge(t.item.direction, t.item.directionLabel)}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight pt-1 border-t border-slate-200">
                {t.item.confidenceNote}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Time Series Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-700" />
            <span>Histórico Temporal de Indicadores ({granularity.toUpperCase()})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Período</th>
                <th className="p-3.5 text-center">Auditorías Realizadas</th>
                <th className="p-3.5 text-center">Hallazgos Totales</th>
                <th className="p-3.5 text-center text-rose-700">Hallazgos Prioritarios</th>
                <th className="p-3.5 text-center">Acciones 24h Abiertas</th>
                <th className="p-3.5 text-center text-emerald-700">Acciones Cerradas</th>
                <th className="p-3.5 text-center">Estancia Media</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {timeSeries.map((pt, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{pt.label}</td>
                  <td className="p-3.5 text-center font-semibold">{pt.auditsCount}</td>
                  <td className="p-3.5 text-center font-bold text-cyan-900">{pt.totalFindings}</td>
                  <td className="p-3.5 text-center font-bold text-rose-700">{pt.priorityFindings}</td>
                  <td className="p-3.5 text-center text-amber-700 font-semibold">{pt.openActions}</td>
                  <td className="p-3.5 text-center text-emerald-700 font-bold">{pt.closedActions}</td>
                  <td className="p-3.5 text-center font-semibold">{pt.avgStay} d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recurrence Pattern Tree (IPS -> Service -> Category -> Type -> Period) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-700" />
              <span>Matriz de Reincidencias y Patrones Asistenciales Observados</span>
            </h3>
            <p className="text-xs text-slate-500">
              Relación jerárquica: IPS → Servicio → Categoría → Tipo de Hallazgo → Período.
            </p>
          </div>

          {/* Pattern Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedPatternType}
              onChange={(e) => setSelectedPatternType(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los patrones</option>
              <option value="DEMORA">Demoras en Oportunidad</option>
              <option value="INTERCONSULTA">Interconsultas Especializadas</option>
              <option value="RESULTADO_PENDIENTE">Resultados de Laboratorio/Paraclínicos</option>
              <option value="DOCUMENTACION">Calidad de Registro y Formatos</option>
              <option value="CONTINUIDAD">Continuidad y Tratamiento</option>
            </select>
          </div>
        </div>

        {/* Observed Patterns Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {observedPatternsSummary.map((pat, idx) => (
            <div key={idx} className="bg-indigo-50/50 border border-indigo-200 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950">{pat.patternType}</span>
                <span className="bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                  {pat.occurrences} casos
                </span>
              </div>
              <p className="text-[11px] text-indigo-800">
                <strong>Servicios:</strong> {pat.affectedServices.join(', ')}
              </p>
              <p className="text-[11px] text-indigo-700">
                <strong>IPS:</strong> {pat.affectedIPS.join(', ')}
              </p>
            </div>
          ))}
        </div>

        {/* Recurrence Tree List */}
        <div className="space-y-3">
          {filteredRecurrences.map((rec) => (
            <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 hover:bg-slate-100/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rec.associatedRuleId}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    {rec.findingType}
                  </h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  rec.status === 'Reincidente Crítico' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {rec.status} ({rec.frequency} reiteraciones)
                </span>
              </div>

              {/* Hierarchy Breadcrumb */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 font-medium">
                <span className="text-cyan-800 font-bold">{rec.ipsName}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-800 font-semibold">{rec.service}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-indigo-800 font-semibold">{rec.category}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-500">{rec.firstOccurrenceDate} al {rec.lastOccurrenceDate}</span>
              </div>

              <p className="text-xs text-slate-700 italic">
                "{rec.descriptionSnippet}"
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                <span className="font-medium text-indigo-900">
                  {rec.observedPatternExplanation}
                </span>
                <span>Acciones previas tomadas: {rec.previousActionsTaken} ({rec.unresolvedActionsCount} pendientes)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
