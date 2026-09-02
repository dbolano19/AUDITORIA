import React, { useState } from 'react';
import {
  CompleteConcurrentAuditResult,
  ConcurrentAuditFinding,
  ChronologyEvent,
  DiagnosticAidAuditRecord,
  UrgentAuditAction
} from '../../domain/models';
import {
  ShieldAlert,
  Clock,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Pill,
  Sparkles,
  UserCheck,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  AlertOctagon,
  BookOpen,
  GitMerge
} from 'lucide-react';

interface ConcurrentAuditEngineReviewProps {
  auditResult: CompleteConcurrentAuditResult;
  onUpdateFindingStatus?: (findingId: string, status: 'CONFIRMADO' | 'RECHAZADO' | 'MODIFICADO', notes?: string) => void;
  onConfirmAll?: () => void;
  onExportNote?: () => void;
}

export const ConcurrentAuditEngineReview: React.FC<ConcurrentAuditEngineReviewProps> = ({
  auditResult,
  onUpdateFindingStatus,
  onConfirmAll,
  onExportNote
}) => {
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'cronologia' | 'ayudas' | 'seguridad_estancia' | 'hallazgos' | 'acciones24h' | 'nota_fomag'
  >('resumen');

  const [selectedFinding, setSelectedFinding] = useState<ConcurrentAuditFinding | null>(
    auditResult.findings[0] || null
  );

  const [findingsState, setFindingsState] = useState<Record<string, { status: string; notes?: string }>>(() => {
    const initial: Record<string, { status: string; notes?: string }> = {};
    auditResult.findings.forEach(f => {
      initial[f.id] = { status: f.validationStatus, notes: f.auditorNotes };
    });
    return initial;
  });

  const handleStatusChange = (id: string, status: 'CONFIRMADO' | 'RECHAZADO' | 'MODIFICADO') => {
    setFindingsState(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
    if (onUpdateFindingStatus) {
      onUpdateFindingStatus(id, status, findingsState[id]?.notes);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case '🔴 Crítico':
        return 'bg-red-100 text-red-800 border-red-200';
      case '🟠 Alto':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case '🟡 Moderado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getCertaintyBadge = (certainty: string) => {
    switch (certainty) {
      case 'EVIDENCIA DOCUMENTAL DIRECTA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'INCONSISTENCIA DOCUMENTAL':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'POSIBLE HALLAZGO':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  return (
    <div id="concurrent-audit-engine-review" className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {auditResult.engineVersion}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Guía de Auditoría Concurrente FOMAG
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Auditoría Concurrente sobre Historia Clínica
              </h1>
              <p className="text-xs text-slate-700 mt-0.5">
                Paciente: <strong className="text-slate-900">{auditResult.patientExtracted.fullName}</strong> ({auditResult.patientExtracted.docType} {auditResult.patientExtracted.docNumber}) | Servicio: {auditResult.patientExtracted.service} | Cama: {auditResult.patientExtracted.roomBed}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                id="btn-export-fomag-note"
                onClick={onExportNote}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-300"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                Exportar Nota FOMAG
              </button>
              <button
                id="btn-confirm-all-findings"
                onClick={onConfirmAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Validar y Confirmar Auditoría
              </button>
            </div>
          </div>

          {/* Mandatory Clinical Safety Disclaimer */}
          <div className="mt-3 bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Control Ético y Clínico:</strong> {auditResult.disclaimer} Todos los hallazgos son preliminares y requieren validación del auditor médico humano.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto mt-4 pt-1 border-t border-slate-100 scrollbar-none">
            {[
              { key: 'resumen', label: 'Resumen Ejecutivo', icon: FileCheck, count: null },
              { key: 'hallazgos', label: 'Hallazgos con Evidencia', icon: AlertOctagon, count: auditResult.findings.length },
              { key: 'acciones24h', label: 'Plan 24 Horas', icon: Clock, count: auditResult.urgentActions.length },
              { key: 'ayudas', label: 'Ayudas Diagnósticas (10 Criterios)', icon: Activity, count: auditResult.diagnosticAids.length },
              { key: 'cronologia', label: 'Cronología y Cadena', icon: Layers, count: auditResult.timeline.length },
              { key: 'seguridad_estancia', label: 'Seguridad y Estancia', icon: Building, count: null },
              { key: 'nota_fomag', label: 'Nota Oficial FOMAG', icon: FileText, count: null }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  id={`tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-md whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                      : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-600'}`} />
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: RESUMEN EJECUTIVO */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Días de Estancia
                  </span>
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {auditResult.stayAnalysis.calculatedHospitalStayDays} días
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  Riesgo: <span className="font-semibold text-amber-700">{auditResult.stayAnalysis.prolongedStayRiskLevel}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Hallazgos Auditados
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {auditResult.findings.length}
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  {auditResult.findings.filter(f => f.priority === '🔴 Crítico').length} Críticos | {auditResult.findings.filter(f => f.priority === '🟠 Alto').length} Altos
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Acciones 24 Horas
                  </span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {auditResult.urgentActions.filter(a => a.isWithin24Hours).length}
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  Prioridad inmediata asistencial
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Inventario Páginas
                  </span>
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {auditResult.inventory.totalPages} págs
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  Estado: <strong className="text-emerald-700">{auditResult.inventory.completenessStatus}</strong>
                </div>
              </div>
            </div>

            {/* Clinical Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Situation & Pertinence */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Situación Clínica Actual y Motivo de Hospitalización
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs text-slate-800 leading-relaxed mb-3">
                    {auditResult.executiveSummary.hospitalizationReason}
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong>Evaluación de Pertinencia de Estancia:</strong> {auditResult.executiveSummary.stayPertinenceEvaluation}
                  </div>
                </div>

                {/* Top Findings */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <AlertOctagon className="w-4 h-4 text-red-600" />
                    Principales Hallazgos y Riesgos Detectados
                  </h3>
                  <div className="space-y-2.5">
                    {auditResult.findings.map(finding => (
                      <div
                        key={finding.id}
                        onClick={() => {
                          setSelectedFinding(finding);
                          setActiveTab('hallazgos');
                        }}
                        className="p-3 rounded-lg border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/20 transition-all cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(finding.priority)}`}>
                              {finding.priority}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {finding.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 line-clamp-2">
                            {finding.description}
                          </p>
                          <div className="text-[11px] text-slate-700 flex items-center gap-1 font-mono">
                            <FileText className="w-3 h-3 text-slate-600" />
                            Pág. {finding.evidence.pdfPage} ({finding.evidence.documentType})
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 self-center" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar: Inventory & 24H Quick Actions */}
              <div className="space-y-6">
                {/* 24-Hour Urgent Actions */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Recomendaciones Prioritarias (24H)
                  </h3>
                  <div className="space-y-3">
                    {auditResult.urgentActions.map(action => (
                      <div key={action.id} className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/70 text-xs">
                        <div className="font-semibold text-slate-900 mb-1">
                          {action.actionText}
                        </div>
                        <div className="text-[11px] text-slate-700 flex items-center justify-between pt-1 border-t border-amber-200/50">
                          <span>Resp: {action.responsible}</span>
                          <span className="font-bold text-amber-800">{action.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Inventory Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Inventario Documental ({auditResult.inventory.totalPages} páginas)
                  </h3>
                  <div className="space-y-2">
                    {auditResult.inventory.pages.map(p => (
                      <div key={p.pageNumber} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-600">Pág {p.pageNumber}</span>
                          <span className="text-slate-800">{p.documentType}</span>
                        </div>
                        <span className="text-[11px] text-slate-600">{p.service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HALLAZGOS CON EVIDENCIA ESTRICTA */}
        {activeTab === 'hallazgos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Findings List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hallazgos Identificados</h3>
                  <p className="text-xs text-slate-600">Total: {auditResult.findings.length} hallazgos con evidencia directa</p>
                </div>
              </div>

              {auditResult.findings.map(finding => {
                const isSelected = selectedFinding?.id === finding.id;
                const status = findingsState[finding.id]?.status || finding.validationStatus;

                return (
                  <div
                    key={finding.id}
                    onClick={() => setSelectedFinding(finding)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(finding.priority)}`}>
                          {finding.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getCertaintyBadge(finding.certaintyLevel)}`}>
                          {finding.certaintyLevel}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          status === 'CONFIRMADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'RECHAZADO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mb-1">
                      {finding.title}
                    </h4>
                    <p className="text-xs text-slate-700 line-clamp-2 mb-2">
                      {finding.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-700 pt-2 border-t border-slate-100 font-mono">
                      <span>📄 Pág. {finding.evidence.pdfPage} ({finding.evidence.documentType})</span>
                      <span className="text-slate-600">ID: {finding.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Finding Detail Panel */}
            <div className="lg:col-span-7">
              {selectedFinding ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-28 space-y-5">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getPriorityBadge(selectedFinding.priority)}`}>
                          {selectedFinding.priority}
                        </span>
                        <span className="text-xs font-mono text-slate-600">
                          {selectedFinding.code} • {selectedFinding.category}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedFinding.title}
                      </h2>
                    </div>

                    {/* Human Auditor Control */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStatusChange(selectedFinding.id, 'CONFIRMADO')}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          findingsState[selectedFinding.id]?.status === 'CONFIRMADO'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title="Confirmar hallazgo"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedFinding.id, 'RECHAZADO')}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          findingsState[selectedFinding.id]?.status === 'RECHAZADO'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                        title="Rechazar hallazgo"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  </div>

                  {/* Level of Certainty */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Nivel de Certeza Documental
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getCertaintyBadge(selectedFinding.certaintyLevel)}`}>
                        {selectedFinding.certaintyLevel}
                      </span>
                      <span className="text-xs text-slate-700">
                        {selectedFinding.certaintyLevel === 'EVIDENCIA DOCUMENTAL DIRECTA' && 'Hecho soportado en fragmento textual explícito del expediente.'}
                        {selectedFinding.certaintyLevel === 'INCONSISTENCIA DOCUMENTAL' && 'Discordancia evidente entre distintas notas o registros clínicos.'}
                        {selectedFinding.certaintyLevel === 'POSIBLE HALLAZGO' && 'Condición o desviación que amerita comprobación con el equipo asistencial.'}
                      </span>
                    </div>
                  </div>

                  {/* Mandatory Double Evidence Card (FASE 4: Fact Evidence vs Criterion Evidence) */}
                  <div className="space-y-3">
                    {/* Primary Evidence from Medical Record */}
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-emerald-700" />
                          1. Evidencia Primaria (Historia Clínica)
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          Página {selectedFinding.evidence.pdfPage} ({selectedFinding.evidence.documentType})
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs text-slate-800 font-mono italic">
                        "{selectedFinding.factEvidence || selectedFinding.evidence.snippet}"
                      </div>
                      <div className="text-[11px] text-emerald-900">
                        <strong>Relevancia en Auditoría:</strong> {selectedFinding.evidence.relevanceReason}
                      </div>
                      <div className="text-[11px] text-slate-700 bg-white/70 p-2 rounded border border-emerald-100">
                        <strong>Guía de Verificación:</strong> {selectedFinding.evidence.auditorVerificationGuide}
                      </div>
                    </div>

                    {/* Criterion Evidence from Master Knowledge Library */}
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-indigo-700" />
                          2. Evidencia de Criterio (Norma, Guía o Protocolo FOMAG)
                        </span>
                        <span className="text-[11px] text-indigo-700 font-medium">
                          Biblioteca Maestra
                        </span>
                      </div>

                      {selectedFinding.criterionReferences && selectedFinding.criterionReferences.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedFinding.criterionReferences.map((cr, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-indigo-100 text-xs space-y-1">
                              <div className="flex items-center justify-between font-mono">
                                <span className="font-bold text-indigo-800">[{cr.criterionId}] {cr.title}</span>
                                <span className="text-[10px] text-slate-500">{cr.articleOrSection || 'Norma general'}</span>
                              </div>
                              <p className="text-slate-700 text-[11px]">{cr.requirement}</p>
                              <div className="text-[10px] text-slate-500">
                                <strong>Evidencia requerida:</strong> {cr.evidenceRequired}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-xs text-slate-700 font-mono">
                          {selectedFinding.criterionEvidence || 'Guía Para Realizar la Nota de Auditoría Concurrente FOMAG — Criterio técnico asistencial.'}
                        </div>
                      )}

                      {/* Source References & Precedence */}
                      {selectedFinding.sourceReferences && selectedFinding.sourceReferences.length > 0 && (
                        <div className="pt-2 border-t border-indigo-100/70 space-y-1.5">
                          <div className="text-[11px] font-semibold text-indigo-900">Fuentes Normativas Oficiales Aplicables:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedFinding.sourceReferences.map((sr, sIdx) => (
                              <span key={sIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-indigo-200 rounded text-[10px] text-slate-800">
                                <span className="font-mono font-bold text-indigo-700">[{sr.sourceId}]</span>
                                <span>{sr.sourceName}</span>
                                <span className={`px-1 rounded text-[9px] font-bold ${
                                  sr.validityStatus === 'VIGENTE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {sr.validityStatus}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Precedence Chain & Temporal Warnings */}
                      {selectedFinding.normativePrecedenceChain && (
                        <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <GitMerge className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <strong>Cadena de Precedencia:</strong> {selectedFinding.normativePrecedenceChain}
                          </div>
                        </div>
                      )}

                      {selectedFinding.temporalWarning && (
                        <div className="p-2 bg-rose-50 rounded border border-rose-200 text-[11px] text-rose-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                          <div>
                            <strong>Alerta Temporal:</strong> {selectedFinding.temporalWarning}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clinical Analysis & Risk */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 mb-1">Análisis Clínico / Causa</h4>
                      <p className="text-xs text-slate-800 leading-relaxed">
                        {selectedFinding.clinicalAnalysis}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 mb-1">Impacto y Riesgo Asistencial</h4>
                      <p className="text-xs text-slate-800 leading-relaxed">
                        {selectedFinding.riskImpact}
                      </p>
                    </div>
                  </div>

                  {/* Action Plan */}
                  <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 space-y-2">
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                      Plan de Acción y Recomendación Requerida
                    </h4>
                    <p className="text-xs text-slate-800 font-medium">
                      {selectedFinding.requiredAction}
                    </p>
                    <div className="flex items-center justify-between text-xs text-amber-900 pt-2 border-t border-amber-200/60">
                      <span><strong>Responsable:</strong> {selectedFinding.suggestedResponsible}</span>
                      <span><strong>Plazo Sugerido:</strong> <span className="font-bold">{selectedFinding.suggestedDeadline}</span></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-600">
                  Seleccione un hallazgo para ver el detalle de evidencia documental y plan de acción.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PLAN 24 HORAS */}
        {activeTab === 'acciones24h' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Plan de Acción Priorizado en las Próximas 24 Horas
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Acciones asistenciales y administrativas críticas para destrabar la estancia y garantizar oportunidad clínica.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditResult.urgentActions.map((action, idx) => (
                <div
                  key={action.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-600">
                      Acción #{idx + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getPriorityBadge(action.priority)}`}>
                      {action.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {action.actionText}
                  </h4>

                  {action.evidenceSnippet && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 font-mono italic">
                      "{action.evidenceSnippet}"
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                    <div className="text-slate-700">
                      <strong>Responsable:</strong> {action.responsible}
                    </div>
                    <div className="flex items-center gap-1 text-amber-800 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {action.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AYUDAS DIAGNÓSTICAS (10 CRITERIOS) */}
        {activeTab === 'ayudas' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Matriz de Auditoría de Ayudas Diagnósticas (10 Criterios de la Guía)
              </h3>
              <p className="text-xs text-slate-600">
                Verificación sistemática: Documentada, Indicación, Concordancia Dx, Realizada, Resultado, Interpretación, Conducta, Repetición, Justificación y Pendiente.
              </p>
            </div>

            <div className="space-y-4">
              {auditResult.diagnosticAids.map(aid => (
                <div key={aid.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {aid.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{aid.studyName}</h4>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Orden: {aid.orderDate} | Pág. {aid.pdfPage}
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {aid.auditClassification}
                    </span>
                  </div>

                  {/* 10 Points Checklist Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">1. Documentada</span>
                      <strong className={aid.isDocumented ? 'text-emerald-700' : 'text-red-700'}>
                        {aid.isDocumented ? 'Sí' : 'No'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">2. Indicación</span>
                      <strong className={aid.hasDocumentedIndication ? 'text-emerald-700' : 'text-amber-700'}>
                        {aid.hasDocumentedIndication ? 'Sí' : 'No doc.'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">3. Relación Dx</span>
                      <strong className={aid.isRelatedToDiagnosis ? 'text-emerald-700' : 'text-slate-700'}>
                        {aid.isRelatedToDiagnosis ? 'Sí' : 'No'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">4. Realizada</span>
                      <strong className={aid.wasPerformed ? 'text-emerald-700' : 'text-red-700'}>
                        {aid.wasPerformed ? 'Sí' : 'Pendiente'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">5. Con Resultado</span>
                      <strong className={aid.hasDocumentedResult ? 'text-emerald-700' : 'text-amber-700'}>
                        {aid.hasDocumentedResult ? 'Sí' : 'No'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">6. Interpretada</span>
                      <strong className={aid.hasDocumentedInterpretation ? 'text-emerald-700' : 'text-red-700'}>
                        {aid.hasDocumentedInterpretation ? 'Sí' : 'Sin Nota'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">7. Generó Conducta</span>
                      <strong className={aid.generatedDocumentedConduct ? 'text-emerald-700' : 'text-slate-700'}>
                        {aid.generatedDocumentedConduct ? 'Sí' : 'No doc.'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">8. Repetida</span>
                      <strong className="text-slate-700">{aid.wasRepeated ? 'Sí' : 'No'}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">9. Justificada</span>
                      <strong className="text-slate-700">{aid.wasRepeated ? (aid.isRepetitionJustified ? 'Sí' : 'No') : 'N/A'}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600 block">10. Pendiente</span>
                      <strong className={aid.isPending ? 'text-amber-700' : 'text-emerald-700'}>
                        {aid.isPending ? 'Sí' : 'No'}
                      </strong>
                    </div>
                  </div>

                  {/* Evidence block */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="font-semibold text-slate-900">Nota de Auditoría:</div>
                    <p className="text-slate-700">{aid.auditNotes}</p>
                    {aid.resultSummary && (
                      <div className="text-slate-600 text-[11px] pt-1">
                        <strong>Resultado Documentado:</strong> {aid.resultSummary}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CRONOLOGÍA Y CADENA DE EVENTOS */}
        {activeTab === 'cronologia' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Cronología Clínica y Cadena de Trazabilidad
              </h3>
              <p className="text-xs text-slate-600">
                Cadena estructurada: ORDEN ➔ REALIZACIÓN ➔ RESULTADO ➔ INTERPRETACIÓN ➔ CONDUCTA
              </p>
            </div>

            <div className="relative border-l-2 border-emerald-500/30 ml-4 space-y-6 pb-4">
              {auditResult.timeline.map((event, idx) => (
                <div key={event.id} className="relative pl-6">
                  {/* Step Dot */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm" />

                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {event.formattedDate}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{event.title}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {event.chainStage || event.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span>📄 Pág. {event.pdfPage} ({event.sourceDoc})</span>
                      {event.evidenceSnippet && (
                        <span className="italic text-slate-500 line-clamp-1 max-w-xs">
                          "{event.evidenceSnippet}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SEGURIDAD Y ESTANCIA */}
        {activeTab === 'seguridad_estancia' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Safety Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                Seguridad del Paciente (Riesgos vs Eventos Ocurridos)
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-1">Riesgos Documentados</div>
                  {auditResult.safetyAnalysis.documentedRisks.map((r, i) => (
                    <div key={i} className="text-xs text-slate-700 mb-1">
                      • <strong>{r.type}:</strong> {r.description} (Pág. {r.pdfPage})
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-1">Eventos Adversos Ocurridos</div>
                  {auditResult.safetyAnalysis.occurredEvents.length > 0 ? (
                    auditResult.safetyAnalysis.occurredEvents.map((e, i) => (
                      <div key={i} className="text-xs text-red-800 font-semibold mb-1">
                        ⚠️ <strong>{e.type}:</strong> {e.description} (Fecha: {e.eventDate}, Pág. {e.pdfPage})
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-emerald-700 font-medium">
                      🟢 No se documentan eventos adversos ocurridos en el periodo analizado.
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-700 bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                  {auditResult.safetyAnalysis.auditNotes}
                </div>
              </div>
            </div>

            {/* Stay & Barriers Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Estancia Hospitalaria y Barreras de Egreso
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-1">
                    Estancia Acumulada: {auditResult.stayAnalysis.calculatedHospitalStayDays} días
                  </div>
                  <p className="text-xs text-slate-700">
                    {auditResult.stayAnalysis.justificationEvaluation}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-1">Barreras Operativas / Administrativas</div>
                  {auditResult.stayAnalysis.operationalBarriers.map((b, i) => (
                    <div key={i} className="text-xs text-slate-700 mb-1">• {b}</div>
                  ))}
                  {auditResult.stayAnalysis.administrativeBarriers.map((b, i) => (
                    <div key={i} className="text-xs text-slate-700 mb-1">• {b}</div>
                  ))}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-1">Intervenciones Requeridas con la IPS</div>
                  {auditResult.stayAnalysis.requiredIpsInterventions.map((int, i) => (
                    <div key={i} className="text-xs text-slate-700 mb-1">✓ {int}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: NOTA OFICIAL FOMAG */}
        {activeTab === 'nota_fomag' && (
          <div className="bg-white rounded-xl border border-slate-300 p-8 shadow-sm max-w-4xl mx-auto space-y-6 font-sans">
            {/* Header */}
            <div className="text-center border-b border-slate-300 pb-4">
              <h2 className="text-lg font-bold text-slate-900">FONDO NACIONAL DE PRESTACIONES SOCIALES DEL MAGISTERIO (FOMAG)</h2>
              <h3 className="text-sm font-semibold text-slate-700">NOTA TÉCNICA DE AUDITORÍA CONCURRENTE HOSPITALARIA</h3>
              <p className="text-xs text-slate-600 mt-1">Generado bajo especificación: {auditResult.engineVersion}</p>
            </div>

            {/* Demographics Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div><strong>Paciente:</strong> {auditResult.patientExtracted.fullName}</div>
              <div><strong>Documento:</strong> {auditResult.patientExtracted.docType} {auditResult.patientExtracted.docNumber}</div>
              <div><strong>Servicio:</strong> {auditResult.patientExtracted.service}</div>
              <div><strong>Cama:</strong> {auditResult.patientExtracted.roomBed}</div>
              <div><strong>Fecha Ingreso:</strong> {auditResult.patientExtracted.admissionDate}</div>
              <div><strong>Días Estancia:</strong> {auditResult.stayAnalysis.calculatedHospitalStayDays} días</div>
              <div className="col-span-2"><strong>Diagnóstico Principal:</strong> {auditResult.patientExtracted.mainDiagnosis}</div>
            </div>

            {/* Clinical Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase border-b pb-1">1. Situación Clínica y Evolución</h4>
              <p className="text-xs text-slate-800 leading-relaxed">
                {auditResult.executiveSummary.hospitalizationReason}
              </p>
            </div>

            {/* Findings & Evidence */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase border-b pb-1">2. Hallazgos Auditados con Evidencia</h4>
              <div className="space-y-2">
                {auditResult.findings.map(f => (
                  <div key={f.id} className="text-xs bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="font-bold text-slate-900 mb-0.5">[{f.priority}] {f.title} (Pág. {f.evidence.pdfPage})</div>
                    <div className="text-slate-700 mb-1">{f.description}</div>
                    <div className="italic text-slate-600 font-mono text-[11px]">Evidencia: "{f.evidence.snippet}"</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 24h Actions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase border-b pb-1">3. Recomendaciones y Plan de Acción (24 Horas)</h4>
              <ul className="list-disc pl-5 text-xs text-slate-800 space-y-1">
                {auditResult.urgentActions.map(a => (
                  <li key={a.id}>
                    <strong>{a.actionText}</strong> (Responsable: {a.responsible}, Plazo: {a.deadline})
                  </li>
                ))}
              </ul>
            </div>

            {/* Signature & Disclaimer */}
            <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-end gap-4 text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-900">Auditor Médico Asignado FOMAG</p>
                <p>Registro Profesional / Firma Electrónica</p>
              </div>
              <div className="text-right text-[11px] max-w-xs italic text-slate-500">
                {auditResult.disclaimer}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
