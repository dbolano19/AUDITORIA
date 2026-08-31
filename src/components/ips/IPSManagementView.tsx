import React, { useState } from 'react';
import { Building2, Plus, Edit2, Power, Phone, Mail, MapPin, Bed, CheckCircle2, XCircle, Search } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { IPS } from '../../types';

interface IPSManagementViewProps {
  onSelectIPSForPatientList?: (ipsId: string) => void;
}

export const IPSManagementView: React.FC<IPSManagementViewProps> = ({ onSelectIPSForPatientList }) => {
  const [ipsList, setIpsList] = useState<IPS[]>(() => storageService.getIPS());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIPS, setEditingIPS] = useState<IPS | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<IPS>>({
    name: '',
    code: '',
    city: 'Barranquilla',
    department: 'Atlántico',
    status: 'Activa',
    bedsCapacity: 100,
    observations: '',
    contacts: [{ name: '', role: '', email: '', phone: '' }]
  });

  const refreshList = () => {
    setIpsList(storageService.getIPS());
  };

  const handleOpenCreate = () => {
    setEditingIPS(null);
    setFormData({
      name: '',
      code: `IPS-${Date.now().toString().slice(-3)}`,
      city: 'Barranquilla',
      department: 'Atlántico',
      status: 'Activa',
      bedsCapacity: 120,
      servicesAvailable: ['UCI Adultos', 'Hospitalización', 'Cirugía', 'Urgencias'],
      observations: '',
      contacts: [{ name: '', role: 'Coordinador de Auditoría', email: '', phone: '+57 (605) ' }]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ips: IPS) => {
    setEditingIPS(ips);
    setFormData({ ...ips });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    storageService.toggleIPSStatus(id);
    refreshList();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const ipsToSave: IPS = {
      id: editingIPS ? editingIPS.id : `ips-${Date.now()}`,
      code: formData.code || `IPS-00${ipsList.length + 1}`,
      name: formData.name.trim(),
      city: formData.city || 'Barranquilla',
      department: formData.department || 'Atlántico',
      status: formData.status || 'Activa',
      createdAt: editingIPS ? editingIPS.createdAt : new Date().toISOString().split('T')[0],
      bedsCapacity: Number(formData.bedsCapacity) || 100,
      servicesAvailable: formData.servicesAvailable || ['Hospitalización', 'Urgencias'],
      observations: formData.observations || '',
      contacts: formData.contacts || []
    };

    storageService.saveIPS(ipsToSave);
    setIsModalOpen(false);
    refreshList();
  };

  const filteredIPS = ipsList.filter(ips =>
    ips.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ips.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ips.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestión de IPS (Instituciones Prestadoras de Salud)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Configuración y parametrización de sedes hospitalarias auditadas en Barranquilla, Atlántico.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ REGISTRAR NUEVA IPS</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar IPS por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Mostrando {filteredIPS.length} de {ipsList.length} instituciones registradas
        </div>
      </div>

      {/* IPS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIPS.map(ips => {
          const patientsCount = storageService.getPatients().filter(p => p.ipsId === ips.id).length;
          const auditsCount = storageService.getAudits().filter(a => a.ipsId === ips.id).length;

          return (
            <div
              key={ips.id}
              className={`bg-white rounded-xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                ips.status === 'Activa' ? 'border-slate-200 hover:border-cyan-400' : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      {ips.code}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1">{ips.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ips.city}, {ips.department}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      ips.status === 'Activa'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {ips.status === 'Activa' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{ips.status}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {ips.observations || 'Sin observaciones registradas.'}
                </p>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-xs font-bold text-slate-900">{ips.bedsCapacity}</span>
                    <span className="text-[10px] text-slate-500">Camas</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-xs font-bold text-blue-700">{patientsCount}</span>
                    <span className="text-[10px] text-slate-500">Pacientes</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-xs font-bold text-teal-700">{auditsCount}</span>
                    <span className="text-[10px] text-slate-500">Auditorías</span>
                  </div>
                </div>
              </div>

              {/* Contacts info */}
              <div className="p-4 bg-slate-50/60 border-b border-slate-100 text-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Contactos de Auditoría:
                </span>
                {ips.contacts && ips.contacts.length > 0 ? (
                  ips.contacts.slice(0, 2).map((contact, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-slate-200 text-[11px] space-y-0.5">
                      <div className="font-semibold text-slate-800">{contact.name} ({contact.role})</div>
                      <div className="flex items-center gap-2 text-slate-500">
                        {contact.email && <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{contact.email}</span>}
                        {contact.phone && <span className="flex items-center gap-1 shrink-0"><Phone className="w-3 h-3" />{contact.phone}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[11px]">No hay contactos asignados</span>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-white flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStatus(ips.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border cursor-pointer transition-colors ${
                    ips.status === 'Activa'
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{ips.status === 'Activa' ? 'Desactivar' : 'Activar'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(ips)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium border border-slate-200 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Create / Edit IPS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-700" />
                <span>{editingIPS ? 'Editar IPS' : 'Registrar Nueva IPS'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre de la IPS *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Clínica Bonadona Prevenir"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código de IPS</label>
                  <input
                    type="text"
                    placeholder="Ej. IPS-004"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city || 'Barranquilla'}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={formData.department || 'Atlántico'}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacidad Camas</label>
                  <input
                    type="number"
                    value={formData.bedsCapacity || 100}
                    onChange={(e) => setFormData({ ...formData, bedsCapacity: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observaciones / Nivel de Complejidad</label>
                <textarea
                  rows={2}
                  value={formData.observations || ''}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Ej. Institución de alta complejidad con servicios de UCI y oncología..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-800 block mb-2">Contacto de Auditoría Principal</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.contacts?.[0]?.name || ''}
                    onChange={(e) => {
                      const contacts = [...(formData.contacts || [{ name: '', role: '', email: '', phone: '' }])];
                      contacts[0] = { ...contacts[0], name: e.target.value };
                      setFormData({ ...formData, contacts });
                    }}
                    className="bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Cargo (ej. Coordinador Auditoría)"
                    value={formData.contacts?.[0]?.role || ''}
                    onChange={(e) => {
                      const contacts = [...(formData.contacts || [{ name: '', role: '', email: '', phone: '' }])];
                      contacts[0] = { ...contacts[0], role: e.target.value };
                      setFormData({ ...formData, contacts });
                    }}
                    className="bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="email"
                    placeholder="Correo institucional"
                    value={formData.contacts?.[0]?.email || ''}
                    onChange={(e) => {
                      const contacts = [...(formData.contacts || [{ name: '', role: '', email: '', phone: '' }])];
                      contacts[0] = { ...contacts[0], email: e.target.value };
                      setFormData({ ...formData, contacts });
                    }}
                    className="bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono institucional"
                    value={formData.contacts?.[0]?.phone || ''}
                    onChange={(e) => {
                      const contacts = [...(formData.contacts || [{ name: '', role: '', email: '', phone: '' }])];
                      contacts[0] = { ...contacts[0], phone: e.target.value };
                      setFormData({ ...formData, contacts });
                    }}
                    className="bg-white border border-slate-300 rounded p-1.5"
                  />
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
                  Guardar IPS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
