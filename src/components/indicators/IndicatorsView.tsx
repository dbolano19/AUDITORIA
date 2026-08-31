import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  PieChart,
  Activity,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Clock,
  FlaskConical,
  ShieldAlert
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export const IndicatorsView: React.FC = () => {
  const ipsList = storageService.getIPS();
  const [selectedIPS, setSelectedIPS] = useState<string>('all');

  const comparative = storageService.getIPSComparativeMatrix();
  const audits = storageService.getAudits();
  const findings = storageService.getFindings();
  const actions = storageService.getActions();
  const patients = storageService.getPatients();

  // Filtered dataset
  const filteredAudits = selectedIPS === 'all' ? audits : audits.filter(a => a.ipsId === selectedIPS);
  const filteredFindings = selectedIPS === 'all' ? findings : findings.filter(f => f.ipsId === selectedIPS);
  const filteredActions = selectedIPS === 'all' ? actions : actions.filter(a => a.ipsId === selectedIPS);
  const filteredPatients = selectedIPS === 'all' ? patients : patients.filter(p => p.ipsId === selectedIPS);

  // Computed Indicators
  const totalFindings = filteredFindings.length || 1;
  const criticalFindings = filteredFindings.filter(f => f.priority === 'Crítica' || f.priority === 'Crítico').length;
  const highFindings = filteredFindings.filter(f => f.priority === 'Alta' || f.priority === 'Alto').length;

  const totalActions = filteredActions.length || 1;
  const completedActions = filteredActions.filter(a => a.status === 'Cumplida' || a.status === 'Cumplido').length;
  const actionComplianceRate = Math.round((completedActions / totalActions) * 100);

  const prolongedRiskPatients = filteredPatients.filter(p => {
    const days = storageService.calculateStayDays(p.admissionDate);
    return days > 7;
  }).length;
  const prolongedStayRate = Math.round((prolongedRiskPatients / (filteredPatients.length || 1)) * 100);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Indicadores de Calidad y Oportunidad Asistencial
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Tablero analítico para comités de auditoría médica, oportunidad diagnóstica y pertinencia de estancia.
          </p>
        </div>

        {/* Filter by IPS */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Filtrar por IPS:</label>
          <select
            value={selectedIPS}
            onChange={e => setSelectedIPS(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
          >
            <option value="all">Todas las IPS (Barranquilla)</option>
            {ipsList.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPI Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Gauge 1: Cumplimiento de Acciones */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase">Cumplimiento de Acciones</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{actionComplianceRate}%</span>
            <span className="text-xs text-slate-500 font-medium">({completedActions} de {filteredActions.length})</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${actionComplianceRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Compromisos asistenciales y de gestión resueltos a tiempo.</p>
        </div>

        {/* Gauge 2: Tasa de Riesgo Estancia Prolongada */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase">Riesgo Estancia Prolongada</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-700">{prolongedStayRate}%</span>
            <span className="text-xs text-slate-500 font-medium">({prolongedRiskPatients} pacientes &gt;7 días)</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, prolongedStayRate * 1.5)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Pacientes con riesgo de estancia evitable o barreras de egreso.</p>
        </div>

        {/* Gauge 3: Concentración de Hallazgos Críticos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase">Severidad Crítica / Alta</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-700">
              {Math.round(((criticalFindings + highFindings) / totalFindings) * 100)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">({criticalFindings + highFindings} de {filteredFindings.length})</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(((criticalFindings + highFindings) / totalFindings) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Hallazgos que requieren intervención prioritaria inmediata.</p>
        </div>

      </div>

      {/* Breakdown by Finding Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Distribución por Tipo de Hallazgo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-700" />
            <span>Distribución de Hallazgos por Tipo</span>
          </h2>

          <div className="space-y-3">
            {[
              { label: 'Oportunidad diagnóstica e interconsultas', count: filteredFindings.filter(f => f.category === 'Oportunidad' || f.type === 'Oportunidad').length, color: 'bg-cyan-600' },
              { label: 'Pertinencia médica y de estancia', count: filteredFindings.filter(f => f.category === 'Pertinencia' || f.type === 'Pertinencia').length, color: 'bg-indigo-600' },
              { label: 'Seguridad del paciente / IAAS', count: filteredFindings.filter(f => f.category === 'Seguridad del paciente' || f.category === 'Seguridad' || f.type === 'Seguridad').length, color: 'bg-rose-600' },
              { label: 'Calidad del registro clínico', count: filteredFindings.filter(f => f.category === 'Calidad asistencial' || f.category === 'Calidad del registro' || f.type === 'Calidad del registro').length, color: 'bg-teal-600' },
              { label: 'Administrativos y autorizaciones', count: filteredFindings.filter(f => f.category === 'Administrativo' || f.type === 'Administrativo').length, color: 'bg-amber-600' },
              { label: 'Financiero y glosas potenciales', count: filteredFindings.filter(f => f.category === 'Costos' || f.category === 'Financiero' || f.type === 'Financiero').length, color: 'bg-purple-600' },
            ].map((item, idx) => {
              const pct = Math.round((item.count / totalFindings) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-bold">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Comparativo de Tasa por IPS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-700" />
            <span>Resumen Comparativo por Sede Hospitalaria</span>
          </h2>

          <div className="space-y-3">
            {comparative.map(c => (
              <div key={c.ipsId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{c.ipsName}</span>
                  <span className="text-cyan-800">{c.auditedPatients} Pacientes</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200">
                  <div>
                    <span className="block font-bold text-slate-800">{c.totalFindings}</span>
                    <span className="text-[10px] text-slate-500">Hallazgos</span>
                  </div>
                  <div>
                    <span className="block font-bold text-rose-700">{c.criticalFindings}</span>
                    <span className="text-[10px] text-rose-700 font-semibold">Críticos</span>
                  </div>
                  <div>
                    <span className={`block font-bold ${c.overdueActions > 0 ? 'text-amber-700' : 'text-slate-800'}`}>{c.overdueActions}</span>
                    <span className="text-[10px] text-slate-500">Acc. Vencidas</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
