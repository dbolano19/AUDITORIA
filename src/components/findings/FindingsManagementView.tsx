import React, { useState } from 'react';
import {
  AlertOctagon,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Users2,
  FileSpreadsheet
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Finding, FindingType, FindingPriority, FindingStatus, User } from '../../types';

interface FindingsManagementViewProps {
  onOpenExpediente: (auditId: string) => void;
  activeUser: User;
}

export const FindingsManagementView: React.FC<FindingsManagementViewProps> = ({
  onOpenExpediente,
  activeUser
}) => {
  const [findings, setFindings] = useState<Finding[]>(() => storageService.getFindings());
  const patients = storageService.getPatients();
  const ipsList = storageService.getIPS();
  const audits = storageService.getAudits();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterIPS, setFilterIPS] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const refreshList = () => {
    setFindings(storageService.getFindings());
  };

  const handleUpdateStatus = (findingId: string, status: FindingStatus) => {
    storageService.updateFindingStatus(findingId, status);
    refreshList();
  };

  const filtered = findings.filter(f => {
    const patient = patients.find(p => p.id === f.patientId);
    const matchesSearch =
      f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIPS = filterIPS === 'all' || f.ipsId === filterIPS;
    const matchesType = filterType === 'all' || f.type === filterType;
    const matchesPriority = filterPriority === 'all' || f.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;

    return matchesSearch && matchesIPS && matchesType && matchesPriority && matchesStatus;
  });

  const criticalCount = findings.filter(f => f.priority === 'Crítica').length;
  const highCount = findings.filter(f => f.priority === 'Alta').length;
  const openCount = findings.filter(f => f.status === 'Abierto' || f.status === 'En gestión').length;
  const resolvedCount = findings.filter(f => f.status === 'Resuelto').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Módulo de Hallazgos y Desviaciones Clínicas
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Matriz global de hallazgos tipificados con semáforo de prioridad e impacto asistencial y financiero.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Hallazgos</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{findings.length}</div>
          <span className="text-[11px] text-slate-500">Registrados en 3 IPS</span>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-900 uppercase">🔴 Críticos (Urgente)</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{criticalCount}</div>
          <span className="text-[11px] text-rose-800">Riesgo asistencial directo</span>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-900 uppercase">🟠 Alta Prioridad</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{highCount}</div>
          <span className="text-[11px] text-amber-800">Oportunidad y pertinencia</span>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-900 uppercase">🟢 Resueltos</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</div>
          <span className="text-[11px] text-emerald-800">Gestión efectiva</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, paciente o texto..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            />
          </div>

          <div>
            <select
              value={filterIPS}
              onChange={e => setFilterIPS(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              <option value="all">Todas las IPS</option>
              {ipsList.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              <option value="all">Todos los tipos</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Asistencial">Asistencial</option>
              <option value="Pertinencia">Pertinencia</option>
              <option value="Oportunidad">Oportunidad</option>
              <option value="Calidad del registro">Calidad del registro</option>
              <option value="Seguridad">Seguridad del paciente</option>
              <option value="Financiero">Financiero</option>
            </select>
          </div>

          <div>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              <option value="all">Todas las prioridades</option>
              <option value="Crítica">🔴 Crítica</option>
              <option value="Alta">🟠 Alta</option>
              <option value="Media">🟡 Media</option>
              <option value="Baja">🟢 Baja</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              <option value="all">Todos los estados</option>
              <option value="Abierto">Abierto</option>
              <option value="En gestión">En gestión</option>
              <option value="Resuelto">Resuelto</option>
              <option value="Desestimado">Desestimado</option>
            </select>
          </div>

        </div>
      </div>

      {/* Findings Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3">Código & Tipo</th>
                <th className="py-3 px-3">Prioridad</th>
                <th className="py-3 px-3">Paciente & IPS</th>
                <th className="py-3 px-3">Descripción del Hallazgo</th>
                <th className="py-3 px-3">Evidencia Documental</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(f => {
                const patient = patients.find(p => p.id === f.patientId);
                const ips = ipsList.find(i => i.id === f.ipsId);

                return (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900">{f.code}</div>
                      <span className="inline-flex text-[10px] font-semibold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                        {f.type}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.priority === 'Crítica' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        f.priority === 'Alta' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        f.priority === 'Media' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {f.priority === 'Crítica' ? '🔴 ' : f.priority === 'Alta' ? '🟠 ' : f.priority === 'Media' ? '🟡 ' : '🟢 '}
                        {f.priority}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{patient?.fullName || f.patientId}</div>
                      <div className="text-[11px] text-slate-500">{ips?.name} · {f.service}</div>
                    </td>

                    <td className="py-3 px-3 max-w-[300px]">
                      <p className="text-slate-800 font-medium line-clamp-2" title={f.description}>
                        {f.description}
                      </p>
                      {f.financialImpact && (
                        <span className="block text-[10px] text-rose-700 font-semibold mt-0.5">
                          Financiero: {f.financialImpact}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-[200px]">
                      <span className="line-clamp-2">{f.evidence}</span>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={f.status}
                        onChange={e => handleUpdateStatus(f.id, e.target.value as FindingStatus)}
                        className={`text-[11px] font-bold rounded px-2 py-1 border focus:outline-none cursor-pointer ${
                          f.status === 'Resuelto' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          f.status === 'En gestión' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          f.status === 'Desestimado' ? 'bg-slate-200 text-slate-700 border-slate-300' :
                          'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En gestión">En gestión</option>
                        <option value="Resuelto">Resuelto</option>
                        <option value="Desestimado">Desestimado</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenExpediente(f.auditId)}
                        className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Ver Expediente
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
