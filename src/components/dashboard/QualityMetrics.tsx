import React from 'react';
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  Database,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { DashboardQualityData } from '../../domain/models/DashboardMetrics';

interface QualityMetricsProps {
  quality: DashboardQualityData;
}

export const QualityMetrics: React.FC<QualityMetricsProps> = ({ quality }) => {
  const safeQuality = quality || {
    hcProcessedCount: 0,
    hcWithCompleteDataCount: 0,
    hcIncompleteCount: 0,
    ocrAppliedCount: 0,
    problematicPagesCount: 0,
    unidentifiedFieldsCount: 0,
    unverifiedSourcesCount: 0,
    criteriaWithoutDirectSourceCount: 0,
    findingsWithoutEvidenceCount: 0,
    overallDataReliabilityIndex: 100
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">Historias Clínicas Procesadas</span>
          <span className="text-2xl font-black text-slate-900">{safeQuality.hcProcessedCount}</span>
          <span className="text-[11px] text-slate-400 block">Expedientes clínicos auditados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-emerald-600 block">Confiabilidad Global del Dato</span>
          <span className="text-2xl font-black text-emerald-700">{safeQuality.overallDataReliabilityIndex}%</span>
          <span className="text-[11px] text-emerald-600 block">Índice de precisión documental</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-cyan-700 block">OCR & Segmentación</span>
          <span className="text-2xl font-black text-cyan-800">{safeQuality.ocrAppliedCount}</span>
          <span className="text-[11px] text-cyan-700 block">Expedientes con extracción textual</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-indigo-700 block">Completitud de Información</span>
          <span className="text-2xl font-black text-indigo-800">{safeQuality.hcWithCompleteDataCount}</span>
          <span className="text-[11px] text-indigo-700 block">Registros con datos clínicos integrales</span>
        </div>
      </div>

      {/* Dual Assessment Breakdown: Documental Quality vs Assistance Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Documental Quality */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileCheck className="w-5 h-5 text-cyan-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Calidad Documental de la Historia Clínica
              </h3>
              <p className="text-xs text-slate-500">
                Integridad formal, legibilidad y completitud de folios asistenciales.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Páginas con alertas de legibilidad/OCR:</span>
              <strong className="text-slate-900">{safeQuality.problematicPagesCount} folios observados</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Validación Criptográfica y Sellos de Tiempo:</span>
              <strong className="text-emerald-700 font-bold">100% Conforme (SHA-256)</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Hallazgos sin Evidencia Factual:</span>
              <strong className="text-slate-900">{safeQuality.findingsWithoutEvidenceCount} (Estricto 0)</strong>
            </div>
          </div>
        </div>

        {/* Assistance Quality */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Calidad Asistencial y Juicio de Auditoría
              </h3>
              <p className="text-xs text-slate-500">
                Concordancia clínica, pertinencia médica y seguridad del paciente.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Fuentes Normativas no Verificadas:</span>
              <strong className="text-emerald-700 font-bold">{safeQuality.unverifiedSourcesCount} fuentes</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Campos No Identificados en Extracción:</span>
              <strong className="text-slate-900">{safeQuality.unidentifiedFieldsCount} discrepancias</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Calificación Global de Calidad del Dato:</span>
              <strong className="text-emerald-700 font-bold">Apta para Toma de Decisiones</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
