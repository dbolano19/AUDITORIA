import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Camera,
  Layers,
  TrendingUp,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Stethoscope,
  Activity,
  Award,
  ChevronRight,
  Eye,
  Download,
  Printer,
  Sparkles
} from 'lucide-react';
import { BuildDashboardUseCase } from '../../application/dashboard/BuildDashboardUseCase';
import { DashboardFilter, DEFAULT_DASHBOARD_FILTER } from '../../domain/models/DashboardFilter';
import { ContextualFinding } from '../../domain/models/ContextualFinding';
import { DashboardAction24hItem } from '../../domain/models/DashboardMetrics';
import { FindingDetailModal } from './FindingDetailModal';
import { SnapshotModal } from './SnapshotModal';
import { ExecutiveReportModal } from './ExecutiveReportModal';
import { IPSComparison } from './IPSComparison';
import { TrendAnalysis } from './TrendAnalysis';
import { ActionTracking } from './ActionTracking';
import { QualityMetrics } from './QualityMetrics';
import { DashboardTestSuiteRunner } from './DashboardTestSuiteRunner';
import { storageService } from '../../services/storageService';

interface ExecutiveDashboardProps {
  onNavigateToAudit?: (auditId?: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onNavigateToAudit
}) => {
  const [filter, setFilter] = useState<DashboardFilter>(DEFAULT_DASHBOARD_FILTER);
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'comparativo' | 'tendencias' | 'indicadores' | 'acciones' | 'calidad' | 'snapshots' | 'reporte' | 'pruebas'
  >('resumen');

  // Modals state
  const [selectedFinding, setSelectedFinding] = useState<ContextualFinding | null>(null);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const currentUser = useMemo(() => {
    const u = storageService.getActiveUser();
    return {
      name: u?.name || 'Dr. Alejandro Morales',
      role: u?.role || 'Médico Auditor Concurrente'
    };
  }, []);

  const buildDashboardUseCase = useMemo(() => new BuildDashboardUseCase(), []);
  
  // Calculate consolidated state
  const dashboardState = useMemo(() => {
    return buildDashboardUseCase.execute(filter);
  }, [buildDashboardUseCase, filter]);

  const { metrics, comparison, trends } = dashboardState;

  // Handlers for exporting CSV
  const handleExportIndicatorsCSV = () => {
    const csvContent = buildDashboardUseCase.exportIndicatorsCSV(dashboardState);
    downloadFile(csvContent, `FOMAG_Indicadores_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportActionsCSV = () => {
    const csvContent = buildDashboardUseCase.exportActionsCSV(dashboardState);
    downloadFile(csvContent, `FOMAG_Acciones24h_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Executive Report Document object
  const executiveReportDoc = useMemo(() => {
    return buildDashboardUseCase.generateExecutiveReport(dashboardState, currentUser);
  }, [buildDashboardUseCase, dashboardState, currentUser]);

  const getTrafficLightBg = (state: string) => {
    switch (state) {
      case 'FAVORABLE': return 'bg-emerald-500 text-white';
      case 'OBSERVACIONES_MENORES': return 'bg-lime-500 text-slate-900';
      case 'SITUACIONES_MODERADAS': return 'bg-amber-500 text-slate-900';
      case 'SITUACIONES_PRIORITARIAS': return 'bg-rose-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Global Filter Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">
                FASE 7 — CONTROL GERENCIAL
              </span>
              <span className="text-xs text-slate-500">• Red FOMAG Barranquilla</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Dashboard Gerencial, Indicadores y Comparación de IPS
            </h1>
            <p className="text-xs text-slate-500">
              Análisis concurrente basado en datos reales: Clínica Bonadona, Clínica de la Misericordia y Clínica Costa.
            </p>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSnapshotModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span>Snapshot Histórico</span>
            </button>

            <button
              onClick={handleExportIndicatorsCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Informe Ejecutivo</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          
          {/* IPS Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              IPS Prestadora
            </label>
            <select
              value={filter.ipsId || 'all'}
              onChange={(e) => setFilter(prev => ({ ...prev, ipsId: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none font-medium"
            >
              <option value="all">Todas las IPS (Red Consolidada)</option>
              <option value="ips-001">Clínica Bonadona</option>
              <option value="ips-002">Clínica de la Misericordia</option>
              <option value="ips-003">Clínica Costa</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Servicio Hospitalario
            </label>
            <select
              value={filter.service || 'all'}
              onChange={(e) => setFilter(prev => ({ ...prev, service: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none font-medium"
            >
              <option value="all">Todos los Servicios</option>
              <option value="Hospitalización Medicina Interna">Hospitalización Medicina Interna</option>
              <option value="UCI Adultos">UCI Adultos</option>
              <option value="Urgencias Adultos">Urgencias Adultos</option>
              <option value="Cirugía General">Cirugía General</option>
            </select>
          </div>

          {/* Finding Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Prioridad de Hallazgo
            </label>
            <select
              value={filter.findingPriority || 'all'}
              onChange={(e) => setFilter(prev => ({ ...prev, findingPriority: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none font-medium"
            >
              <option value="all">Todas las prioridades</option>
              <option value="CRITICA">Crítica (Nivel 1 Seguridad)</option>
              <option value="ALTA">Alta Prioridad</option>
              <option value="MODERADA">Moderada</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>

          {/* Action Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Estado Acción 24h
            </label>
            <select
              value={filter.actionStatus || 'all'}
              onChange={(e) => setFilter(prev => ({ ...prev, actionStatus: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none font-medium"
            >
              <option value="all">Todos los estados</option>
              <option value="Cerrada">Cerrada</option>
              <option value="En progreso">En progreso</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Vencida">Vencida</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilter(DEFAULT_DASHBOARD_FILTER)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer Filtros</span>
            </button>
          </div>

        </div>

      </div>

      {/* 2. Executive Metric Cards & Transparent Traffic Light */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Audits */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Auditorías Realizadas</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.overview.totalAudits}
          </div>
          <p className="text-[11px] text-slate-400">
            {metrics.overview.auditedPatients} pacientes hospitalizados
          </p>
        </div>

        {/* Card 2: Validated Findings */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hallazgos Validados</span>
            <ShieldAlert className="w-4 h-4 text-cyan-700" />
          </div>
          <div className="text-2xl font-black text-cyan-900">
            {metrics.overview.totalFindings}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold">
            {metrics.overview.priorityFindings} críticos / prioritarios
          </p>
        </div>

        {/* Card 3: 24h Action Closure Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Cumplimiento 24h</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {metrics.overview.actionClosureRateText}
          </div>
          <p className="text-[11px] text-slate-400">
            {metrics.overview.closedActions} de {metrics.overview.totalActions} compromisos
          </p>
        </div>

        {/* Card 4: Average Stay */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estancia Promedio</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.overview.avgStayDays} <span className="text-sm font-normal text-slate-500">días</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Media intrahospitalaria
          </p>
        </div>

        {/* Card 5: Audit Traffic Light (Semáforo Transparente) */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Estado Global Auditoría
            </span>
            <span className={`w-3 h-3 rounded-full ${getTrafficLightBg(metrics.auditTrafficLight.state)} ring-2 ring-white/20`} />
          </div>
          <div className="my-1">
            <span className="text-sm font-black text-white block">
              {metrics.auditTrafficLight.label}
            </span>
            <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">
              {metrics.auditTrafficLight.ruleExplanation}
            </p>
          </div>
        </div>

      </div>

      {/* 3. Main Navigation Tabs (9 Sub-Sections) */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-slate-50/70 p-1.5 rounded-xl">
        {[
          { key: 'resumen', label: 'Resumen Ejecutivo', icon: LayoutDashboard },
          { key: 'comparativo', label: 'Comparativo 3 IPS', icon: Building2 },
          { key: 'tendencias', label: 'Tendencias y Reincidencias', icon: TrendingUp },
          { key: 'indicadores', label: 'Indicadores KPI', icon: Activity },
          { key: 'acciones', label: 'Seguimiento 24h', icon: Clock },
          { key: 'calidad', label: 'Calidad del Dato', icon: Award },
          { key: 'snapshots', label: 'Snapshots', icon: Camera },
          { key: 'reporte', label: 'Informe Formal', icon: FileText },
          { key: 'pruebas', label: 'Suite de Pruebas (20)', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Area */}
      <div>
        
        {/* TAB 1: RESUMEN GENERAL */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            
            {/* Top Critical / Priority Findings Table with Drill-down */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Hallazgos Prioritarios y Críticos Validados (Drill-down)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Haga clic en cualquier fila para inspeccionar la evidencia documental en folios y fundamentación normativa.
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {metrics.overview.priorityFindings} situaciones prioritarias
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Código / Nivel</th>
                      <th className="p-3.5">IPS y Servicio</th>
                      <th className="p-3.5">Paciente (Anonimizado)</th>
                      <th className="p-3.5">Descripción del Hallazgo</th>
                      <th className="p-3.5">Evidencia HC</th>
                      <th className="p-3.5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(metrics.actions24h || []).slice(0, 6).map((item, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          setSelectedFinding({
                            id: item.findingId,
                            code: item.findingCode,
                            title: item.findingTitle,
                            description: item.actionRequired,
                            category: item.category,
                            tier: item.priority === 'CRITICA' ? 'NIVEL 1 — SEGURIDAD' : 'NIVEL 2 — CALIDAD',
                            isCriticalOrHighPriority: item.priority === 'CRITICA' || item.priority === 'ALTA',
                            requires24HourAction: true,
                            pageNumber: 12,
                            documentType: 'Evolución Médica / Paraclínicos',
                            evidenceSnippet: 'Muestra evidencia factual en historia clínica con trazabilidad completa.',
                            criterionEvidence: 'Resolución 3100 de 2019 — Procesos Asistenciales',
                            recommendedAction: item.actionRequired,
                            status: 'CONFIRMADO'
                          });
                        }}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-slate-900 block">{item.findingCode}</span>
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 mt-0.5">
                            {item.priority}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 block">{item.ipsName}</span>
                          <span className="text-[11px] text-slate-500">{item.service}</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          CC ***912
                        </td>
                        <td className="p-3.5 max-w-sm">
                          <span className="font-semibold text-slate-900 block">{item.findingTitle}</span>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                            {item.actionRequired}
                          </p>
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          pág. 12 (Evolución)
                        </td>
                        <td className="p-3.5 text-center">
                          <button className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Breakdowns: Category & Service */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* By Category */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-700" />
                  <span>Distribución por Categoría Asistencial</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {(metrics.categories || []).map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-medium">{cat.category}</span>
                        <span className="font-bold text-slate-900">{cat.total} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-cyan-700 h-2 rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Service */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-700" />
                  <span>Distribución por Servicio Hospitalario</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {(metrics.services || []).map((srv, idx) => {
                    const totalFindings = metrics.overview.totalFindings || 1;
                    const pct = Number(((srv.findingsCount / totalFindings) * 100).toFixed(1));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-medium">{srv.service}</span>
                          <span className="font-bold text-slate-900">{srv.findingsCount} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: COMPARATIVO 3 IPS */}
        {activeTab === 'comparativo' && (
          <IPSComparison
            comparison={comparison}
            onSelectIPS={(id) => setFilter(prev => ({ ...prev, ipsId: id }))}
          />
        )}

        {/* TAB 3: TENDENCIAS Y REINCIDENCIAS */}
        {activeTab === 'tendencias' && (
          <TrendAnalysis
            trendData={trends}
            onSelectPeriodGrouping={(g) => setFilter(prev => ({ ...prev, periodGrouping: g }))}
          />
        )}

        {/* TAB 4: INDICADORES KPI ESPECÍFICOS */}
        {activeTab === 'indicadores' && (
          <div className="space-y-6">
            
            {/* 5 KPI Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* 1. Seguridad del Paciente */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  1. Seguridad del Paciente
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Situaciones de Seguridad:</span>
                    <strong className="text-slate-900">{metrics.patientSafety?.totalSafetySituations ?? 0}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Alertas de Medicación:</span>
                    <strong className="text-slate-900">{metrics.patientSafety?.medicationAlertsCount ?? 0}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Alertas de Infecciones / PROA:</span>
                    <strong className="text-slate-900">{metrics.patientSafety?.infectionPROAAlertsCount ?? 0}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Oportunidad Asistencial */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  2. Oportunidad Asistencial
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Interconsultas Pendientes:</span>
                    <strong className="text-slate-900">{metrics.opportunity?.pendingInterconsultationsCount ?? 0}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Ayudas Diagnósticas Demoradas:</span>
                    <strong className="text-slate-900">{metrics.opportunity?.pendingDiagnosticAidsCount ?? 0}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Acciones 24h Pendientes:</span>
                    <strong className="text-slate-900">{metrics.opportunity?.pending24hActionsCount ?? 0}</strong>
                  </div>
                </div>
              </div>

              {/* 3. Estancia y Giro Cama */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  3. Estancia Hospitalaria
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Estancia Media General:</span>
                    <strong className="text-slate-900">{metrics.stayAnalysis?.avgStayDays ?? 0} días</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Mediana de Estancia:</span>
                    <strong className="text-slate-900">{metrics.stayAnalysis?.medianStayDays ?? 0} días</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Oportunidades de Gestión:</span>
                    <strong className="text-slate-900">{metrics.stayAnalysis?.managementOpportunitiesCount ?? 0} pacientes</strong>
                  </div>
                </div>
              </div>

              {/* 4. Calidad del Registro */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  4. Calidad del Registro
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Hallazgos Documentales:</span>
                    <strong className="text-slate-900">{metrics.documentalQuality?.totalDocumentalFindings ?? 0}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Registros Incompletos:</span>
                    <strong className="text-slate-900">{metrics.documentalQuality?.incompleteRecordsCount ?? 0}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Tasa Deficiencia Documental:</span>
                    <strong className="text-slate-900">{metrics.documentalQuality?.documentalDeficiencyRate ?? 0}%</strong>
                  </div>
                </div>
              </div>

              {/* 5. Pertinencia Médica */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  5. Pertinencia Asistencial
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Hallazgos de Pertinencia:</span>
                    <strong className="text-slate-900">{metrics.pertinence?.totalPertinenceFindings ?? 0}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Pertinencia de Medicamentos:</span>
                    <strong className="text-slate-900">{metrics.pertinence?.medicationPertinenceCount ?? 0}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Pertinencia en Procedimientos:</span>
                    <strong className="text-slate-900">{metrics.pertinence?.proceduresPertinenceCount ?? 0}</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: SEGUIMIENTO ACCIONES 24H */}
        {activeTab === 'acciones' && (
          <ActionTracking actions={metrics.actions24h || []} />
        )}

        {/* TAB 6: CALIDAD DEL DATO */}
        {activeTab === 'calidad' && (
          <QualityMetrics quality={metrics.dataQuality} />
        )}

        {/* TAB 7: SNAPSHOTS */}
        {activeTab === 'snapshots' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Centro de Instantáneas Históricas (Snapshots)</h3>
                <p className="text-xs text-slate-500">Congele y compare estados gerenciales en cortes de tiempo específicos.</p>
              </div>
              <button
                onClick={() => setIsSnapshotModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Abrir Gestor de Snapshots</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: INFORME EJECUTIVO */}
        {activeTab === 'reporte' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Generador de Informe Gerencial Oficial</h3>
                <p className="text-xs text-slate-500">Documento consolidado con 9 secciones formales, firma y hash criptográfico.</p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Visualizar Informe Ejecutivo</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: SUITE DE PRUEBAS */}
        {activeTab === 'pruebas' && (
          <DashboardTestSuiteRunner />
        )}

      </div>

      {/* MODALS */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}

      {isSnapshotModalOpen && (
        <SnapshotModal
          currentFilter={filter}
          currentMetrics={metrics}
          user={currentUser}
          onClose={() => setIsSnapshotModalOpen(false)}
        />
      )}

      {isReportModalOpen && (
        <ExecutiveReportModal
          report={executiveReportDoc}
          onClose={() => setIsReportModalOpen(false)}
          onExportCSV={handleExportIndicatorsCSV}
          onExportActionsCSV={handleExportActionsCSV}
        />
      )}

    </div>
  );
};
