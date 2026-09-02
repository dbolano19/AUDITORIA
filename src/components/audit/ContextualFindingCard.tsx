/**
 * COMPONENT: ContextualFindingCard (FASE 5)
 * Displays an individual contextual finding with double evidence (HC page/quote + Normative criterion),
 * mandatory explainability drawer ("¿POR QUÉ SE GENERÓ ESTE HALLAZGO?"), and interactive auditor validation.
 */

import React, { useState } from 'react';
import {
  ContextualFinding,
  AuditorValidationStatus,
  ActionPlan24Hour
} from '../../domain/models/ContextualFinding';
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
  AlertTriangle
} from 'lucide-react';

interface ContextualFindingCardProps {
  finding: ContextualFinding;
  onValidate: (findingId: string, status: AuditorValidationStatus, notes?: string, modifiedText?: string) => void;
  onUpdateActionStatus?: (actionId: string, status: ActionPlan24Hour['status'], closingSnippet?: string) => void;
}

export const ContextualFindingCard: React.FC<ContextualFindingCardProps> = ({
  finding,
  onValidate,
  onUpdateActionStatus
}) => {
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [closingSnippet, setClosingSnippet] = useState('');
  const [auditorNotes, setAuditorNotes] = useState(finding.auditorValidation.auditorNotes || '');
  const [modifiedText, setModifiedText] = useState(finding.auditorValidation.modifiedDescription || finding.description);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'NIVEL 1 — SEGURIDAD':
        return 'border-l-4 border-l-rose-600 bg-rose-50/40 border-rose-200';
      case 'NIVEL 2 — OPORTUNIDAD':
        return 'border-l-4 border-l-amber-500 bg-amber-50/40 border-amber-200';
      case 'NIVEL 3 — PERTINENCIA':
        return 'border-l-4 border-l-indigo-500 bg-indigo-50/40 border-indigo-200';
      case 'NIVEL 4 — ESTANCIA':
        return 'border-l-4 border-l-sky-500 bg-sky-50/40 border-sky-200';
      case 'NIVEL 5 — CALIDAD DOCUMENTAL':
        return 'border-l-4 border-l-purple-500 bg-purple-50/40 border-purple-200';
      default:
        return 'border-l-4 border-l-slate-400 bg-slate-50 border-slate-200';
    }
  };

  const getValidationBadge = (status: AuditorValidationStatus) => {
    switch (status) {
      case 'CONFIRMADO':
        return { text: 'Validado por Auditor', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'RECHAZADO':
        return { text: 'Rechazado por Auditor', bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle };
      case 'MODIFICADO':
        return { text: 'Modificado por Auditor', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Edit3 };
      default:
        return { text: 'Pendiente de Validación Humana', bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: Clock };
    }
  };

  const valBadge = getValidationBadge(finding.auditorValidation.status);
  const ValIcon = valBadge.icon;

  return (
    <div
      id={`finding-card-${finding.id}`}
      className={`rounded-xl border shadow-xs transition-all ${getTierColor(finding.tier)} p-5`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800">
            {finding.code}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
            {finding.tier}
          </span>
          {finding.temporalStatus && (
            <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
              finding.temporalStatus === 'NUEVO'
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : finding.temporalStatus === 'ABIERTO_REINCIDENTE'
                ? 'bg-orange-50 text-orange-800 border-orange-300'
                : finding.temporalStatus === 'EMPEORADO'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              {finding.temporalStatus === 'NUEVO' ? '✨ Nuevo' : finding.temporalStatus === 'ABIERTO_REINCIDENTE' ? '🔄 Reincidente' : finding.temporalStatus === 'EMPEORADO' ? '⚠️ Empeorado' : '✅ Resuelto'}
            </span>
          )}
        </div>

        {/* Confidence & Validation Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {Math.round(finding.confidenceScore * 100)}% Confianza
          </span>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${valBadge.bg}`}>
            <ValIcon className="w-3.5 h-3.5" />
            {valBadge.text}
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mt-3">
        <h4 className="text-base font-bold text-slate-900">
          {finding.title}
        </h4>
        {isEditing ? (
          <div className="mt-2">
            <textarea
              id={`edit-desc-${finding.id}`}
              className="w-full p-2.5 text-sm border rounded-lg bg-white border-slate-300 focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                id={`cancel-edit-${finding.id}`}
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-xs border rounded-md text-slate-600 bg-white hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                id={`save-edit-${finding.id}`}
                onClick={() => {
                  onValidate(finding.id, 'MODIFICADO', auditorNotes, modifiedText);
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                Guardar Modificación
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">
            {finding.auditorValidation.modifiedDescription || finding.description}
          </p>
        )}
      </div>

      {/* Double Evidence Grid (Strict Requirement) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Primary Medical Record Evidence */}
        <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5 text-slate-800">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Evidencia en Historia Clínica (Pág. {finding.evidencePage})
            </span>
            <span className="text-slate-500 font-normal">
              {finding.documentType} ({finding.documentDate})
            </span>
          </div>
          <p className="text-xs text-slate-800 font-mono bg-slate-50 p-2 rounded border border-slate-100 line-clamp-3">
            "{finding.factEvidence}"
          </p>
        </div>

        {/* Normative / Clinical Criterion Evidence */}
        <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5 text-slate-800">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Criterio Normativo & Precedencia
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[11px] font-bold">
              {finding.sourceReferences[0]?.validityStatus || 'VIGENTE'}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-sans p-2 rounded bg-indigo-50/50 border border-indigo-100 line-clamp-3">
            <strong className="text-indigo-900">{finding.sourceReferences[0]?.sourceName}:</strong> {finding.criterionReferences[0]?.requirement || finding.criterionEvidence}
          </p>
        </div>
      </div>

      {/* Action Plan 24h Summary Bar if present */}
      {finding.actionPlan24h && (
        <div className="mt-3 bg-amber-50/90 border border-amber-300/80 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                Plan 24h: {finding.actionPlan24h.actionTitle}
              </span>
              <span className="text-xs text-amber-800">
                Responsable: <strong className="font-semibold">{finding.actionPlan24h.suggestedResponsible}</strong> | Límite: {finding.actionPlan24h.deadlineDate?.slice(0, 10)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              finding.actionPlan24h.status === 'Cerrado'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : finding.actionPlan24h.status === 'En gestión'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {finding.actionPlan24h.status}
            </span>
            {finding.actionPlan24h.status !== 'Cerrado' && onUpdateActionStatus && (
              <button
                id={`close-action-${finding.id}`}
                onClick={() => setIsActionModalOpen(true)}
                className="px-2.5 py-1 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-md font-medium"
              >
                Cerrar con Evidencia
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Interactive Bar */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Mandatory Explainability Button */}
        <button
          id={`btn-explain-${finding.id}`}
          onClick={() => setIsExplainOpen(!isExplainOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>¿POR QUÉ SE GENERÓ ESTE HALLAZGO?</span>
          {isExplainOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>

        {/* Auditor Validation Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Validación:</span>
          <button
            id={`btn-confirm-${finding.id}`}
            onClick={() => onValidate(finding.id, 'CONFIRMADO', auditorNotes)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-colors ${
              finding.auditorValidation.status === 'CONFIRMADO'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmar
          </button>

          <button
            id={`btn-reject-${finding.id}`}
            onClick={() => {
              const reason = window.prompt('Indique el motivo de rechazo del hallazgo:') || 'Descartado por criterio del médico auditor.';
              onValidate(finding.id, 'RECHAZADO', reason);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-colors ${
              finding.auditorValidation.status === 'RECHAZADO'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Rechazar
          </button>

          <button
            id={`btn-edit-${finding.id}`}
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-colors ${
              isEditing || finding.auditorValidation.status === 'MODIFICADO'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Modificar
          </button>
        </div>
      </div>

      {/* Expanded Explainability Panel */}
      {isExplainOpen && (
        <div
          id={`explain-panel-${finding.id}`}
          className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 text-xs border border-slate-800 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <h5 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              Traza Completa de Razonamiento Clínico & Normativo (FOMAG)
            </h5>
            <span className="text-[11px] font-mono text-slate-400">
              Regla ID: {finding.explainability.ruleId}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 font-semibold block">Regla Activada:</span>
                <span className="text-white font-medium">{finding.explainability.ruleName}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Motivo de Activación:</span>
                <span className="text-amber-200">{finding.explainability.activatedReason}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Contexto del Paciente:</span>
                <span className="text-slate-200">
                  {finding.explainability.patientDiagnosis} en {finding.explainability.service}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Evento Asistencial Detectado:</span>
                <span className="text-slate-200">{finding.explainability.eventDetected}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 font-semibold block">Fuente Normativa Consultada:</span>
                <span className="text-indigo-300 font-semibold">{finding.explainability.sourceUsed}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Criterio Específico de Auditoría:</span>
                <span className="text-indigo-200">{finding.explainability.criterionUsed}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Nivel de Confianza Documental:</span>
                <span className="text-emerald-400 font-bold">
                  {finding.confidenceLevel} ({Math.round(finding.confidenceScore * 100)}%) — {finding.explainability.confidenceJustification}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Guía de Verificación para el Auditor:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1">
                  {finding.explainability.auditorVerificationGuide.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {finding.auditorValidation.auditorNotes && (
            <div className="mt-3 pt-2 border-t border-slate-800 text-emerald-300">
              <strong>Nota del Auditor ({finding.auditorValidation.validatedBy}):</strong> {finding.auditorValidation.auditorNotes}
            </div>
          )}
        </div>
      )}

      {/* Action Plan Close Modal */}
      {isActionModalOpen && finding.actionPlan24h && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border">
            <h4 className="text-base font-bold text-slate-900 mb-2">
              Cerrar Plan de Acción 24h
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Principio <strong>NO EVIDENCE → NO CLAIM</strong>: Ingrese la cita textual o folio de la HC que comprueba la resolución de la situación asistencial.
            </p>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Evidencia Documental de Cierre (Cita y Número de Página) *
            </label>
            <textarea
              id="close-snippet-input"
              rows={3}
              className="w-full text-xs p-2 border rounded-lg border-slate-300 mb-3 focus:ring-2 focus:ring-amber-500"
              placeholder='Ej: "Página 18: 18/05/2025 15:00 - Nota de Neumología valora paciente y aprueba egreso con amoxicilina/clavulanato".'
              value={closingSnippet}
              onChange={(e) => setClosingSnippet(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="px-3 py-1.5 text-xs border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!closingSnippet.trim()) {
                    alert('Debe ingresar la evidencia documental para cerrar la acción.');
                    return;
                  }
                  if (onUpdateActionStatus && finding.actionPlan24h) {
                    onUpdateActionStatus(finding.actionPlan24h.id, 'Cerrado', closingSnippet);
                  }
                  setIsActionModalOpen(false);
                }}
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                Confirmar Cierre de Acción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
