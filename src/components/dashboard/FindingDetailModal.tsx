import React from 'react';
import {
  X,
  ShieldAlert,
  FileText,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { ContextualFinding } from '../../domain/models/ContextualFinding';

interface FindingDetailModalProps {
  finding: ContextualFinding | null;
  ipsName?: string;
  patientDocMasked?: string;
  service?: string;
  onClose: () => void;
  onOpenAudit?: (auditId: string) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  ipsName = 'Clínica Bonadona',
  patientDocMasked = 'CC ***912',
  service = 'Hospitalización',
  onClose
}) => {
  if (!finding) return null;

  const isCritical = finding.isCriticalOrHighPriority || finding.tier === 'NIVEL 1 — SEGURIDAD';
  const validationStatus = finding.auditorValidation?.status || 'PENDIENTE';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-900/80 text-cyan-300 border border-cyan-700">
                {finding.code || 'HALL-01'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isCritical ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {finding.tier || (isCritical ? 'Crítico / Prioritario' : 'Moderado')}
              </span>
              <span className="text-xs text-slate-400">
                • {finding.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {finding.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">IPS Auditada:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-700" />
                {ipsName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Paciente (Anonimizado):</span>
              <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                {patientDocMasked}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Servicio:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                {service}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Estado Validación:</span>
              <span className={`inline-flex items-center gap-1 font-bold mt-0.5 ${
                validationStatus === 'CONFIRMADO' ? 'text-emerald-700' :
                validationStatus === 'MODIFICADO' ? 'text-cyan-700' :
                validationStatus === 'RECHAZADO' ? 'text-rose-700' : 'text-amber-700'
              }`}>
                {validationStatus}
              </span>
            </div>
          </div>

          {/* Clinical Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-700" />
              Descripción Factual del Hallazgo
            </h3>
            <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
              {finding.description}
            </p>
          </div>

          {/* Dual Referencing: Documentary Evidence Snippet & Page */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-700" />
              Evidencia Documental en Historia Clínica
            </h3>
            <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
                <span>Documento: {finding.documentType || 'Evolución Médica / Órdenes'}</span>
                <span className="bg-indigo-200/80 px-2 py-0.5 rounded text-indigo-950 font-mono">
                  Página HC: {finding.pageNumber || 'pág. 14'}
                </span>
              </div>
              <p className="text-xs text-indigo-950 italic bg-white/80 p-2.5 rounded-lg border border-indigo-100 font-mono">
                "{finding.evidenceSnippet || 'Paciente en día 8 de estancia con disnea moderada; pendiente entrega de hemocultivos y valoración especializada...'}"
              </p>
            </div>
          </div>

          {/* Dual Referencing: Normative Criterion & Source */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Criterio y Fuente Normativa Aplicable
            </h3>
            <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-1 text-xs text-emerald-950">
              <p className="font-semibold text-emerald-900">
                {finding.criterionEvidence || 'Resolución 3100 de 2019 — Estándar de Procesos Asistenciales y Oportunidad'}
              </p>
              <p className="text-emerald-800">
                {finding.explainability?.normativeGrounding || 'Lineamiento Técnico de Concurrencia FOMAG: Seguimiento de oportunidad en respuesta especializada e inicio de terapia dirigida en 24h.'}
              </p>
            </div>
          </div>

          {/* 24-Hour Action Plan */}
          {finding.recommendedAction && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-700" />
                Plan de Acción y Recomendación Asistencial
              </h3>
              <div className="bg-cyan-50/60 border border-cyan-200 p-3.5 rounded-xl text-xs text-cyan-950 space-y-1">
                <p className="font-semibold text-cyan-900">Acción sugerida:</p>
                <p className="text-cyan-950">{finding.recommendedAction}</p>
                <div className="flex items-center gap-4 pt-1 text-[11px] text-cyan-800">
                  <span>Responsable: Coordinación Médica / Auditor Concurrente</span>
                  <span>Plazo: Inmediato (24h)</span>
                </div>
              </div>
            </div>
          )}

          {/* Auditor Validation Details */}
          <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1 text-slate-900">
                <UserCheck className="w-4 h-4 text-slate-700" />
                Validado por: {finding.auditorValidation?.validatedBy || 'Dr. Alejandro Morales'}
              </span>
              <span className="text-slate-500 font-mono">
                {finding.auditorValidation?.validatedAt ? new Date(finding.auditorValidation.validatedAt).toLocaleString('es-CO') : '2025-05-18 10:45'}
              </span>
            </div>
            {finding.auditorValidation?.auditorNotes && (
              <p className="text-slate-600 italic">
                Nota del auditor: "{finding.auditorValidation.auditorNotes}"
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Drill-down contextual de hallazgo clínico FOMAG
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar Detalle
          </button>
        </div>

      </div>
    </div>
  );
};
