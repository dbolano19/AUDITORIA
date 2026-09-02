/**
 * COMPONENT: PatientContextAuditDashboard (FASE 5)
 * Comprehensive Contextual Audit Workstation for an Individual Patient.
 * 
 * Strict Principle:
 * HISTORIA CLÍNICA -> CONTEXTO -> DIAGNÓSTICOS -> SERVICIOS -> RIESGOS -> CRITERIOS -> FUENTES -> HALLAZGOS -> PRIORIZACIÓN -> RECOMENDACIONES
 */

import React, { useState } from 'react';
import { AuditSession } from '../../domain/models/AuditSession';
import { ContextualFindingCard } from './ContextualFindingCard';
import { storageService } from '../../services/storageService';
import { AuditorValidationStatus, ActionPlan24Hour } from '../../domain/models/ContextualFinding';
import {
  ShieldAlert,
  Clock,
  FileCheck2,
  AlertOctagon,
  FileText,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Pill,
  Activity,
  ArrowRight,
  Stethoscope,
  Building,
  User,
  FlaskConical,
  Scissors,
  Flame,
  Printer,
  History,
  GitMerge,
  Filter
} from 'lucide-react';

interface PatientContextAuditDashboardProps {
  session: AuditSession;
  onUpdateSession?: (updatedSession: AuditSession) => void;
  onBack?: () => void;
}

