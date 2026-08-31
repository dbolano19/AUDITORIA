import React, { useState } from 'react';
import { Users2, X } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Patient, IdentificationType, PatientStatus } from '../../types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patientId: string) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated
}) => {
  const ipsList = storageService.getIPS();

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
    roomBed: 'Cama 04',
    admissionDate: new Date().toISOString().split('T')[0],
    mainDiagnosis: '',
    attendingPhysician: 'Dr. Roberto Mendoza (Médico Tratante)',
    status: 'Hospitalizado',
    triageLevel: 'II - Emergencia',
    eps: 'Sura EPS'
  });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim() || !formData.docNumber?.trim()) return;

    const ips = ipsList.find(i => i.id === formData.ipsId);

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      internalId: `PAC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
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
      mainDiagnosis: formData.mainDiagnosis || 'En estudio clínico',
      secondaryDiagnoses: ['Hipertensión arterial'],
      attendingPhysician: formData.attendingPhysician || 'Médico Tratante',
      status: (formData.status as PatientStatus) || 'Hospitalizado',
      triageLevel: formData.triageLevel,
      eps: formData.eps
    };

    storageService.savePatient(newPatient);
    onPatientCreated(newPatient.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-cyan-700" />
            <h3 className="font-bold text-sm text-slate-900">+ Registro Rápido de Paciente (Censo)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo Documento *</label>
              <select
                value={formData.docType}
                onChange={e => setFormData({ ...formData, docType: e.target.value as IdentificationType })}
                className="w-full bg-white border border-slate-300 rounded p-1.5"
              >
                <option value="CC">CC - Cédula</option>
                <option value="TI">TI - Tarjeta Identidad</option>
                <option value="RC">RC - Registro Civil</option>
                <option value="CE">CE - Extranjería</option>
                <option value="PA">PA - Pasaporte</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Número Documento *</label>
              <input
                type="text"
                required
                placeholder="1047293810"
                value={formData.docNumber}
                onChange={e => setFormData({ ...formData, docNumber: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Paciente *</label>
            <input
              type="text"
              required
              placeholder="Ej. Ana Lucía Morales Polo (Ficticio)"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Edad</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded p-1.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sexo</label>
              <select
                value={formData.sex}
                onChange={e => setFormData({ ...formData, sex: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded p-1.5"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">EPS</label>
              <input
                type="text"
                value={formData.eps}
                onChange={e => setFormData({ ...formData, eps: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded p-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IPS *</label>
              <select
                value={formData.ipsId}
                onChange={e => setFormData({ ...formData, ipsId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-900"
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
                placeholder="UCI Adultos, Cirugía..."
                value={formData.service}
                onChange={e => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded p-1.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Habitación / Cama</label>
              <input
                type="text"
                placeholder="Cama 04"
                value={formData.roomBed}
                onChange={e => setFormData({ ...formData, roomBed: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded p-1.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Ingreso</label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Diagnóstico Principal (CIE-10) *</label>
            <input
              type="text"
              required
              placeholder="Ej. Síndrome coronario agudo sin elevación del ST"
              value={formData.mainDiagnosis}
              onChange={e => setFormData({ ...formData, mainDiagnosis: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>

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
              className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold cursor-pointer"
            >
              Guardar Paciente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
