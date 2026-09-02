import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Building2,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Key
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { User, UserRole } from '../../types';

interface SettingsViewProps {
  activeUser: User;
  onRoleChange: (role: UserRole) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeUser,
  onRoleChange,
  onResetData
}) => {
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const ipsList = storageService.getIPS();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'Auditor',
    specialty: 'Médico Auditor Concurrente'
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name?.trim() || !newUser.email?.trim()) return;

    const created: User = {
      id: `usr-${Date.now()}`,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: (newUser.role as UserRole) || 'Auditor',
      status: 'activo',
      ipsAssigned: ['all'],
      specialty: newUser.specialty || 'Auditor Concurrente',
      createdAt: new Date().toISOString()
    };

    const updated = [...users, created];
    setUsers(updated);
    storageService.saveUsers(updated);
    setNewUser({ name: '', email: '', role: 'Auditor', specialty: 'Médico Auditor Concurrente' });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Configuración y Parámetros del Sistema
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Administración de usuarios, roles de auditoría concurrente y políticas institucionales.
          </p>
        </div>

        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer Datos de Demostración</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Gestión de Roles y Permisos (Requirement 28) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-700" />
              <span>Matriz de Roles y Perfiles de Acceso</span>
            </h2>
          </div>

          <div className="space-y-2 text-xs">
            {[
              {
                role: 'Administrador',
                desc: 'Control total de la plataforma, configuración de IPS, auditorías y trazabilidad completa.',
                badge: 'Acceso Total'
              },
              {
                role: 'Coordinador',
                desc: 'Supervisa auditorías de todas las sedes, valida informes oficiales y asigna casos.',
                badge: 'Supervisión Global'
              },
              {
                role: 'Supervisor',
                desc: 'Revisión y retroalimentación de hallazgos en comités de calidad hospitalaria.',
                badge: 'Control Calidad'
              },
              {
                role: 'Auditor',
                desc: 'Ingreso de notas concurrentes, carga de historias clínicas y registro de hallazgos.',
                badge: 'Operativo Clínico'
              },
              {
                role: 'Consulta',
                desc: 'Visualización de tableros, indicadores consolidados e informes sin edición.',
                badge: 'Solo Lectura'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900">{item.role}</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{item.desc}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Usuarios y Auditores Registrados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-700" />
              <span>Equipo de Auditores Concurrentes ({users.length})</span>
            </h2>
          </div>

          {/* Form to add user */}
          <form onSubmit={handleCreateUser} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800 text-[11px] block">+ Registrar Nuevo Auditor</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Nombre completo"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                className="bg-white border border-slate-300 rounded p-1.5"
              />
              <input
                type="email"
                required
                placeholder="Correo electrónico"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-white border border-slate-300 rounded p-1.5"
              />
              <select
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                className="bg-white border border-slate-300 rounded p-1.5 font-semibold"
              >
                <option value="Auditor">Auditor</option>
                <option value="Coordinador">Coordinador</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Consulta">Consulta</option>
                <option value="Administrador">Administrador</option>
              </select>
              <button
                type="submit"
                className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded p-1.5 cursor-pointer shadow-xs"
              >
                + Agregar Usuario
              </button>
            </div>
          </form>

          {/* List of existing users */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{u.name}</div>
                  <div className="text-[11px] text-slate-500">{u.email} · {u.specialty}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Card 3: Regla Permanente de Seguridad Asistencial (Requirement 31) */}
      <div className="bg-amber-50 rounded-xl border border-amber-300 p-5 space-y-2 text-xs text-amber-950">
        <h3 className="font-bold text-sm flex items-center gap-2 text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <span>Regla de Seguridad Asistencial Permanente</span>
        </h3>
        <p className="leading-relaxed text-slate-700 font-medium">
          "Esta herramienta es un sistema de apoyo a la auditoría y no reemplaza el criterio profesional del auditor ni las decisiones del equipo asistencial."
        </p>
        <p className="text-[11px] text-slate-500">
          La plataforma opera bajo el principio de separación estricta: los datos extraídos de la historia clínica son hechos documentales verificables; el análisis de IA es un borrador no vinculante; y la validación final del auditor es la única autoridad con validez legal e institucional.
        </p>
      </div>

    </div>
  );
};
