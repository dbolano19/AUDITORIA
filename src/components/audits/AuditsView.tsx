import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
  UserCheck,
  FileSearch,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { reportService } from '../../services/reportService';
import { Audit, AuditType, AuditStatus, User } from '../../types';

interface AuditsViewProps {
  onOpenExpediente: (auditId: string) => void;
  onOpenNewAuditModal: () => void;
  onNavigateToAuditHC: (auditId?: string) => void;
  activeUser: User;
}

export const AuditsView: React.FC<AuditsViewProps> = ({
  onOpenExpediente,
  onOpenNewAuditModal,
  onNavigateToAuditHC,
  activeUser
}) => {
  const [audits, setAudits] = useState<Audit[]>(() => storageService.getAudits());
  const patients = storageService.getPatients();
  const ipsList = storageService.getIPS();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterIPS, setFilterIPS] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const refreshList = () => {
    setAudits(storageService.getAudits());
  };

  const handleUpdateStatus = (auditId: string, status: AuditStatus) => {
    storageService.updateAuditStatus(auditId, status);
    refreshList();
  };

  const handleExportCSV = () => {
    const csvContent = reportService.exportAuditsCSV(audits, patients, ipsList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditorias_concurrentes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAudits = audits.filter(audit => {
    const patient = patients.find(p => p.id === audit.patientId);
    const matchesSearch =
      audit.auditCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.auditorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient && patient.docNumber.includes(searchTerm));

    const matchesIPS = filterIPS === 'all' || audit.ipsId === filterIPS;
    const matchesType = filterType === 'all' || audit.type === filterType;
    const matchesStatus = filterStatus === 'all' || audit.status === filterStatus;

    return matchesSearch && matchesIPS && matchesType && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Registro y Expedientes de Auditoría Concurrente
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Consolidado general de expedientes clínicos auditados en Bonadona, Misericordia y Clínica Costa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 cursor-pointer transition-colors"
            title="Exportar a CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Exportar CSV</span>
          </button>

          {activeUser.role !== 'Consulta' && (
            <button
              onClick={onOpenNewAuditModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ NUEVA AUDITORÍA</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, paciente, cédula o auditor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={filterIPS}
              onChange={(e) => setFilterIPS(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
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
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los tipos de auditoría</option>
              <option value="Ingreso">Ingreso</option>
              <option value="Seguimiento diario">Seguimiento diario</option>
              <option value="Revisión de estancia">Revisión de estancia</option>
              <option value="Auditoría completa">Auditoría completa</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="Borrador">Borrador</option>
              <option value="En revisión">En revisión</option>
              <option value="Pendiente de validación">Pendiente de validación</option>
              <option value="Validada">Validada</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </div>

        </div>
      </div>

      {/* Audits Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3">Código Auditoría</th>
                <th className="py-3 px-3">Paciente</th>
                <th className="py-3 px-3">IPS & Servicio</th>
                <th className="py-3 px-3">Tipo Auditoría</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Auditor Asignado</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAudits.map(audit => {
                const patient = patients.find(p => p.id === audit.patientId);
                const ips = ipsList.find(i => i.id === audit.ipsId);
                const docsCount = storageService.getDocuments(audit.id).length;
                const findingsCount = storageService.getFindings(audit.id).length;

                return (
                  <tr key={audit.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Code & Docs Badge */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-cyan-800 block">{audit.auditCode}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span>{docsCount} doc(s)</span>
                        <span>·</span>
                        <span className={findingsCount > 0 ? 'text-amber-700 font-semibold' : ''}>{findingsCount} hallazgo(s)</span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{patient?.fullName || 'Paciente'}</div>
                      <div className="text-[11px] text-slate-500">
                        {patient?.docType} {patient?.docNumber} · {patient?.roomBed}
                      </div>
                    </td>

                    {/* IPS */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{ips?.name || audit.ipsId}</div>
                      <div className="text-[11px] text-slate-500">{patient?.service}</div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {audit.type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{audit.auditDate}</span>
                      </div>
                    </td>

                    {/* Auditor */}
                    <td className="py-3 px-3 text-slate-800">
                      <div className="font-medium">{audit.auditorName}</div>
                      {audit.validatedBy && (
                        <div className="text-[10px] text-emerald-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Val: {audit.validatedBy}</span>
                        </div>
                      )}
                    </td>

                    {/* Status Dropdown for Auditor/Coordinator */}
                    <td className="py-3 px-3">
                      {activeUser.role === 'Administrador' || activeUser.role === 'Coordinador' || activeUser.role === 'Supervisor' || activeUser.role === 'Auditor' ? (
                        <select
                          value={audit.status}
                          onChange={(e) => handleUpdateStatus(audit.id, e.target.value as AuditStatus)}
                          className={`text-[11px] font-semibold rounded-md px-2 py-1 border focus:outline-none cursor-pointer ${
                            audit.status === 'Validada'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : audit.status === 'En revisión'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : audit.status === 'Pendiente de validación'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : audit.status === 'Cerrada'
                              ? 'bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Borrador">Borrador</option>
                          <option value="En revisión">En revisión</option>
                          <option value="Pendiente de validación">Pendiente de validación</option>
                          <option value="Validada">Validada</option>
                          <option value="Cerrada">Cerrada</option>
                        </select>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {audit.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenExpediente(audit.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                        >
                          <span>Expediente (14)</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
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
