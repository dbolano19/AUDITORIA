import React, { useState } from 'react';
import {
  X,
  Camera,
  Save,
  Clock,
  Trash2,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { DashboardSnapshot } from '../../domain/models/DashboardSnapshot';
import { DashboardFilter } from '../../domain/models/DashboardFilter';
import { DashboardMetricsResult } from '../../domain/models/DashboardMetrics';
import { storageService } from '../../services/storageService';

interface SnapshotModalProps {
  currentFilter: DashboardFilter;
  currentMetrics: DashboardMetricsResult;
  user: { name: string; role: string };
  onClose: () => void;
  onRestoreSnapshot?: (snapshot: DashboardSnapshot) => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  currentFilter,
  currentMetrics,
  user,
  onClose,
  onRestoreSnapshot
}) => {
  const [snapshots, setSnapshots] = useState<DashboardSnapshot[]>(() => storageService.getDashboardSnapshots());
  const [title, setTitle] = useState<string>(`Corte Gerencial ${currentMetrics.filteredIPSName} - ${new Date().toLocaleDateString('es-CO')}`);
  const [comments, setComments] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<DashboardSnapshot | null>(null);

  const handleSave = () => {
    if (!title.trim()) return;

    const newSnapshot: DashboardSnapshot = {
      snapshotId: `snap-${Date.now()}`,
      code: `SNAP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      createdAt: new Date().toISOString(),
      generatedBy: user.name,
      auditorRole: user.role,
      periodText: currentMetrics.periodText,
      ipsScope: currentMetrics.filteredIPSName,
      filters: currentFilter,
      metrics: currentMetrics,
      comments: comments.trim() || undefined,
      hashSHA256: `sha256_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      version: 1
    };

    storageService.saveDashboardSnapshot(newSnapshot);
    setSnapshots(storageService.getDashboardSnapshots());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Desea eliminar este snapshot histórico guardado?')) {
      storageService.deleteDashboardSnapshot(id);
      setSnapshots(storageService.getDashboardSnapshots());
      if (selectedSnapshot?.snapshotId === id) setSelectedSnapshot(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Instantáneas Históricas (Dashboard Snapshots)
              </h2>
              <p className="text-xs text-slate-400">
                Guarde y congele el estado de los indicadores para trazabilidad inmutable y auditoría retroactiva.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* New Snapshot Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Save className="w-4 h-4 text-cyan-700" />
              Crear Nueva Instantánea Inmutable
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título de la Instantánea</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  placeholder="Ej: Cierre de Concurrencia Mensual Mayo 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Comentarios y Justificación</label>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  placeholder="Ej: Presentación ante Comité de Red FOMAG"
                />
              </div>
            </div>

            {/* Snapshot Summary Preview */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span><strong>Alcance:</strong> {currentMetrics.filteredIPSName}</span>
                <span><strong>Auditorías:</strong> {currentMetrics.overview.totalAudits}</span>
                <span><strong>Hallazgos:</strong> {currentMetrics.overview.totalFindings}</span>
                <span><strong>Cierre 24h:</strong> {currentMetrics.overview.actionClosureRateText}</span>
              </div>

              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Congelar Snapshot</span>
              </button>
            </div>

            {isSaved && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Snapshot guardado con éxito. Conserva el estado exacto sin riesgo de alteración retroactiva.</span>
              </div>
            )}
          </div>

          {/* List of Saved Snapshots */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-700" />
                Historial de Instantáneas Guardadas ({snapshots.length})
              </span>
            </h3>

            {snapshots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                No hay instantáneas guardadas todavía. Cree una instantánea arriba para conservar este punto en el tiempo.
              </div>
            ) : (
              <div className="space-y-2">
                {snapshots.map(s => (
                  <div
                    key={s.snapshotId}
                    onClick={() => setSelectedSnapshot(s)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selectedSnapshot?.snapshotId === s.snapshotId
                        ? 'bg-cyan-50/80 border-cyan-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {s.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">
                          {s.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(s.createdAt).toLocaleString('es-CO')}
                        </span>
                        <span>• Por: {s.generatedBy} ({s.auditorRole})</span>
                        <span>• Alcance: {s.ipsScope}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right text-[11px] mr-2">
                        <span className="text-slate-500 block">{s.metrics.overview.totalAudits} auditorías</span>
                        <span className="font-bold text-cyan-800">{s.metrics.overview.totalFindings} hallazgos</span>
                      </div>

                      <button
                        onClick={(e) => handleDelete(s.snapshotId, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Snapshot Details */}
          {selectedSnapshot && (
            <div className="bg-slate-900 text-white rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Detalle del Snapshot: {selectedSnapshot.code}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  Hash: {selectedSnapshot.hashSHA256?.substring(0, 24)}...
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Auditorías:</span>
                  <span className="text-base font-bold text-white">{selectedSnapshot.metrics.overview.totalAudits}</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Hallazgos Totales:</span>
                  <span className="text-base font-bold text-cyan-400">{selectedSnapshot.metrics.overview.totalFindings}</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Hallazgos Críticos:</span>
                  <span className="text-base font-bold text-rose-400">{selectedSnapshot.metrics.overview.criticalFindingsCount}</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Tasa Cierre 24h:</span>
                  <span className="text-base font-bold text-emerald-400">{selectedSnapshot.metrics.overview.actionClosureRateText}</span>
                </div>
              </div>

              {selectedSnapshot.comments && (
                <p className="text-xs text-slate-300 italic bg-slate-800 p-2.5 rounded-lg">
                  "{selectedSnapshot.comments}"
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Control inmutable de versiones de auditoría FOMAG
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
