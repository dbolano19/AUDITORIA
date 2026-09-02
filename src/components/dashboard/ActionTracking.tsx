import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Building2,
  UserCheck,
  Calendar,
  Filter,
  FileCheck,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { DashboardAction24hItem } from '../../domain/models/DashboardMetrics';

interface ActionTrackingProps {
  actions: DashboardAction24hItem[];
  onActionClick?: (action: DashboardAction24hItem) => void;
}

export const ActionTracking: React.FC<ActionTrackingProps> = ({
  actions,
  onActionClick
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ipsFilter, setIpsFilter] = useState<string>('all');

  const filtered = actions.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (ipsFilter !== 'all' && a.ipsName !== ipsFilter) return false;
    return true;
  });

  const total = actions.length;
  const closed = actions.filter(a => a.status === 'Cerrada').length;
  const inProgress = actions.filter(a => a.status === 'En progreso').length;
  const overdue = actions.filter(a => a.status === 'Vencida').length;
  const complianceRate = total > 0 ? ((closed / total) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6">
      
      {/* 4 Overview Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Acciones 24h</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{total}</span>
          <span className="text-[11px] text-slate-400">Compromisos asistenciales</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block">Cerradas con Evidencia</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{closed}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">{complianceRate}% cumplimiento</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block">En Proceso / Vía 24h</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{inProgress}</span>
          <span className="text-[11px] text-slate-400">Dentro del plazo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 block">Acciones Vencidas (&gt;24h)</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{overdue}</span>
          <span className="text-[11px] text-rose-600 font-semibold">Alerta de escalamiento</span>
        </div>
      </div>

      {/* Action Table & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 md:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-700" />
              <span>Tablero de Seguimiento de Acciones 24 Horas</span>
            </h3>
            <p className="text-xs text-slate-500">
              Monitoreo de compromisos de resolución asistencial inmediata acordados con las IPS.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="Cerrada">Cerrada</option>
              <option value="En progreso">En progreso</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Vencida">Vencida</option>
            </select>

            <select
              value={ipsFilter}
              onChange={(e) => setIpsFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todas las IPS</option>
              <option value="Clínica Bonadona">Clínica Bonadona</option>
              <option value="Clínica de la Misericordia Internacional">Clínica de la Misericordia</option>
              <option value="Clínica Costa">Clínica Costa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Código / Prioridad</th>
                <th className="p-3.5">IPS y Servicio</th>
                <th className="p-3.5">Hallazgo Asociado y Acción Exigida</th>
                <th className="p-3.5">Responsable</th>
                <th className="p-3.5">Plazo Límite</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5">Evidencia de Cierre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((action) => (
                <tr
                  key={action.actionId}
                  onClick={() => onActionClick && onActionClick(action)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 font-mono">
                    <span className="font-bold text-slate-900 block">{action.actionCode}</span>
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                      action.priority === 'CRITICA' || action.priority === 'ALTA'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {action.priority}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 block">{action.ipsName}</span>
                    <span className="text-[11px] text-slate-500">{action.service}</span>
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <span className="font-semibold text-slate-900 block truncate">{action.findingTitle}</span>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {action.actionRequired}
                    </p>
                  </td>

                  <td className="p-3.5 text-slate-700 font-medium">
                    {action.suggestedResponsible}
                  </td>

                  <td className="p-3.5 text-slate-600 font-mono">
                    {action.deadlineDate}
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                      action.status === 'Cerrada' ? 'bg-emerald-100 text-emerald-800' :
                      action.status === 'Vencida' ? 'bg-rose-100 text-rose-800' :
                      action.status === 'En progreso' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {action.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-[11px] text-slate-600 max-w-xs">
                    {action.closingEvidence ? (
                      <span className="text-emerald-800 bg-emerald-50 p-1.5 rounded block border border-emerald-200">
                        {action.closingEvidence}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Pendiente de soporte</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