export const PatientContextAuditDashboard: React.FC<PatientContextAuditDashboardProps> = ({
  session: initialSession,
  onUpdateSession,
  onBack
}) => {
  const [session, setSession] = useState<AuditSession>(initialSession);
  const [activeTab, setActiveTab] = useState<
    | 'resumen_problemas'
    | 'matriz_riesgos'
    | 'cronologia'
    | 'ayudas_diagnosticas'
    | 'tratamiento_antibioticos'
    | 'procedimientos'
    | 'interconsultas'
    | 'estancia_barreras'
    | 'discrepancias'
    | 'hallazgos'
    | 'plan_24h'
    | 'fuentes_criterios'
  >('resumen_problemas');

  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('TODOS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('TODOS');
  const [isExporting, setIsExporting] = useState(false);

  const ctx = session.clinicalContext;
  const pMap = session.problemMap;
  const rMap = session.riskMap;

  // Handle Finding Validation
  const handleValidateFinding = (
    findingId: string,
    status: AuditorValidationStatus,
    notes?: string,
    modifiedText?: string
  ) => {
    storageService.updateFindingValidation(session.id, findingId, {
      status,
      notes,
      modifiedText,
      validatedBy: 'Dr. Alejandro Morales'
    });

    const updatedFindings = session.findings.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          auditorValidation: {
            status,
            validatedBy: 'Dr. Alejandro Morales',
            validatedAt: new Date().toISOString(),
            auditorNotes: notes || f.auditorValidation.auditorNotes,
            modifiedDescription: modifiedText
          }
        };
      }
      return f;
    });

    const validatedCount = updatedFindings.filter(f => f.auditorValidation.status !== 'PENDIENTE').length;
    const updatedSession: AuditSession = {
      ...session,
      findings: updatedFindings,
      validatedFindingsCount: validatedCount,
      updatedAt: new Date().toISOString()
    };

    setSession(updatedSession);
    if (onUpdateSession) onUpdateSession(updatedSession);
  };

  // Handle Action Plan 24h Update
  const handleUpdateActionStatus = (
    actionId: string,
    status: ActionPlan24Hour['status'],
    closingSnippet?: string
  ) => {
    storageService.updateAction24HourStatus(session.id, actionId, status, closingSnippet);

    const updatedActions = session.actions24h.map(a => {
      if (a.id === actionId) {
        return {
          ...a,
          status,
          closingEvidenceSnippet: closingSnippet || a.closingEvidenceSnippet,
          closingDate: new Date().toISOString()
        };
      }
      return a;
    });

    const updatedFindings = session.findings.map(f => {
      if (f.actionPlan24h?.id === actionId) {
        return {
          ...f,
          actionPlan24h: {
            ...f.actionPlan24h,
            status,
            closingEvidenceSnippet: closingSnippet || f.actionPlan24h.closingEvidenceSnippet,
            closingDate: new Date().toISOString()
          }
        };
      }
      return f;
    });

    const updatedSession: AuditSession = {
      ...session,
      actions24h: updatedActions,
      findings: updatedFindings,
      updatedAt: new Date().toISOString()
    };

    setSession(updatedSession);
    if (onUpdateSession) onUpdateSession(updatedSession);
  };

  // Filter findings
  const filteredFindings = session.findings.filter(f => {
    if (selectedTierFilter !== 'TODOS' && f.tier !== selectedTierFilter) return false;
    if (selectedStatusFilter !== 'TODOS' && f.auditorValidation.status !== selectedStatusFilter) return false;
    return true;
  });

  const getTrafficLightBadge = (tl: string) => {
    if (tl.includes('🔴')) return { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-600' };
    if (tl.includes('🟠')) return { bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
    if (tl.includes('🟡')) return { bg: 'bg-yellow-50 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' };
    return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' };
  };

  const tlBadge = getTrafficLightBadge(session.globalTrafficLight);

  return (
    <div id="patient-context-audit-dashboard" className="bg-slate-100 min-h-screen pb-20">
      
      {/* 1. Header Banner & Patient Context Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-200 font-bold">
                  {session.auditType}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {session.id}</span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Corte: {session.auditDate}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-indigo-400" />
                {ctx.patientName}
                <span className="text-sm font-normal text-slate-400">({ctx.docNumber})</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Traffic Light */}
              <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${tlBadge.bg}`}>
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${tlBadge.dot}`} />
                <span>{session.globalTrafficLight}</span>
              </div>

              {/* Confidence Score */}
              <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{Math.round(session.confidenceScore * 100)}% Confianza</span>
              </div>

              {onBack && (
                <button
                  onClick={onBack}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                >
                  Volver
                </button>
              )}
            </div>
          </div>

          {/* Quick Context Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3 text-xs">
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">IPS / Ubicación</span>
              <strong className="text-white truncate block">{ctx.ipsName}</strong>
              <span className="text-slate-400 text-[10px] truncate block">{ctx.currentService}</span>
            </div>

            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Edad / Sexo / Régimen</span>
              <strong className="text-white block">{ctx.age} años • {ctx.sex}</strong>
              <span className="text-indigo-300 text-[10px] block">{ctx.regime}</span>
            </div>

            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Estancia Acumulada</span>
              <strong className="text-white text-sm block">{ctx.lengthOfStay} días</strong>
              <span className="text-amber-300 text-[10px] block">Ingreso: {ctx.admissionDate}</span>
            </div>

            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Clasificación Clínica</span>
              <strong className="text-emerald-300 truncate block">{ctx.clinicalClassification}</strong>
              <span className="text-slate-400 text-[10px] truncate block">{ctx.clinicalStatus}</span>
            </div>

            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Diagnóstico Principal</span>
              <strong className="text-amber-200 truncate block" title={ctx.primaryDiagnosis}>
                {ctx.primaryDiagnosis}
              </strong>
            </div>

            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Validación Humana</span>
              <strong className="text-emerald-400 block">
                {session.validatedFindingsCount} de {session.totalFindingsCount} validados
              </strong>
              <span className="text-slate-400 text-[10px] block">{session.actions24h.length} Planes 24h</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Navigation Tabs (12 Modular Context Dimensions) */}
      <div className="bg-white border-b border-slate-200 sticky top-[138px] z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-thin">
            {[
              { id: 'resumen_problemas', label: '1. Resumen & Problemas', badge: pMap.activeProblemsCount, icon: Layers },
              { id: 'matriz_riesgos', label: '2. Matriz de Riesgos', badge: rMap.highRisksCount, icon: ShieldAlert },
              { id: 'cronologia', label: '3. Cronología', badge: ctx.timelineEvents.length, icon: Clock },
              { id: 'ayudas_diagnosticas', label: '4. Ayudas & Labs', badge: ctx.diagnosticTests.length, icon: FlaskConical },
              { id: 'tratamiento_antibioticos', label: '5. Tratamiento & ABX', badge: ctx.medications.length, icon: Pill },
              { id: 'interconsultas', label: '6. Interconsultas', badge: ctx.consultations.length, icon: UserCheck },
              { id: 'estancia_barreras', label: '7. Estancia & Barreras', badge: ctx.stayBarriers.length, icon: AlertOctagon },
              { id: 'discrepancias', label: '8. Discrepancias HC', badge: ctx.discrepancies.length, icon: GitMerge },
              { id: 'hallazgos', label: '9. Hallazgos Contextuales', badge: session.findings.length, icon: CheckCircle2, highlight: true },
              { id: 'plan_24h', label: '10. Plan de Acción 24h', badge: session.actions24h.length, icon: Clock },
              { id: 'fuentes_criterios', label: '11. Fuentes & Normativa', badge: 'Normas', icon: BookOpen }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : tab.highlight
                      ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* TAB 1: RESUMEN Y MAPA DE PROBLEMAS */}
        {activeTab === 'resumen_problemas' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Executive Conclusion Banner */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Resumen Ejecutivo y Contexto Clínico del Paciente
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                {session.clinicalDocumentarySummary}
              </p>
              <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 text-xs text-indigo-900">
                <strong>Conclusión del Auditor:</strong> {session.auditorExecutiveConclusion}
              </div>
            </div>

            {/* Clinical Problem Map Cards */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    Mapa Estructurado de Problemas Clínicos ({pMap.activeProblemsCount} Activos)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Articulación de diagnósticos, ayudas diagnósticas, medicamentos, pendientes y riesgos detectados en la historia clínica.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {pMap.problems.map((prob) => (
                  <div key={prob.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-100 text-indigo-800 rounded">
                          {prob.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{prob.diagnosis}</h4>
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        Identificado el {prob.identifiedDate} (Pág. {prob.evidencePage})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic mb-3">"{prob.evidenceSnippet}"</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Diagnostic Tests */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-800 block mb-1.5 flex items-center gap-1">
                          <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                          Ayudas Asociadas ({prob.relatedDiagnosticTests.length})
                        </strong>
                        <ul className="space-y-1">
                          {prob.relatedDiagnosticTests.map((t, idx) => (
                            <li key={idx} className="text-slate-600 text-[11px]">
                              • <span className="font-medium text-slate-800">{t.testName}:</span> {t.status} (Pág. {t.page})
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Treatments */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-800 block mb-1.5 flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-emerald-600" />
                          Tratamientos Asociados ({prob.relatedTreatments.length})
                        </strong>
                        <ul className="space-y-1">
                          {prob.relatedTreatments.map((tr, idx) => (
                            <li key={idx} className="text-slate-600 text-[11px]">
                              • <span className="font-medium text-slate-800">{tr.treatmentName}:</span> {tr.status}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pending & Risks */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-800 block mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Pendientes y Riesgos
                        </strong>
                        <ul className="space-y-1">
                          {prob.pendingItems.map((pi, idx) => (
                            <li key={idx} className="text-amber-800 text-[11px] font-medium">
                              ⚠️ {pi.description} ({pi.daysPending} días pend.)
                            </li>
                          ))}
                          {prob.risks.map((rk, idx) => (
                            <li key={`rk-${idx}`} className="text-rose-700 text-[11px]">
                              🔴 {rk.riskType}: {rk.justification}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATRIZ DE RIESGOS DE AUDITORÍA */}
        {activeTab === 'matriz_riesgos' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Matriz Multidimensional de Riesgos de Auditoría
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Categorización exhaustiva de riesgos asistenciales, demoras en atención, estancia prolongada y costos no pertinentes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(rMap.risksByDimension).map(([dimension, dimensionRisks]) => {
                  const risks = (dimensionRisks || []) as any[];
                  if (risks.length === 0) return null;
                  return (
                    <div key={dimension} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          {dimension} ({risks.length})
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {risks.map((r: any) => (
                          <div key={r.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900">{r.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.severity === 'CRITICO' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {r.severity}
                              </span>
                            </div>
                            <p className="text-slate-600 mb-2">{r.description}</p>
                            <div className="text-[11px] text-slate-500">
                              <strong>Impacto:</strong> {r.potentialImpact}
                            </div>
                            <div className="text-[11px] text-indigo-700 font-medium mt-1">
                              <strong>Mitigación:</strong> {r.recommendedMitigation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CRONOLOGÍA ASISTENCIAL */}
        {activeTab === 'cronologia' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Línea de Tiempo y Eventos Asistenciales Documentados
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Reconstrucción cronológica objetiva de la hospitalización con folios y tipos de documento.
            </p>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {ctx.timelineEvents.map((evt) => (
                <div key={evt.id} className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs" />
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-bold text-blue-700 text-xs">{evt.date} {evt.time || ''} • {evt.eventType}</span>
                      <span className="text-[11px]">Página {evt.evidencePage} ({evt.documentType})</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AYUDAS DIAGNÓSTICAS */}
        {activeTab === 'ayudas_diagnosticas' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              Ayudas Diagnósticas, Laboratorios y Cultivos ({ctx.diagnosticTests.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Trazabilidad de ordenamiento, toma, resultado, interpretación y valores críticos reportados.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Examen / Ayuda</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Ordenado</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Interpretación Clínica</th>
                    <th className="p-3">Pág.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ctx.diagnosticTests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">
                        {t.testName}
                        {t.isCriticalValue && (
                          <span className="block text-[10px] text-rose-600 font-semibold mt-0.5">
                            🚨 Valor Crítico: {t.criticalValueDetail}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">{t.category}</td>
                      <td className="p-3 text-slate-600">{t.orderDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Completado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Realización sin resultado identificado'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-mono text-[11px]">
                        {t.clinicalInterpretation || 'Sin nota de interpretación médica'}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">Pág. {t.evidencePage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: TRATAMIENTO Y ANTIBIÓTICOS */}
        {activeTab === 'tratamiento_antibioticos' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              Terapia Farmacológica y Vigilancia de Antimicrobianos (PROA)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Control de días de tratamiento antimicrobiano, toma de cultivos previa, y pertinencia de desescalamiento a vía oral.
            </p>

            <div className="space-y-4">
              {ctx.medications.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {m.name}
                        {m.isAntibiotic && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                            ANTIBIÓTICO
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-600">
                        {m.dose} • Vía {m.route} • {m.frequency} • Desde: {m.startDate} {m.stopDate ? `hasta ${m.stopDate}` : '(Activo)'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Página {m.evidencePage}</span>
                  </div>

                  {m.antibioticDetail && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Días de Terapia:</span>
                        <strong className="text-slate-800">{m.antibioticDetail.durationDays} días</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Cultivo Previo:</span>
                        <strong className={m.antibioticDetail.cultureOrdered ? 'text-emerald-700' : 'text-rose-700'}>
                          {m.antibioticDetail.cultureOrdered ? 'Solicitado' : 'No documentado'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Antibiograma:</span>
                        <strong className={m.antibioticDetail.antibiogramReported ? 'text-emerald-700' : 'text-amber-700'}>
                          {m.antibioticDetail.antibiogramReported ? 'Reportado' : 'Pendiente de reporte'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: INTERCONSULTAS */}
        {activeTab === 'interconsultas' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Interconsultas y Especialidades ({ctx.consultations.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tiempos de respuesta de médicos especialistas y pertinencia de conceptos emitidos.
            </p>

            <div className="space-y-3">
              {ctx.consultations.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{c.specialty}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Realizada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {c.status} ({c.daysPending || 0} días pend.)
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">Motivo: {c.reason}</p>
                    <span className="text-slate-500 text-[11px]">Solicitada: {c.requestedAt} (Pág. {c.evidencePage})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ESTANCIA Y BARRERAS */}
        {activeTab === 'estancia_barreras' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-amber-600" />
              Análisis de Estancia y Barreras de Egreso
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Identificación de demoras operativas, clínicas o administrativas que prolongan innecesariamente la estancia hospitalaria.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border">
                <span className="text-xs text-slate-500 block">Días Acumulados</span>
                <strong className="text-2xl text-slate-900">{ctx.lengthOfStay} días</strong>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border">
                <span className="text-xs text-slate-500 block">Evaluación de Estancia</span>
                <strong className="text-sm text-amber-800 block mt-1">{ctx.stayEvaluation}</strong>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border">
                <span className="text-xs text-slate-500 block">Barreras Activas</span>
                <strong className="text-2xl text-rose-600">{ctx.stayBarriers.length}</strong>
              </div>
            </div>

            <div className="space-y-3">
              {ctx.stayBarriers.map((b) => (
                <div key={b.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-rose-900 uppercase">Barrera {b.type}</span>
                    <span className="text-rose-700 font-semibold">{b.impactDays} días de impacto</span>
                  </div>
                  <p className="text-slate-800 font-medium">{b.description}</p>
                  <div className="mt-2 text-slate-500 text-[11px]">
                    Responsable: <strong>{b.responsibleArea}</strong> | Pág. {b.evidencePage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: DISCREPANCIAS Y CONFLICTOS EN HC */}
        {activeTab === 'discrepancias' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-purple-600" />
              Discrepancias Documentales y Contradicciones en Historia Clínica ({ctx.discrepancies.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Contradicciones entre notas de ingreso, evoluciones médicas, enfermería o reportes paraclínicos.
            </p>

            <div className="space-y-4">
              {ctx.discrepancies.map((disc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-purple-900 text-sm">Discrepancia en: {disc.field}</span>
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded font-bold">
                      Severidad {disc.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-3">{disc.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <strong className="text-slate-800 block text-[11px] mb-1">Registro 1 (Pág. {disc.source1Page}):</strong>
                      <p className="text-slate-600 font-mono text-[11px]">"{disc.source1Text}"</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <strong className="text-slate-800 block text-[11px] mb-1">Registro 2 (Pág. {disc.source2Page}):</strong>
                      <p className="text-slate-600 font-mono text-[11px]">"{disc.source2Text}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: HALLAZGOS CONTEXTUALES CON EXPLICABILIDAD */}
        {activeTab === 'hallazgos' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                  <Filter className="w-4 h-4 text-slate-500" />
                  Filtrar por Nivel:
                </div>
                {['TODOS', 'NIVEL 1 — SEGURIDAD', 'NIVEL 2 — OPORTUNIDAD', 'NIVEL 3 — PERTINENCIA', 'NIVEL 4 — ESTANCIA', 'NIVEL 5 — CALIDAD DOCUMENTAL'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTierFilter(tier)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      selectedTierFilter === tier
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tier === 'TODOS' ? 'Todos' : tier.split('—')[1]?.trim() || tier}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Estado:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="text-xs border rounded-lg p-1.5 bg-white border-slate-300"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="PENDIENTE">Pendiente de validación</option>
                  <option value="CONFIRMADO">Confirmado por auditor</option>
                  <option value="RECHAZADO">Rechazado</option>
                  <option value="MODIFICADO">Modificado</option>
                </select>
              </div>
            </div>

            {/* Findings List */}
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <ContextualFindingCard
                  key={finding.id}
                  finding={finding}
                  onValidate={handleValidateFinding}
                  onUpdateActionStatus={handleUpdateActionStatus}
                />
              ))}

              {filteredFindings.length === 0 && (
                <div className="p-8 text-center bg-white rounded-xl border text-slate-500 text-sm">
                  No se encontraron hallazgos para el filtro seleccionado.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: PLAN DE ACCIÓN 24H */}
        {activeTab === 'plan_24h' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Planes de Acción 24 Horas Asignados ({session.actions24h.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Seguimiento estricto a compromisos de gestión asistencial con responsables y fechas límite de cumplimiento.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {session.actions24h.map((act) => (
                <div key={act.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{act.actionTitle}</strong>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        act.status === 'Cerrado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {act.status}
                      </span>
                    </div>
                    <p className="text-slate-700">{act.actionDescription}</p>
                    <div className="text-[11px] text-slate-500">
                      Responsable: <strong>{act.suggestedResponsible}</strong> | Límite: {act.deadlineDate?.slice(0, 10)}
                    </div>
                    {act.closingEvidenceSnippet && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 mt-1">
                        <strong>Evidencia de Cierre:</strong> "{act.closingEvidenceSnippet}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: FUENTES Y CRITERIOS APLICABLES */}
        {activeTab === 'fuentes_criterios' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Biblioteca Maestra: Fuentes y Criterios Evaluados para el Paciente
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Criterios normativos y guías clínicas contrastadas con el perfil del paciente ({ctx.primaryDiagnosis}).
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs">
                <strong className="text-indigo-950 font-bold block mb-2 text-sm">
                  Jerarquía y Precedencia Normativa Aplicada:
                </strong>
                <ol className="list-decimal list-inside text-indigo-900 space-y-1">
                  <li><strong>1. Guía de Auditoría Concurrente FOMAG:</strong> Criterios operativos obligatorios del contrato magisterio.</li>
                  <li><strong>2. Normativa Nacional MinSalud:</strong> Resoluciones 1995/1999, 465/2025, Decreto 780/2016.</li>
                  <li><strong>3. Guías de Práctica Clínica (IETS/MinSalud):</strong> GPC Neumonía, Sepsis, Diabetes, IAM.</li>
                  <li><strong>4. Protocolos Institucionales de la IPS:</strong> Prevalecen cuando son más exigentes en seguridad.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
