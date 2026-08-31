import React, { useState } from 'react';
import { ClipboardList, User, Building2, Calendar, ShieldCheck, X } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Audit, AuditType, AuditStatus, Patient, IPS, User as UserType } from '../../types';

interface NewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditCreated: (auditId: string) => void;
  initialPatientId?: string;
  activeUser: UserType;
}

export const NewAuditModal: React.FC<NewAuditModalProps> = ({
  isOpen,
  onClose,
  onAuditCreated,
  initialPatientId,
  activeUser
}) => {
  const ipsList = storageService.getIPS();
  const patients = storageService.getPatients();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || patients[0]?.id || ''
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const [formData, setFormData] = useState<Partial<Audit>>({
    ipsId: selectedPatient?.ipsId || ipsList[0]?.id || 'ips-bonadona',
    auditDate: new Date().toISOString().split('T')[0],
    type: 'Seguimiento diario',
    status: 'Borrador',
    auditorName: activeUser.name,
    auditorRole: activeUser.role
  });

  if (!isOpen) return null;

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      setFormData(prev => ({ ...prev, ipsId: pat.ipsId }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    const currentAudits = storageService.getAudits();
    const count = currentAudits.length + 1;
    const auditCode = `AUD-2025-${count.toString().padStart(3, '0')}`;

    const newAudit: Audit = {
      id: `aud-${Date.now()}`,
      auditCode,
      patientId: selectedPatientId,
      ipsId: formData.ipsId || patient?.ipsId || 'ips-bonadona',
      auditDate: formData.auditDate || new Date().toISOString().split('T')[0],
      type: (formData.type as AuditType) || 'Seguimiento diario',
      status: (formData.status as AuditStatus) || 'Borrador',
      auditorId: activeUser.id,
      auditorName: activeUser.name,
      auditorRole: activeUser.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      admissionInfo: {
        admissionDate: patient?.admissionDate || new Date().toISOString().split('T')[0],
        admissionTime: '08:00',
        admissionReason: patient?.mainDiagnosis || '',
        currentIllness: 'Paciente ingresa por cuadro clínico agudo con evolución tórpida.',
        triageLevel: patient?.triageLevel || 'II - Emergencia',
        admissionDiagnoses: [patient?.mainDiagnosis || 'En estudio'],
        initialConduct: 'Hospitalización inmediata en sala de cuidados intensivos/intermedios.'
      },
      stayReview: {
        calculatedStayDays: patient ? storageService.calculateStayDays(patient.admissionDate) : 1,
        expectedStayDays: 5,
        currentService: patient?.service || 'Hospitalización',
        clinicalJustification: 'Paciente en monitoreo continuo y tratamiento intrahospitalario.',
        prolongedStayRisk: false
      },
      findings: [],
      actions: [],
      documents: []
    };

    storageService.saveAudit(newAudit);
    onAuditCreated(newAudit.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-700" />
            <h3 className="font-bold text-sm text-slate-900">+ Apertura de Nueva Auditoría Concurrente</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          
          {/* Patient Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Paciente a Auditar *</label>
            <select
              value={selectedPatientId}
              onChange={e => handlePatientSelect(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.docType} {p.docNumber} ({p.ipsName} · {p.service})
                </option>
              ))}
            </select>
          </div>

          {/* IPS Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sede IPS</label>
              <select
                value={formData.ipsId}
                onChange={e => setFormData({ ...formData, ipsId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
              >
                {ipsList.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Auditoría *</label>
              <input
                type="date"
                required
                value={formData.auditDate}
                onChange={e => setFormData({ ...formData, auditDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Auditoría *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as AuditType })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Seguimiento diario">Seguimiento diario</option>
                <option value="Revisión de estancia">Revisión de estancia</option>
                <option value="Auditoría completa">Auditoría completa</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estado Inicial</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as AuditStatus })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
              >
                <option value="Borrador">Borrador</option>
                <option value="En revisión">En revisión</option>
                <option value="Pendiente de validación">Pendiente de validación</option>
              </select>
            </div>
          </div>

          {/* Auditor Badge */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-slate-600">
            <span>Auditor Asignado: <strong>{activeUser.name}</strong></span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
              {activeUser.role}
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Crear y Abrir Expediente
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
