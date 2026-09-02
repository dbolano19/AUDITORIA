import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Activity,
  History,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
  RefreshCw,
  Building2,
  UserCheck
} from 'lucide-react';
import { AuditLog, FindingTraceabilityRecord, SecurityActionType, SecurityEventResult } from '../../domain/models/AuditLog';
import { AuditSecurityEventUseCase } from '../../application/security/AuditSecurityEventUseCase';
import { storageService } from '../../services/storageService';
import { User } from '../../domain/models/User';

interface SecurityAuditLogViewProps {
  activeUser: User;
}

export const SecurityAuditLogView: React.FC<SecurityAuditLogViewProps> = ({ activeUser }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'traceability'>('events');
  const [logs, setLogs] = useState<AuditLog[]>(() => AuditSecurityEventUseCase.getAllLogs());
  const [traceability, setTraceability] = useState<FindingTraceabilityRecord[]>(() =>
    AuditSecurityEventUseCase.getAllTraceabilityRecords()
  );

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [ipsFilter, setIpsFilter] = useState<string>('ALL');

  const availableIPS = storageService.getIPS();

  const handleRefresh = () => {
    setLogs(AuditSecurityEventUseCase.getAllLogs());
    setTraceability(AuditSecurityEventUseCase.getAllTraceabilityRecords());
  };

  const filteredLogs = AuditSecurityEventUseCase.queryLogs({
    action: actionFilter as any,
    module: moduleFilter,
    result: resultFilter as any,
    ipsId: ipsFilter,
    searchTerm
  });

  const filteredTraceability = traceability.filter(t => {
    const term = searchTerm.toLowerCase();
    return (
      t.findingId.toLowerCase().includes(term) ||
      t.modifiedByUserName.toLowerCase().includes(term) ||
      t.comment.toLowerCase().includes(term) ||
      (t.reason && t.reason.toLowerCase().includes(term))
    );
  });

  const getResultBadge = (res: SecurityEventResult) => {
    switch (res) {
      case 'EXITOSO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            EXITOSO
          </span>
        );
      case 'DENEGADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <XCircle className="w-3 h-3" />
            DENEGADO
          </span>
        );
      case 'ADVERTENCIA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            ADVERTENCIA
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <AlertTriangle className="w-3 h-3" />
            ERROR
          </span>
        );
    }
  };

  const getActionColor = (action: SecurityActionType) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    if (action.includes('HC')) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    if (action.includes('FINDING')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (action.includes('DENIED') || action.includes('ALERT')) return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Historial de Seguridad y Trazabilidad (FASE 8)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  AuditLog Inmutable
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Registro criptográfico de eventos de acceso, intentos de intrusión, modificaciones clínicas y cadena de custodia documental.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar Logs</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'events'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Eventos de Seguridad ({filteredLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('traceability')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'traceability'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Trazabilidad de Hallazgos ({filteredTraceability.length})</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por usuario, recurso, detalle o código..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-700"
          />
        </div>

        {activeTab === 'events' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px]">Resultado:</span>
              <select
                value={resultFilter}
                onChange={e => setResultFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
              >
                <option value="ALL">Todos</option>
                <option value="EXITOSO">Exitoso</option>
                <option value="DENEGADO">Denegado</option>
                <option value="ADVERTENCIA">Advertencia</option>
                <option value="ERROR">Error</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px]">Módulo:</span>
              <select
                value={moduleFilter}
                onChange={e => setModuleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
              >
                <option value="ALL">Todos</option>
                <option value="Autenticación">Autenticación</option>
                <option value="Historia Clínica">Historia Clínica</option>
                <option value="Hallazgos">Hallazgos</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Usuarios">Usuarios</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px]">IPS:</span>
              <select
                value={ipsFilter}
                onChange={e => setIpsFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
              >
                <option value="ALL">Todas las sedes</option>
                {availableIPS.map(i => (
                  <option key={i.id} value={i.id}>{i.name.replace('Clínica ', '')}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'events' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Fecha y Hora</th>
                  <th className="p-3.5">Usuario / Rol</th>
                  <th className="p-3.5">Acción</th>
                  <th className="p-3.5">Módulo / Recurso</th>
                  <th className="p-3.5">IPS</th>
                  <th className="p-3.5">Resultado</th>
                  <th className="p-3.5">Detalle Seguro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No se encontraron registros de auditoría para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.userRole}</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{log.module}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]" title={log.resource}>
                          {log.resource}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {log.ipsName ? (
                          <span className="text-[11px] text-slate-700 font-medium">
                            {log.ipsName.replace('Clínica ', '')}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {getResultBadge(log.result)}
                      </td>

                      <td className="p-3.5 text-slate-600 text-[11px] max-w-xs">
                        <p className="line-clamp-2" title={log.details}>
                          {log.details}
                        </p>
                        {log.patientInternalId && (
                          <span className="text-[9px] font-mono text-cyan-700 font-bold">
                            Ref: {log.patientInternalId}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Traceability View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-700" />
                <span>Cadena de Custodia y Trazabilidad de Hallazgos Clínicos</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Cada modificación conserva: estado anterior, estado nuevo, usuario responsable, fecha y justificación clínica.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredTraceability.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay registros de trazabilidad de hallazgos para mostrar.
              </div>
            ) : (
              filteredTraceability.map(t => (
                <div key={t.id} className="p-4 hover:bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {t.findingId}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Estado previo: <strong className="text-slate-700">{t.previousStatus || 'IA Draft'}</strong>
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                        Nuevo estado: {t.newStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      {new Date(t.timestamp).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="text-[11px] text-slate-700">
                      <strong className="text-slate-900">Motivo / Justificación: </strong>
                      {t.comment}
                    </div>
                    {t.reason && (
                      <div className="text-[10px] text-slate-500">
                        <strong>Criterio normativo:</strong> {t.reason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Modificado por: <strong className="text-slate-700">{t.modifiedByUserName}</strong> ({t.modifiedByUserRole})</span>
                    </div>
                    {t.evidencePageRef && (
                      <span className="font-mono text-[10px] text-slate-400">
                        Folio referenciado: Pág. {t.evidencePageRef}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Security Disclaimer Banner (Requirement 52) */}
      <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-white">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>AVISO DE INTEGRIDAD Y ARQUITECTURA DE PRODUCCIÓN</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          En entorno de demostración, el sistema valida la autorización en la capa de casos de uso y modelos de dominio. Para despliegues en producción institucional con FOMAG, se acopla con el servicio de autenticación corporativo (OIDC / OAuth / IAM de MinSalud) y base de datos con reglas criptográficas en servidor.
        </p>
      </div>

    </div>
  );
};
