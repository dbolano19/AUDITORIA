import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  UserCheck,
  Plus,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { CorrectiveAction, ActionStatus, User } from '../../types';

interface ActionsManagementViewProps {
  onOpenExpediente: (auditId: string) => void;
  activeUser: User;
}

export const ActionsManagementView: React.FC<ActionsManagementViewProps> = ({
  onOpenExpediente,
  activeUser
}) => {
  const [actions, setActions] = useState<CorrectiveAction[]>(() => storageService.getActions());
  const patients = storageService.getPatients();
  const ipsList = storageService.getIPS();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterIPS, setFilterIPS] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Follow-up modal
  const [selectedActionForNote, setSelectedActionForNote] = useState<CorrectiveAction | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  const refreshList = () => {
    setActions(storageService.getActions());
  };

  const handleUpdateStatus = (actionId: string, status: ActionStatus) => {
    storageService.updateActionStatus(actionId, status);
    refreshList();
  };

  const handleAddFollowUpNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActionForNote || !newNoteText.trim()) return;

    storageService.addActionFollowUp(
      selectedActionForNote.id,
      newNoteText.trim(),
      activeUser.name
    );

    setNewNoteText('');
    setSelectedActionForNote(null);
    refreshList();
  };

  const filtered = actions.filter(act => {
    const patient = patients.find(p => p.id === act.patientId);
    const matchesSearch =
      act.findingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.actionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIPS = filterIPS === 'all' || act.ipsId === filterIPS;
    const matchesStatus = filterStatus === 'all' || act.status === filterStatus;

    return matchesSearch && matchesIPS && matchesStatus;
  });

  const pendingCount = actions.filter(a => a.status === 'Pendiente').length;
  const inProgressCount = actions.filter(a => a.status === 'En proceso').length;
  const completedCount = actions.filter(a => a.status === 'Cumplida').length;
  const overdueCount = actions.filter(a => a.status !== 'Cumplida' && new Date(a.deadlineDate) < new Date()).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Planes de Acción y Seguimiento de Compromisos
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Control de compromisos acordados con los equipos médicos y administrativos de Bonadona, Misericordia y Costa.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Compromisos Totales</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{actions.length}</div>
          <span className="text-[11px] text-slate-500">En las 3 IPS</span>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs ${overdueCount > 0 ? 'bg-rose-50/50 border-rose-300' : 'bg-white border-slate-200'}`}>
          <span className="text-[11px] font-bold text-rose-900 uppercase">Alerta: Acciones Vencidas</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{overdueCount}</div>
          <span className="text-[11px] text-rose-700">Superaron fecha límite</span>
        </div>

        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-900 uppercase">En Proceso / Pendientes</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount + inProgressCount}</div>
          <span className="text-[11px] text-amber-800">Seguimiento activo</span>
        </div>

        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-900 uppercase">Cumplidas</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</div>
          <span className="text-[11px] text-emerald-800">Cerradas satisfactoriamente</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por compromiso, responsable o paciente..."
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
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Cumplida">Cumplida</option>
              <option value="Vencida">Vencida</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {filtered.map(act => {
          const patient = patients.find(p => p.id === act.patientId);
          const ips = ipsList.find(i => i.id === act.ipsId);
          const isOverdue = act.status !== 'Cumplida' && new Date(act.deadlineDate) < new Date();

          return (
            <div
              key={act.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all space-y-4 ${
                isOverdue ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      {act.findingCode}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{ips?.name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 text-xs">{patient?.fullName}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">{act.actionText}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={act.status}
                    onChange={e => handleUpdateStatus(act.id, e.target.value as ActionStatus)}
                    className={`font-bold px-2.5 py-1 rounded-lg text-xs border cursor-pointer ${
                      act.status === 'Cumplida'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : isOverdue
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Cumplida">Cumplida</option>
                    <option value="Vencida">Vencida</option>
                  </select>

                  <button
                    onClick={() => setSelectedActionForNote(act)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>+ Seguimiento</span>
                  </button>

                  <button
                    onClick={() => onOpenExpediente(act.auditId)}
                    className="p-1 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 cursor-pointer"
                    title="Ir a expediente"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Responsible and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500">Responsable: </span>
                  <strong className="text-slate-800">{act.responsibleName}</strong> ({act.responsibleRole})
                </div>
                <div className="md:text-right">
                  <span className="text-slate-500">Fecha Límite: </span>
                  <strong className={isOverdue ? 'text-rose-700' : 'text-slate-800'}>{act.deadlineDate}</strong>
                  {isOverdue && <span className="ml-1 text-[10px] font-bold text-rose-700">(VENCIDO)</span>}
                </div>
              </div>

              {/* Follow-up notes list */}
              {act.followUpNotes && act.followUpNotes.length > 0 && (
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Notas de Trazabilidad y Verificación:
                  </span>
                  {act.followUpNotes.map((note, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded text-xs border border-slate-200/70 flex items-start justify-between gap-2">
                      <div className="text-slate-700">
                        <span className="font-semibold text-slate-900">{note.auditorName}:</span> {note.observation}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{note.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add Follow-up Note */}
      {selectedActionForNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Agregar Nota de Seguimiento</h3>
              <button onClick={() => setSelectedActionForNote(null)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleAddFollowUpNote} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Compromiso:</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {selectedActionForNote.actionText}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observación de Seguimiento *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describa el avance verificado con el equipo asistencial..."
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedActionForNote(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Registrar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
