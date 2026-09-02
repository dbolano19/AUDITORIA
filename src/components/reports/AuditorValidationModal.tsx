import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Edit3,
  Save,
  ShieldCheck,
  FileText,
  UserCheck,
  Clock,
  BookOpen,
  Lock
} from 'lucide-react';
import { AuditSession } from '../../domain/models/AuditSession';
import { ContextualFinding, AuditorValidationStatus } from '../../domain/models/ContextualFinding';
import { storageService } from '../../services/storageService';

interface AuditorValidationModalProps {
  session: AuditSession;
  isOpen: boolean;
  onClose: () => void;
  onValidationComplete: (updatedSession: AuditSession) => void;
  activeUserName?: string;
  activeUserRole?: string;
}

export const AuditorValidationModal: React.FC<AuditorValidationModalProps> = ({
  session,
  isOpen,
  onClose,
  onValidationComplete,
  activeUserName = 'Dra. Patricia Charry',
  activeUserRole = 'Médico Auditor Concurrente'
}) => {
  const [findings, setFindings] = useState<ContextualFinding[]>(session.findings || []);
  const [executiveConclusion, setExecutiveConclusion] = useState<string>(
    session.auditorExecutiveConclusion ||
    `Auditoría concurrente hospitalaria finalizada. Se confirmaron los hallazgos basados en evidencia documental y normativa técnica aplicable en ${session.ipsName}. Se establecen los compromisos de gestión correspondientes.`
  );
  const [activeFindingIndex, setActiveFindingIndex] = useState<number>(0);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFinding = findings[activeFindingIndex];

  const handleUpdateStatus = (status: AuditorValidationStatus) => {
    if (!currentFinding) return;
    const updated = [...findings];
    updated[activeFindingIndex] = {
      ...currentFinding,
      auditorValidation: {
        ...currentFinding.auditorValidation,
        status,
        validatedBy: activeUserName,
        validatedAt: new Date().toISOString()
      }
    };
    setFindings(updated);
  };

  const handleUpdateField = (field: 'auditorNotes' | 'modifiedDescription', value: string) => {
    if (!currentFinding) return;
    const updated = [...findings];
    updated[activeFindingIndex] = {
      ...currentFinding,
      auditorValidation: {
        ...currentFinding.auditorValidation,
        [field]: value
      }
    };
    setFindings(updated);
  };

  const handleUpdateRecommendation = (recommendation: string) => {
    if (!currentFinding) return;
    const updated = [...findings];
    updated[activeFindingIndex] = {
      ...currentFinding,
      title: recommendation
    };
    setFindings(updated);
  };

  const pendingCount = findings.filter(f => f.auditorValidation.status === 'PENDIENTE').length;
  const confirmedCount = findings.filter(f => f.auditorValidation.status === 'CONFIRMADO').length;
  const modifiedCount = findings.filter(f => f.auditorValidation.status === 'MODIFICADO').length;
  const rejectedCount = findings.filter(f => f.auditorValidation.status === 'RECHAZADO').length;

  const handleSaveAndClose = (markAsFinal: boolean = false) => {
    if (markAsFinal && pendingCount > 0) {
      alert(`No se puede cerrar como INFORME FINAL porque existen ${pendingCount} hallazgo(s) pendientes de validación por el auditor.`);
      return;
    }

    const updatedSession: AuditSession = {
      ...session,
      findings,
      auditorExecutiveConclusion: executiveConclusion,
      status: markAsFinal ? 'Validada y Firmada' : 'En análisis IA',
      updatedAt: new Date().toISOString()
    };

    storageService.saveAuditSession(updatedSession);
    setSaveSuccessMessage('Validación guardada exitosamente en el expediente.');
    setTimeout(() => {
      onValidationComplete(updatedSession);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  VALIDACIÓN FINAL DEL AUDITOR — {session.id}
                </h2>
                <span className="text-2xs bg-cyan-900/80 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-700">
                  {session.ipsName}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Auditor: <strong className="text-white">{activeUserName}</strong> ({activeUserRole}) · Decisión vinculante sobre cada hallazgo documental.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium">
              <span>Pendientes:</span>
              <strong className={pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>{pendingCount}</strong>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2-Columns */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Finding Selector (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/70 p-4 overflow-y-auto space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span>Hallazgos a Validar ({findings.length})</span>
              <span className="text-2xs font-normal text-slate-500">Paso obligatorio</span>
            </div>

            {findings.map((f, idx) => {
              const isSelected = idx === activeFindingIndex;
              const statusBadge = 
                f.auditorValidation.status === 'CONFIRMADO' ? { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2, text: 'Confirmado' } :
                f.auditorValidation.status === 'MODIFICADO' ? { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: Edit3, text: 'Modificado' } :
                f.auditorValidation.status === 'RECHAZADO' ? { bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle, text: 'Rechazado' } :
                { bg: 'bg-amber-50 text-amber-800 border-amber-300 font-bold', icon: Clock, text: 'Pendiente' };

              const StatusIcon = statusBadge.icon;

              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFindingIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-cyan-600 shadow-md ring-1 ring-cyan-500'
                      : 'bg-white/80 hover:bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xs font-bold text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      {f.code}
                    </span>
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusBadge.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusBadge.text}</span>
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                    {f.description}
                  </p>

                  <div className="flex items-center justify-between text-2xs text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                    <span>Pág. {f.evidencePage} · {f.category}</span>
                    <span className={`font-bold ${f.isCriticalOrHighPriority ? 'text-rose-600' : 'text-slate-600'}`}>
                      {f.isCriticalOrHighPriority ? 'Crítico' : 'Moderado'}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* General Conclusion Box */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Conclusión Oficial de la Auditoría
              </label>
              <textarea
                value={executiveConclusion}
                onChange={(e) => setExecutiveConclusion(e.target.value)}
                rows={4}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                placeholder="Redacte la conclusión oficial del auditor..."
              />
            </div>
          </div>

          {/* Right Column: Finding Validation Detail (8 cols) */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-4">
            {currentFinding ? (
              <>
                {/* Header of Active Finding */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-cyan-800 uppercase tracking-wide">
                        HALLAZGO #{String(activeFindingIndex + 1).padStart(2, '0')} · {currentFinding.code}
                      </span>
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${
                        currentFinding.isCriticalOrHighPriority ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {currentFinding.isCriticalOrHighPriority ? 'Crítico' : 'Moderado'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {currentFinding.description}
                    </h3>
                  </div>

                  {/* Auditor Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus('CONFIRMADO')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        currentFinding.auditorValidation.status === 'CONFIRMADO'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmar</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('MODIFICADO')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        currentFinding.auditorValidation.status === 'MODIFICADO'
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modificar</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('RECHAZADO')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        currentFinding.auditorValidation.status === 'RECHAZADO'
                          ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>

                {/* Evidence & Normative Citation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <span>Evidencia Documental en HC (Pág. {currentFinding.evidencePage})</span>
                    </div>
                    <p className="text-blue-950 italic bg-white p-2.5 rounded-lg border border-blue-100">
                      "{currentFinding.factEvidence || currentFinding.description}"
                    </p>
                  </div>

                  <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900 mb-1">
                      <BookOpen className="w-4 h-4 text-purple-700" />
                      <span>Criterio y Fuente Normativa ({currentFinding.explainability?.ruleId || 'R-01'})</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-purple-950 space-y-1">
                      <div><strong>Fuente:</strong> {currentFinding.sourceReferences?.[0]?.sourceName || currentFinding.sourceReferences?.[0]?.name || 'Resolución 3100 de 2019'} ({currentFinding.sourceReferences?.[0]?.version || 'Vigente'})</div>
                      <div><strong>Artículo:</strong> {currentFinding.sourceReferences?.[0]?.articleOrSection || 'Estándares de Procesos Prioritarios'}</div>
                      <div><strong>Criterio:</strong> {currentFinding.criterionReferences?.[0]?.title || currentFinding.criterionEvidence || 'Pertinencia asistencial'}</div>
                    </div>
                  </div>
                </div>

                {/* Quadruple Analysis Box */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Desglose Cuádruple de Razonamiento Clínico-Auditor
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border-l-4 border-sky-500 border border-slate-200">
                      <strong className="text-sky-800 text-2xs block uppercase">1. Hecho Clínico</strong>
                      <span className="text-slate-800">{currentFinding.factEvidence || 'Hecho asistencial identificado en nota médica.'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border-l-4 border-purple-500 border border-slate-200">
                      <strong className="text-purple-800 text-2xs block uppercase">2. Criterio Normativo</strong>
                      <span className="text-slate-800">{currentFinding.criterionEvidence || 'Requerimiento técnico aplicable.'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border-l-4 border-amber-500 border border-slate-200">
                      <strong className="text-amber-800 text-2xs block uppercase">3. Comparación / Desviación</strong>
                      <span className="text-slate-800">{currentFinding.explainability?.analysisPerformed || 'Desviación documental observada.'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border-l-4 border-rose-500 border border-slate-200">
                      <strong className="text-rose-800 text-2xs block uppercase">4. Conclusión y Certeza</strong>
                      <span className="text-slate-800">{currentFinding.title} (Confianza: {Math.round((currentFinding.confidenceScore || 0.9) * 100)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Auditor Custom Notes & Recommendations */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Observación / Justificación del Auditor
                    </label>
                    <input
                      type="text"
                      value={currentFinding.auditorValidation.auditorNotes || ''}
                      onChange={(e) => handleUpdateField('auditorNotes', e.target.value)}
                      placeholder="Especifique la justificación para confirmar, modificar o rechazar este hallazgo..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Recomendación y Plan de Acción Asistencial
                    </label>
                    <textarea
                      value={currentFinding.actionPlan24h?.actionDescription || currentFinding.title || ''}
                      onChange={(e) => handleUpdateRecommendation(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500">
                Seleccione un hallazgo de la columna izquierda para validar.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-600">
            {saveSuccessMessage ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {saveSuccessMessage}
              </span>
            ) : (
              <span>
                Confirmados: <strong>{confirmedCount}</strong> · Modificados: <strong>{modifiedCount}</strong> · Rechazados: <strong>{rejectedCount}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveAndClose(false)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Guardar como Borrador</span>
            </button>

            <button
              onClick={() => handleSaveAndClose(true)}
              className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validar y Emitir como Informe Final</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
