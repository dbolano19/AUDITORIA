import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  ClipboardList,
  Bed,
  Building2,
  Clock,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Patient, IdentificationType, PatientStatus, User } from '../../types';
import { AuthorizeActionUseCase } from '../../application/auth/AuthorizeActionUseCase';

interface PatientsViewProps {
  onSelectPatient: (patient: Patient) => void;
  onOpenNewAuditForPatient: (patientId: string) => void;
  onOpenExpedienteForPatient: (patientId: string) => void;
  activeUser: User;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onSelectPatient,
  onOpenNewAuditForPatient,
  onOpenExpedienteForPatient,
  activeUser
}) => {
  const [patients, setPatients] = useState<Patient[]>(() => storageService.getPatients());
  const ipsList = storageService.getIPS();
  const audits = storageService.getAudits();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterIPS, setFilterIPS] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [hideSensitiveInfo, setHideSensitiveInfo] = useState<boolean>(false);

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState<Partial<Patient>>({
    docType: 'CC',
    docNumber: '',
    fullName: '',
    age: 45,
    sex: 'M',
    originDepartment: 'Atlántico',
    originMunicipality: 'Barranquilla',
    ipsId: ipsList[0]?.id || 'ips-bonadona',
    service: 'UCI Adultos',
    roomBed: 'Cama 01',
    admissionDate: new Date().toISOString().split('T')[0],
    mainDiagnosis: '',
    secondaryDiagnoses: [],
    attendingPhysician: '',
    status: 'Hospitalizado',
    triageLevel: 'II - Emergencia',
    eps: 'Sura EPS'
  });

  const refreshList = () => {
    setPatients(storageService.getPatients());
  };

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setFormData({
      internalId: `PAC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      docType: 'CC',
      docNumber: '',
      fullName: '',
      age: 50,
      sex: 'M',
      originDepartment: 'Atlántico',
      originMunicipality: 'Barranquilla',
      ipsId: ipsList[0]?.id || 'ips-bonadona',
      service: 'UCI Adultos',
      roomBed: 'Cama 05',
      admissionDate: new Date().toISOString().split('T')[0],
      mainDiagnosis: '',
      secondaryDiagnoses: ['Hipertensión arterial'],
      attendingPhysician: '',
      status: 'Hospitalizado',
      triageLevel: 'II - Emergencia',
      eps: 'Sura EPS'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({ ...patient });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim() || !formData.docNumber?.trim()) return;

    const ips = ipsList.find(i => i.id === formData.ipsId);

    const patientToSave: Patient = {
      id: editingPatient ? editingPatient.id : `pat-${Date.now()}`,
      internalId: formData.internalId || `PAC-${Date.now().toString().slice(-4)}`,
      docType: (formData.docType as IdentificationType) || 'CC',
      docNumber: formData.docNumber.trim(),
      fullName: formData.fullName.trim(),
      age: Number(formData.age) || 0,
      sex: (formData.sex as 'M' | 'F' | 'Otro') || 'M',
      originDepartment: formData.originDepartment || 'Atlántico',
      originMunicipality: formData.originMunicipality || 'Barranquilla',
      ipsId: formData.ipsId || 'ips-bonadona',
      ipsName: ips?.name || 'IPS Seleccionada',
      service: formData.service || 'Hospitalización',
      roomBed: formData.roomBed || 'Cama',
      admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
      mainDiagnosis: formData.mainDiagnosis || 'En estudio',
      secondaryDiagnoses: formData.secondaryDiagnoses || [],
      attendingPhysician: formData.attendingPhysician || 'Médico Tratante',
      status: (formData.status as PatientStatus) || 'Hospitalizado',
      triageLevel: formData.triageLevel,
      eps: formData.eps
    };

    storageService.savePatient(patientToSave);
    setIsModalOpen(false);
    refreshList();
  };

  const filteredPatients = patients.filter(patient => {
    // Phase 8: Strict IPS Segregation Check
    const hasIPSAccess = AuthorizeActionUseCase.canAccessIPS(activeUser as any, patient.ipsId);
    if (!hasIPSAccess) return false;

    const matchesSearch =
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.docNumber.includes(searchTerm) ||
      patient.internalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mainDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIPS = filterIPS === 'all' || patient.ipsId === filterIPS;
    const matchesService = filterService === 'all' || patient.service.toLowerCase().includes(filterService.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;

    return matchesSearch && matchesIPS && matchesService && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestión de Pacientes y Censo Hospitalario
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Población hospitalaria activa y auditorías concurrentes en curso.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Toggle (Requirement 8) */}
          <button
            onClick={() => setHideSensitiveInfo(!hideSensitiveInfo)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              hideSensitiveInfo
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Ocultar o mostrar datos sensibles de identificación"
          >
            {hideSensitiveInfo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{hideSensitiveInfo ? 'Privacidad: Enmascarada' : 'Modo Seguro'}</span>
          </button>

          {activeUser.role !== 'Consulta' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ REGISTRAR PACIENTE</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o diagnóstico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            />
          </div>

          {/* IPS Filter */}
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

          {/* Service Filter */}
          <div>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los servicios</option>
              <option value="UCI">UCI</option>
              <option value="Hospitalización">Hospitalización General</option>
              <option value="Quirúrgica">Cirugía / Quirúrgica</option>
              <option value="Gineco">Gineco-Obstetricia</option>
              <option value="Pediátrica">Pediatría</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="Hospitalizado">Hospitalizado</option>
              <option value="Alta">Alta</option>
              <option value="Traslado">Traslado</option>
              <option value="Fallecido">Fallecido</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3">Estado / Semáforo</th>
                <th className="py-3 px-3">Paciente</th>
                <th className="py-3 px-3">Identificación</th>
                <th className="py-3 px-3">IPS & Servicio</th>
                <th className="py-3 px-3">Cama</th>
                <th className="py-3 px-3">Ingreso / Estancia</th>
                <th className="py-3 px-3">Diagnóstico Principal</th>
                <th className="py-3 px-3">Auditorías</th>
                <th className="py-3 px-3 text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPatients.map(patient => {
                const stayDays = storageService.calculateStayDays(patient.admissionDate);
                const semaphore = storageService.getPatientSummarySemaphore(patient.id);
                const patientAudits = audits.filter(a => a.patientId === patient.id);
                const latestAudit = patientAudits[0];

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Semaphore */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {semaphore === 'red' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            🔴 Crítico
                          </span>
                        )}
                        {semaphore === 'amber' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            🟠 Pendiente
                          </span>
                        )}
                        {semaphore === 'green' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            🟢 Estable
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Full Name & Age */}
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="text-left hover:text-cyan-700 hover:underline cursor-pointer font-bold"
                      >
                        {hideSensitiveInfo
                          ? patient.fullName.replace(/(?<=.).(?=.)/g, '*')
                          : patient.fullName}
                      </button>
                      <span className="block text-[11px] text-slate-500 font-normal">
                        {patient.age} años · {patient.sex === 'M' ? 'Masculino' : patient.sex === 'F' ? 'Femenino' : 'Otro'} · {patient.eps}
                      </span>
                    </td>

                    {/* Doc Type & Number */}
                    <td className="py-3 px-3 text-slate-700 font-mono text-[11px]">
                      {hideSensitiveInfo
                        ? `${patient.docType} *******`
                        : `${patient.docType} ${patient.docNumber}`}
                      <span className="block text-[10px] text-slate-400 font-sans">
                        {patient.originMunicipality}, {patient.originDepartment}
                      </span>
                    </td>

                    {/* IPS & Service */}
                    <td className="py-3 px-3 text-slate-800">
                      <span className="font-semibold block">{patient.ipsName}</span>
                      <span className="text-slate-500 text-[11px]">{patient.service}</span>
                    </td>

                    {/* Bed */}
                    <td className="py-3 px-3 font-medium text-slate-700">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span>{patient.roomBed}</span>
                      </div>
                    </td>

                    {/* Admission & Stay Days */}
                    <td className="py-3 px-3">
                      <span className="text-slate-700 block">{patient.admissionDate}</span>
                      <span className={`text-[11px] font-bold ${stayDays > 7 ? 'text-amber-700' : 'text-slate-900'}`}>
                        {stayDays} días de estancia
                      </span>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <span className="font-medium text-slate-800 line-clamp-2" title={patient.mainDiagnosis}>
                        {patient.mainDiagnosis}
                      </span>
                      {patient.secondaryDiagnoses && patient.secondaryDiagnoses.length > 0 && (
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          Sec: {patient.secondaryDiagnoses.join(', ')}
                        </span>
                      )}
                    </td>

                    {/* Audits status */}
                    <td className="py-3 px-3">
                      {patientAudits.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          <ClipboardList className="w-3 h-3 text-cyan-700" />
                          <span>{patientAudits.length} reg. ({latestAudit?.status})</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Sin auditoría</span>
                      )}
                    </td>

                    {/* Actions (Fast 3-click guarantee) */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {latestAudit ? (
                          <button
                            onClick={() => onOpenExpedienteForPatient(patient.id)}
                            className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                            title="Abrir expediente de auditoría"
                          >
                            Expediente
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenNewAuditForPatient(patient.id)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                            title="Crear primera auditoría"
                          >
                            + Auditar
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(patient)}
                          className="p-1 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 cursor-pointer"
                          title="Editar datos del paciente"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
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

      {/* Modal Create / Edit Patient */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users2 className="w-4 h-4 text-cyan-700" />
                <span>{editingPatient ? 'Editar Paciente' : 'Registrar Nuevo Paciente (Censo)'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Row 1: Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento *</label>
                  <select
                    value={formData.docType || 'CC'}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value as IdentificationType })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="TI">Tarjeta de Identidad (TI)</option>
                    <option value="RC">Registro Civil (RC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PA">Pasaporte (PA)</option>
                    <option value="MS">Menor sin Identificación (MS)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1047483920"
                    value={formData.docNumber || ''}
                    onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Interno Hospitalario</label>
                  <input
                    type="text"
                    placeholder="PAC-2025-001"
                    value={formData.internalId || ''}
                    onChange={(e) => setFormData({ ...formData, internalId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Full Name, Age, Sex */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Alberto Vives Meza (Ficticio)"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Edad</label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={formData.sex || 'M'}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Origin Location & EPS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento de Procedencia</label>
                  <input
                    type="text"
                    value={formData.originDepartment || 'Atlántico'}
                    onChange={(e) => setFormData({ ...formData, originDepartment: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Municipio</label>
                  <input
                    type="text"
                    value={formData.originMunicipality || 'Barranquilla'}
                    onChange={(e) => setFormData({ ...formData, originMunicipality: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asegurador (EPS)</label>
                  <input
                    type="text"
                    placeholder="Ej. Sura EPS, Sanitas, Nueva EPS"
                    value={formData.eps || 'Sura EPS'}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Hospital Location */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IPS *</label>
                  <select
                    value={formData.ipsId || ipsList[0]?.id}
                    onChange={(e) => setFormData({ ...formData, ipsId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  >
                    {ipsList.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Servicio *</label>
                  <input
                    type="text"
                    placeholder="Ej. UCI Adultos, Cirugía"
                    value={formData.service || ''}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Habitación / Cama *</label>
                  <input
                    type="text"
                    placeholder="Ej. Cama UCI-04"
                    value={formData.roomBed || ''}
                    onChange={(e) => setFormData({ ...formData, roomBed: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Ingreso *</label>
                  <input
                    type="date"
                    value={formData.admissionDate || ''}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Clinical Info */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diagnóstico Principal (CIE-10) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Neumonía adquirida en la comunidad grave con choque séptico"
                    value={formData.mainDiagnosis || ''}
                    onChange={(e) => setFormData({ ...formData, mainDiagnosis: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Médico Tratante</label>
                    <input
                      type="text"
                      placeholder="Ej. Dr. Jorge Navarro (Intensivista)"
                      value={formData.attendingPhysician || ''}
                      onChange={(e) => setFormData({ ...formData, attendingPhysician: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Estado del Paciente</label>
                    <select
                      value={formData.status || 'Hospitalizado'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientStatus })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none font-semibold"
                    >
                      <option value="Hospitalizado">Hospitalizado</option>
                      <option value="Alta">Alta</option>
                      <option value="Traslado">Traslado</option>
                      <option value="Fallecido">Fallecido</option>
                      <option value="Cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
