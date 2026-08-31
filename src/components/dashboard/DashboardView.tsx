import React, { useState } from 'react';
import {
  Users2,
  ClipboardList,
  AlertOctagon,
  AlertTriangle,
  Clock,
  FlaskConical,
  Stethoscope,
  CheckCircle2,
  Calendar,
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  FileSearch,
  Building2,
  Activity
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { IPS, User } from '../../types';

interface DashboardViewProps {
  onNavigate: (view: any) => void;
  onOpenNewAuditModal: () => void;
  onOpenNewPatientModal: () => void;
  onOpenExpediente: (auditId: string) => void;
  activeUser: User;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewAuditModal,
  onOpenNewPatientModal,
  onOpenExpediente,
  activeUser
}) => {
  const ipsList = storageService.getIPS();
  const users = storageService.getUsers();
  const audits = storageService.getAudits();
  const patients = storageService.getPatients();

  // Filters
  const [selectedIPS, setSelectedIPS] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedAuditor, setSelectedAuditor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const metrics = storageService.getDashboardMetrics({
    ipsId: selectedIPS,
    service: selectedService,
    auditorId: selectedAuditor,
    status: selectedStatus,
    startDate,
    endDate
  });

  const comparativeMatrix = storageService.getIPSComparativeMatrix();

  const resetFilters = () => {
    setSelectedIPS('all');
    setSelectedService('all');
    setSelectedAuditor('all');
    setSelectedStatus('all');
    setStartDate('');
    setEndDate('');
  };

  // Recent Audits
  const recentAudits = audits.slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Panel de Auditoría Concurrente</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
              En Vivo
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Supervisión clínica y administrativa consolidada para IPS de Barranquilla (Bonadona · Misericordia · Costa).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('audit-hc')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <FileSearch className="w-4 h-4 text-cyan-400" />
            <span>Auditar HC (PDF)</span>
          </button>

          <button
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors border border-slate-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>

          <button
            onClick={onOpenNewAuditModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ NUEVA AUDITORÍA</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Requirement 5) */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-cyan-700" />
            <span>Filtros de Auditoría Concurrente</span>
          </div>
          {(selectedIPS !== 'all' || selectedService !== 'all' || selectedAuditor !== 'all' || selectedStatus !== 'all' || startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="text-xs text-cyan-700 hover:text-cyan-900 font-medium underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* IPS Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">IPS</label>
            <select
              value={selectedIPS}
              onChange={(e) => setSelectedIPS(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todas las IPS (3)</option>
              {ipsList.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Servicio</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los servicios</option>
              <option value="UCI">UCI (Adultos / Pediátrica)</option>
              <option value="Hospitalización">Hospitalización General</option>
              <option value="Cirugía">Cirugía / Quirúrgica</option>
              <option value="Urgencias">Urgencias</option>
            </select>
          </div>

          {/* Auditor Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Auditor</label>
            <select
              value={selectedAuditor}
              onChange={(e) => setSelectedAuditor(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los auditores</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="Borrador">Borrador</option>
              <option value="En revisión">En revisión</option>
              <option value="Pendiente de validación">Pendiente de validación</option>
              <option value="Validada">Validada</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Fecha inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Fecha final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 8 Statistic Cards (Requirement 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Pacientes Auditados */}
        <div 
          onClick={() => onNavigate('patients')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-cyan-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Pacientes auditados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalPatients}</span>
            <span className="text-[11px] text-blue-700 font-medium group-hover:underline flex items-center gap-0.5">
              Ver censo <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Censo hospitalario en 3 IPS</p>
        </div>

        {/* 2. Auditorías Activas */}
        <div 
          onClick={() => onNavigate('audits')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-cyan-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Auditorías activas</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics.activeAudits}</span>
            <span className="text-[11px] text-teal-700 font-medium group-hover:underline flex items-center gap-0.5">
              Expedientes <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Abiertas / En proceso</p>
        </div>

        {/* 3. Hallazgos Críticos */}
        <div 
          onClick={() => onNavigate('findings')}
          className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 hover:border-rose-400 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-900 uppercase tracking-wide">Hallazgos críticos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700">{metrics.criticalFindings}</span>
            <span className="text-[11px] text-rose-700 font-bold group-hover:underline flex items-center gap-0.5">
              🔴 Semáforo Crítico
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Intervención médica urgente</p>
        </div>

        {/* 4. Hallazgos de Alta Prioridad */}
        <div 
          onClick={() => onNavigate('findings')}
          className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 hover:border-amber-400 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">Hallazgos alta prioridad</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{metrics.highPriorityFindings}</span>
            <span className="text-[11px] text-amber-800 font-bold group-hover:underline flex items-center gap-0.5">
              🟠 Semáforo Alto
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Gestión administrativa/asistencial</p>
        </div>

        {/* 5. Pacientes con riesgo estancia prolongada */}
        <div 
          onClick={() => onNavigate('patients')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-cyan-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Riesgo estancia prolongada</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics.prolongedStayRiskCount}</span>
            <span className="text-[11px] text-purple-700 font-medium group-hover:underline flex items-center gap-0.5">
              &gt; 7 días estancia
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Barreras y costos evitables</p>
        </div>

        {/* 6. Ayudas diagnósticas pendientes */}
        <div 
          onClick={() => onNavigate('audits')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-cyan-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ayudas dx pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics.pendingDiagAidsCount}</span>
            <span className="text-[11px] text-indigo-700 font-medium group-hover:underline flex items-center gap-0.5">
              Oportunidad
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Demorados / Pendientes de informe</p>
        </div>

        {/* 7. Interconsultas / Proc pendientes */}
        <div 
          onClick={() => onNavigate('audits')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-cyan-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Interconsultas / Proc.</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics.pendingProcsCount}</span>
            <span className="text-[11px] text-cyan-700 font-medium group-hover:underline flex items-center gap-0.5">
              Seguimiento
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Especialidades & Quirúrgicos</p>
        </div>

        {/* 8. Acciones Vencidas */}
        <div 
          onClick={() => onNavigate('actions')}
          className={`p-4 rounded-xl border transition-all shadow-xs cursor-pointer group ${
            metrics.overdueActionsCount > 0 ? 'bg-amber-500/10 border-amber-400' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Acciones vencidas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700">{metrics.overdueActionsCount}</span>
            <span className="text-[11px] text-rose-700 font-bold group-hover:underline flex items-center gap-0.5">
              Alerta de plazo
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Compromisos con fecha expirada</p>
        </div>

      </div>

      {/* Section 6: COMPARATIVO ENTRE IPS (Requirement 6) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-700" />
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Comparativo de IPS (Barranquilla, Atlántico)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Calculado dinámicamente desde base de datos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Indicador</th>
                {comparativeMatrix.map(m => (
                  <th key={m.ipsId} className="py-3 px-4 text-right">
                    {m.ipsName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <Users2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pacientes auditados</span>
                </td>
                {comparativeMatrix.map(m => (
                  <td key={m.ipsId} className="py-2.5 px-4 text-right font-medium">
                    {m.auditedPatients}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
                  <span>Auditorías activas</span>
                </td>
                {comparativeMatrix.map(m => (
                  <td key={m.ipsId} className="py-2.5 px-4 text-right font-medium">
                    {m.activeAudits}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hallazgos totales</span>
                </td>
                {comparativeMatrix.map(m => (
                  <td key={m.ipsId} className="py-2.5 px-4 text-right font-medium">
                    {m.totalFindings}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-rose-50/40">
                <td className="py-2.5 px-4 font-semibold text-rose-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Hallazgos críticos</span>
                </td>
                {comparativeMatrix.map(m => (
                  <td key={m.ipsId} className="py-2.5 px-4 text-right font-bold text-rose-700">
                    {m.criticalFindings}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Riesgo estancia prolongada</span>
                </td>
                {comparativeMatrix.map(m => (
                  <td key={m.ipsId} className="py-2.5 px-4 text-right font-medium">
                    {m.prolongedStayRisk}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Acciones pendientes</span>
                </td>
                {comparativeMatrix.map(m => (
                  <td key={m.ipsId} className="py-2.5 px-4 text-right font-medium">
                    {m.pendingActions}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-amber-50/50">
                <td className="py-2.5 px-4 font-semibold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Acciones vencidas</span>
                </td>
                {comparativeMatrix.map(m => (
                  <td key={m.ipsId} className={`py-2.5 px-4 text-right font-bold ${m.overdueActions > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                    {m.overdueActions}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audits Table & Fast Access */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-700" />
            <h3 className="font-bold text-sm text-slate-900">Auditorías Recientes</h3>
          </div>
          <button
            onClick={() => onNavigate('audits')}
            className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Código</th>
                <th className="py-2 px-3">Paciente</th>
                <th className="py-2 px-3">IPS</th>
                <th className="py-2 px-3">Tipo</th>
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Auditor</th>
                <th className="py-2 px-3">Estado</th>
                <th className="py-2 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentAudits.map(audit => {
                const patient = patients.find(p => p.id === audit.patientId);
                const ips = ipsList.find(i => i.id === audit.ipsId);
                return (
                  <tr key={audit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-cyan-800">{audit.auditCode}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {patient?.fullName || 'Paciente'}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {patient?.service} · {patient?.roomBed}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{ips?.name || audit.ipsId}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {audit.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{audit.auditDate}</td>
                    <td className="py-2.5 px-3 text-slate-700">{audit.auditorName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        audit.status === 'Validada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        audit.status === 'En revisión' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        audit.status === 'Pendiente de validación' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {audit.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onOpenExpediente(audit.id)}
                        className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                      >
                        Abrir Expediente
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
