import React, { useState, useEffect } from 'react';
import {
  FileText,
  User,
  Calendar,
  Activity,
  FlaskConical,
  Stethoscope,
  Pill,
  AlertOctagon,
  ShieldCheck,
  Smile,
  Clock,
  Lightbulb,
  CheckSquare,
  FileCheck2,
  Paperclip,
  History,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { reportService } from '../../services/reportService';
import {
  Audit,
  Patient,
  IPS,
  User as UserType,
  Finding,
  CorrectiveAction,
  FindingType,
  FindingPriority,
  FindingStatus,
  ActionStatus,
  PatientSafetyRecord,
  DiagnosticAid,
  ProcedureInterconsult,
  MedicationTreatment,
  DailyFollowUp,
  UserSatisfactionRecord
} from '../../types';

interface AuditExpedienteViewProps {
  auditId: string;
  onBack: () => void;
  activeUser: UserType;
  onNavigateToUpload: () => void;
}

export type ExpedienteTab =
  | 'ingreso'
  | 'seguimiento'
  | 'ayudas'
  | 'procedimientos'
  | 'tratamiento'
  | 'hallazgos'
  | 'seguridad'
  | 'satisfaccion'
  | 'estancia'
  | 'recomendaciones'
  | 'acciones'
  | 'informe'
  | 'documentos'
  | 'trazabilidad';

export const AuditExpedienteView: React.FC<AuditExpedienteViewProps> = ({
  auditId,
  onBack,
  activeUser,
  onNavigateToUpload
}) => {
  const [activeTab, setActiveTab] = useState<ExpedienteTab>('ingreso');
  const [audit, setAudit] = useState<Audit | null>(() => storageService.getAuditById(auditId) || null);
  const [patient, setPatient] = useState<Patient | null>(() =>
    audit ? storageService.getPatientById(audit.patientId) || null : null
  );
  const [ips, setIps] = useState<IPS | null>(() =>
    audit ? storageService.getIPS().find(i => i.id === audit.ipsId) || null : null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Synchronize state
  const refreshAuditData = () => {
    const updated = storageService.getAuditById(auditId);
    if (updated) {
      setAudit(updated);
      setPatient(storageService.getPatientById(updated.patientId) || null);
    }
  };

  if (!audit || !patient) {
    return (
      <div className="p-8 text-center space-y-4 max-w-xl mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Expediente de Auditoría no encontrado</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-cyan-700 text-white text-xs font-semibold rounded-lg"
        >
          Regresar a Auditorías
        </button>
      </div>
    );
  }

  const showSaveSuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleSaveExpedienteSection = (updatedAudit: Audit, actionName: string) => {
    setIsSaving(true);
    storageService.saveAudit(updatedAudit, activeUser.name, activeUser.role, actionName);
    setAudit(updatedAudit);
    setIsSaving(false);
    showSaveSuccess(`Sección "${actionName}" guardada con éxito`);
  };

  // 14 Tabs Definition (Requirement 12)
  const tabs = [
    { id: 'ingreso' as ExpedienteTab, label: '1. Ingreso', icon: User },
    { id: 'seguimiento' as ExpedienteTab, label: '2. Seguimiento', icon: Activity },
    { id: 'ayudas' as ExpedienteTab, label: '3. Ayudas Diagnósticas', icon: FlaskConical },
    { id: 'procedimientos' as ExpedienteTab, label: '4. Procedimientos', icon: Stethoscope },
    { id: 'tratamiento' as ExpedienteTab, label: '5. Tratamiento', icon: Pill },
    { id: 'hallazgos' as ExpedienteTab, label: '6. Hallazgos', icon: AlertOctagon, badge: audit.findings?.length },
    { id: 'seguridad' as ExpedienteTab, label: '7. Seguridad Paciente', icon: ShieldCheck },
    { id: 'satisfaccion' as ExpedienteTab, label: '8. Satisfacción / PQR', icon: Smile },
    { id: 'estancia' as ExpedienteTab, label: '9. Estancia y Pertinencia', icon: Clock },
    { id: 'recomendaciones' as ExpedienteTab, label: '10. Recomendaciones', icon: Lightbulb },
    { id: 'acciones' as ExpedienteTab, label: '11. Acciones y Seguimiento', icon: CheckSquare, badge: audit.actions?.length },
    { id: 'informe' as ExpedienteTab, label: '12. Generar Informe', icon: FileCheck2, highlight: true },
    { id: 'documentos' as ExpedienteTab, label: '13. Documentos (PDF)', icon: Paperclip, badge: audit.documents?.length },
    { id: 'trazabilidad' as ExpedienteTab, label: '14. Trazabilidad', icon: History }
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-3 md:p-6">
      
      {/* Header bar with Back button & Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer transition-colors"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Expediente Clínico: {audit.auditCode}</span>
              <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded font-semibold">
                {audit.type}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Auditor responsable: <strong>{audit.auditorName}</strong> · IPS: <strong>{ips?.name || audit.ipsId}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessMessage && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveSuccessMessage}
            </span>
          )}

          <div className="flex items-center gap-1.5 text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Estado Auditoría:</span>
            <span className="font-bold text-slate-900">{audit.status}</span>
          </div>
        </div>
      </div>

      {/* 14 Tabs Navigation Bar (Scrollable on mobile) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-1.5 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-700 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${t.highlight && !isActive ? 'ring-1 ring-cyan-500/50 bg-cyan-50/50 text-cyan-800' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-cyan-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 min-h-[500px]">
        
        {/* TAB 1: INGRESO DEL PACIENTE (Requirement 13) */}
        {activeTab === 'ingreso' && (
          <TabIngreso
            audit={audit}
            patient={patient}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Ingreso del Paciente')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 2: SEGUIMIENTO MÉDICO DIARIO (Requirement 14) */}
        {activeTab === 'seguimiento' && (
          <TabSeguimiento
            audit={audit}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Seguimiento Médico Diario')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 3: AYUDAS DIAGNÓSTICAS (Requirement 15) */}
        {activeTab === 'ayudas' && (
          <TabAyudasDiagnosticas
            audit={audit}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Ayudas Diagnósticas')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 4: PROCEDIMIENTOS E INTERCONSULTAS (Requirement 16) */}
        {activeTab === 'procedimientos' && (
          <TabProcedimientos
            audit={audit}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Procedimientos e Interconsultas')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 5: TRATAMIENTO Y MEDICAMENTOS (Requirement 17) */}
        {activeTab === 'tratamiento' && (
          <TabTratamiento
            audit={audit}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Tratamiento y Medicamentos')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 6: REGISTRO DE HALLAZGOS (Requirement 18) */}
        {activeTab === 'hallazgos' && (
          <TabHallazgos
            audit={audit}
            patient={patient}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Registro de Hallazgos')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 7: SEGURIDAD DEL PACIENTE (Requirement 19) */}
        {activeTab === 'seguridad' && (
          <TabSeguridad
            audit={audit}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Seguridad del Paciente')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 8: SATISFACCIÓN Y ATENCIÓN AL USUARIO (Requirement 20) */}
        {activeTab === 'satisfaccion' && (
          <TabSatisfaccion
            audit={audit}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Satisfacción y PQR')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 9: REVISIÓN DE ESTANCIA Y PERTINENCIA (Requirement 21) */}
        {activeTab === 'estancia' && (
          <TabEstancia
            audit={audit}
            patient={patient}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Estancia y Pertinencia')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 10: RECOMENDACIONES DEL AUDITOR (Requirement 22) */}
        {activeTab === 'recomendaciones' && (
          <TabRecomendaciones
            audit={audit}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Recomendaciones')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 11: ACCIONES Y SEGUIMIENTO (Requirement 23) */}
        {activeTab === 'acciones' && (
          <TabAcciones
            audit={audit}
            onSave={(updated) => handleSaveExpedienteSection(updated, 'Acciones y Seguimiento')}
            activeUser={activeUser}
          />
        )}

        {/* TAB 12: GENERACIÓN DE INFORME (Requirement 24) */}
        {activeTab === 'informe' && (
          <TabInforme
            audit={audit}
            patient={patient}
            ips={ips}
            activeUser={activeUser}
          />
        )}

        {/* TAB 13: DOCUMENTOS Y ANEXOS (Requirement 25) */}
        {activeTab === 'documentos' && (
          <TabDocumentos
            audit={audit}
            onNavigateToUpload={onNavigateToUpload}
          />
        )}

        {/* TAB 14: TRAZABILIDAD (Requirement 26) */}
        {activeTab === 'trazabilidad' && (
          <TabTrazabilidad
            auditId={audit.id}
          />
        )}

      </div>

    </div>
  );
};

/* =========================================================================
   SUB-COMPONENTS FOR THE 14 TABS
   ========================================================================= */

// TAB 1: INGRESO
const TabIngreso: React.FC<{
  audit: Audit;
  patient: Patient;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, patient, onSave }) => {
  const [data, setData] = useState(audit.admissionInfo || {
    admissionDate: patient.admissionDate,
    admissionTime: '08:30',
    admissionReason: '',
    currentIllness: '',
    medicalHistory: {
      pathological: 'Hipertensión arterial',
      surgical: 'Apendicectomía previa',
      allergic: 'No refiere alergias medicamentosas',
      pharmacological: 'Losartán 50mg/día',
      toxicological: 'Niega tabaquismo',
      familyHistory: 'Diabetes tipo 2 familiar'
    },
    physicalExamSummary: 'Paciente consciente, orientado, afebril, hemodinámicamente estable.',
    triageLevel: patient.triageLevel || 'II - Emergencia',
    admissionDiagnoses: [patient.mainDiagnosis],
    initialConduct: 'Hospitalización inmediata en UCI para monitorización continua.'
  });

  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...audit, admissionInfo: data });
  };

  return (
    <form onSubmit={handleFormSave} className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">1. Ingreso del Paciente a la IPS</h2>
          <p className="text-slate-500 text-[11px]">Registro de motivos de consulta, antecedentes, examen físico y conducta inicial.</p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Sección</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Fecha de Ingreso</label>
          <input
            type="date"
            value={data.admissionDate || ''}
            onChange={e => setData({ ...data, admissionDate: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded p-1.5"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Hora de Ingreso</label>
          <input
            type="time"
            value={data.admissionTime || '08:30'}
            onChange={e => setData({ ...data, admissionTime: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded p-1.5"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Clasificación de Triage</label>
          <select
            value={data.triageLevel || 'II - Emergencia'}
            onChange={e => setData({ ...data, triageLevel: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold text-slate-800"
          >
            <option value="I - Reanimación">I - Reanimación (Atención Inmediata)</option>
            <option value="II - Emergencia">II - Emergencia (&lt; 30 min)</option>
            <option value="III - Urgencia">III - Urgencia (&lt; 60 min)</option>
            <option value="IV - Prioritaria">IV - Prioritaria</option>
            <option value="V - No urgente">V - No urgente</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Motivo de Consulta *</label>
          <textarea
            rows={3}
            required
            value={data.admissionReason || ''}
            onChange={e => setData({ ...data, admissionReason: e.target.value })}
            placeholder="Describa el motivo por el cual el paciente ingresó al servicio de urgencias/hospitalización..."
            className="w-full bg-white border border-slate-300 rounded-lg p-2 leading-relaxed"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Enfermedad Actual *</label>
          <textarea
            rows={3}
            required
            value={data.currentIllness || ''}
            onChange={e => setData({ ...data, currentIllness: e.target.value })}
            placeholder="Cronología detallada de los síntomas y evolución previa al ingreso..."
            className="w-full bg-white border border-slate-300 rounded-lg p-2 leading-relaxed"
          />
        </div>
      </div>

      {/* Antecedentes Clínicos */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Antecedentes Clínicos y Farmacológicos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Patológicos</label>
            <input
              type="text"
              value={data.medicalHistory?.pathological || ''}
              onChange={e => setData({ ...data, medicalHistory: { ...data.medicalHistory, pathological: e.target.value } })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Quirúrgicos</label>
            <input
              type="text"
              value={data.medicalHistory?.surgical || ''}
              onChange={e => setData({ ...data, medicalHistory: { ...data.medicalHistory, surgical: e.target.value } })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Alérgicos</label>
            <input
              type="text"
              value={data.medicalHistory?.allergic || ''}
              onChange={e => setData({ ...data, medicalHistory: { ...data.medicalHistory, allergic: e.target.value } })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Farmacológicos Habituales</label>
            <input
              type="text"
              value={data.medicalHistory?.pharmacological || ''}
              onChange={e => setData({ ...data, medicalHistory: { ...data.medicalHistory, pharmacological: e.target.value } })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Toxicológicos</label>
            <input
              type="text"
              value={data.medicalHistory?.toxicological || ''}
              onChange={e => setData({ ...data, medicalHistory: { ...data.medicalHistory, toxicological: e.target.value } })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Familiares</label>
            <input
              type="text"
              value={data.medicalHistory?.familyHistory || ''}
              onChange={e => setData({ ...data, medicalHistory: { ...data.medicalHistory, familyHistory: e.target.value } })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
        </div>
      </div>

      {/* Examen físico y Conducta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Examen Físico al Ingreso</label>
          <textarea
            rows={3}
            value={data.physicalExamSummary || ''}
            onChange={e => setData({ ...data, physicalExamSummary: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Conducta Inicial / Plan de Manejo</label>
          <textarea
            rows={3}
            value={data.initialConduct || ''}
            onChange={e => setData({ ...data, initialConduct: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>
    </form>
  );
};

// TAB 2: SEGUIMIENTO
const TabSeguimiento: React.FC<{
  audit: Audit;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, onSave }) => {
  const [followUps, setFollowUps] = useState<DailyFollowUp[]>(audit.dailyFollowUps || []);
  const [newNote, setNewNote] = useState<Partial<DailyFollowUp>>({
    date: new Date().toISOString().split('T')[0],
    vitalSigns: { bp: '120/80', hr: '78', rr: '18', temp: '36.5', spo2: '98' },
    clinicalEvolution: '',
    diagnosticChanges: 'Sin cambios',
    medicalPertinence: 'Pertinente',
    stayPertinence: 'Pertinente',
    interdisciplinaryNotes: ''
  });

  const handleAdd = () => {
    if (!newNote.clinicalEvolution?.trim()) return;
    const item: DailyFollowUp = {
      id: `fol-${Date.now()}`,
      date: newNote.date || new Date().toISOString().split('T')[0],
      vitalSigns: newNote.vitalSigns,
      clinicalEvolution: newNote.clinicalEvolution,
      diagnosticChanges: newNote.diagnosticChanges || 'Sin cambios',
      medicalPertinence: (newNote.medicalPertinence as any) || 'Pertinente',
      stayPertinence: (newNote.stayPertinence as any) || 'Pertinente',
      interdisciplinaryNotes: newNote.interdisciplinaryNotes
    };

    const updated = [item, ...followUps];
    setFollowUps(updated);
    onSave({ ...audit, dailyFollowUps: updated });
    setNewNote({
      date: new Date().toISOString().split('T')[0],
      vitalSigns: { bp: '120/80', hr: '78', rr: '18', temp: '36.5', spo2: '98' },
      clinicalEvolution: '',
      diagnosticChanges: 'Sin cambios',
      medicalPertinence: 'Pertinente',
      stayPertinence: 'Pertinente',
      interdisciplinaryNotes: ''
    });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">2. Seguimiento Médico Diario</h2>
          <p className="text-slate-500 text-[11px]">Evoluciones diarias, signos vitales, pertinencia médica y de estancia.</p>
        </div>
      </div>

      {/* Add New Note Box */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-cyan-700" />
          <span>Registrar Nueva Evolución de Auditoría</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <label className="block text-slate-600 mb-0.5">Fecha</label>
            <input
              type="date"
              value={newNote.date}
              onChange={e => setNewNote({ ...newNote, date: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Signos: TA / FC / SatO2</label>
            <input
              type="text"
              placeholder="120/80 mmHg - 80 lpm - 98%"
              value={`${newNote.vitalSigns?.bp || ''} / ${newNote.vitalSigns?.hr || ''} / ${newNote.vitalSigns?.spo2 || ''}%`}
              onChange={e => {
                const parts = e.target.value.split('/');
                setNewNote({
                  ...newNote,
                  vitalSigns: {
                    bp: parts[0]?.trim() || '120/80',
                    hr: parts[1]?.trim() || '80',
                    spo2: parts[2]?.trim() || '98'
                  }
                });
              }}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Pertinencia Médica</label>
            <select
              value={newNote.medicalPertinence}
              onChange={e => setNewNote({ ...newNote, medicalPertinence: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold"
            >
              <option value="Pertinente">Pertinente</option>
              <option value="No pertinente">No pertinente</option>
              <option value="En evaluación">En evaluación</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Pertinencia de Estancia</label>
            <select
              value={newNote.stayPertinence}
              onChange={e => setNewNote({ ...newNote, stayPertinence: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold"
            >
              <option value="Pertinente">Pertinente</option>
              <option value="No pertinente">No pertinente</option>
              <option value="En evaluación">En evaluación</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold cursor-pointer transition-colors shadow-xs"
            >
              + Agregar Nota
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Evolución Clínica y Conducta del Día *</label>
          <textarea
            rows={2}
            value={newNote.clinicalEvolution || ''}
            onChange={e => setNewNote({ ...newNote, clinicalEvolution: e.target.value })}
            placeholder="Resumen del estado clínico, soporte ventilatorio, estabilidad hemodinámica o cambios terapéuticos..."
            className="w-full bg-white border border-slate-300 rounded p-2"
          />
        </div>
      </div>

      {/* History of follow ups */}
      <div className="space-y-3">
        {followUps.map(item => (
          <div key={item.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-cyan-700" />
                <span className="font-bold text-slate-900">{item.date}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">
                  TA: {item.vitalSigns?.bp || 'N/R'} · FC: {item.vitalSigns?.hr || 'N/R'} · SatO2: {item.vitalSigns?.spo2 || 'N/R'}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.stayPertinence === 'Pertinente' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  Estancia: {item.stayPertinence}
                </span>
              </div>
            </div>
            <p className="text-slate-800 leading-relaxed">{item.clinicalEvolution}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// TAB 3: AYUDAS DIAGNÓSTICAS
const TabAyudasDiagnosticas: React.FC<{
  audit: Audit;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, onSave }) => {
  const [aids, setAids] = useState<DiagnosticAid[]>(audit.diagnosticAids || []);
  const [newAid, setNewAid] = useState<Partial<DiagnosticAid>>({
    name: '',
    category: 'Laboratorio',
    requestedDate: new Date().toISOString().split('T')[0],
    pertinence: 'Pertinente',
    timeliness: 'Oportuno',
    resultSummary: ''
  });

  const handleAdd = () => {
    if (!newAid.name?.trim()) return;
    const item: DiagnosticAid = {
      id: `aid-${Date.now()}`,
      name: newAid.name.trim(),
      category: (newAid.category as any) || 'Laboratorio',
      requestedDate: newAid.requestedDate || new Date().toISOString().split('T')[0],
      performedDate: newAid.performedDate,
      reportedDate: newAid.reportedDate,
      resultSummary: newAid.resultSummary || 'En proceso',
      pertinence: (newAid.pertinence as any) || 'Pertinente',
      timeliness: (newAid.timeliness as any) || 'Oportuno'
    };
    const updated = [...aids, item];
    setAids(updated);
    onSave({ ...audit, diagnosticAids: updated });
    setNewAid({ name: '', category: 'Laboratorio', requestedDate: new Date().toISOString().split('T')[0], pertinence: 'Pertinente', timeliness: 'Oportuno', resultSummary: '' });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">3. Ayudas Diagnósticas (Laboratorio, Imágenes, Patología)</h2>
          <p className="text-slate-500 text-[11px]">Control de oportunidad, pertinencia clínica y tiempo de respuesta institucional.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 text-xs">+ Registrar Ayuda Diagnóstica</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="md:col-span-2">
            <label className="block text-slate-600 mb-0.5">Nombre del examen *</label>
            <input
              type="text"
              placeholder="Ej. TAC de Tórax de alta resolución, Hemocultivos x 2"
              value={newAid.name}
              onChange={e => setNewAid({ ...newAid, name: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Categoría</label>
            <select
              value={newAid.category}
              onChange={e => setNewAid({ ...newAid, category: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            >
              <option value="Laboratorio">Laboratorio</option>
              <option value="Imagenología">Imagenología</option>
              <option value="Patología">Patología</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Oportunidad</label>
            <select
              value={newAid.timeliness}
              onChange={e => setNewAid({ ...newAid, timeliness: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold"
            >
              <option value="Oportuno">Oportuno</option>
              <option value="Demorado">Demorado</option>
              <option value="Pendiente de reporte">Pendiente de reporte</option>
              <option value="No realizado">No realizado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold cursor-pointer"
            >
              + Agregar Examen
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Estudio / Examen</th>
              <th className="py-2.5 px-3">Categoría</th>
              <th className="py-2.5 px-3">F. Solicitud</th>
              <th className="py-2.5 px-3">F. Reporte</th>
              <th className="py-2.5 px-3">Pertinencia</th>
              <th className="py-2.5 px-3">Oportunidad</th>
              <th className="py-2.5 px-3">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {aids.map(aid => (
              <tr key={aid.id} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">{aid.name}</td>
                <td className="py-2.5 px-3 text-slate-600">{aid.category}</td>
                <td className="py-2.5 px-3 text-slate-600">{aid.requestedDate}</td>
                <td className="py-2.5 px-3 text-slate-600">{aid.reportedDate || 'Pendiente'}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {aid.pertinence}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    aid.timeliness === 'Oportuno' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {aid.timeliness}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-700">{aid.resultSummary || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// TAB 4: PROCEDIMIENTOS E INTERCONSULTAS
const TabProcedimientos: React.FC<{
  audit: Audit;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, onSave }) => {
  const [procs, setProcs] = useState<ProcedureInterconsult[]>(audit.procedures || []);
  const [newProc, setNewProc] = useState<Partial<ProcedureInterconsult>>({
    name: '',
    specialty: 'Infectología',
    type: 'Interconsulta',
    requestedDate: new Date().toISOString().split('T')[0],
    pertinence: 'Pertinente',
    timeliness: 'Oportuno'
  });

  const handleAdd = () => {
    if (!newProc.name?.trim()) return;
    const item: ProcedureInterconsult = {
      id: `pr-${Date.now()}`,
      name: newProc.name.trim(),
      specialty: newProc.specialty || 'General',
      type: (newProc.type as any) || 'Interconsulta',
      requestedDate: newProc.requestedDate || new Date().toISOString().split('T')[0],
      performedDate: newProc.performedDate,
      answeredDate: newProc.answeredDate,
      pertinence: (newProc.pertinence as any) || 'Pertinente',
      timeliness: (newProc.timeliness as any) || 'Oportuno',
      findingsSummary: newProc.findingsSummary || 'Realizado'
    };
    const updated = [...procs, item];
    setProcs(updated);
    onSave({ ...audit, procedures: updated });
    setNewProc({ name: '', specialty: 'Infectología', type: 'Interconsulta', requestedDate: new Date().toISOString().split('T')[0], pertinence: 'Pertinente', timeliness: 'Oportuno' });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">4. Procedimientos Quirúrgicos e Interconsultas</h2>
          <p className="text-slate-500 text-[11px]">Seguimiento a solicitudes interdepartamentales y oportunidad quirúrgica.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 text-xs">+ Registrar Procedimiento / Interconsulta</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="md:col-span-2">
            <label className="block text-slate-600 mb-0.5">Descripción o Especialidad *</label>
            <input
              type="text"
              placeholder="Ej. Interconsulta por Infectología para ajuste de esquema antibiótico"
              value={newProc.name}
              onChange={e => setNewProc({ ...newProc, name: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Tipo</label>
            <select
              value={newProc.type}
              onChange={e => setNewProc({ ...newProc, type: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            >
              <option value="Interconsulta">Interconsulta Médica</option>
              <option value="Procedimiento Quirúrgico">Procedimiento Quirúrgico</option>
              <option value="Procedimiento No Quirúrgico">Procedimiento No Quirúrgico</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Oportunidad</label>
            <select
              value={newProc.timeliness}
              onChange={e => setNewProc({ ...newProc, timeliness: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold"
            >
              <option value="Oportuno">Oportuno</option>
              <option value="Demorado">Demorado</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold cursor-pointer"
            >
              + Agregar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {procs.map(proc => (
          <div key={proc.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900">{proc.name}</div>
              <div className="text-[11px] text-slate-500">
                Tipo: {proc.type} · Solicitado: {proc.requestedDate} · Respuesta: {proc.answeredDate || 'Pendiente'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                proc.timeliness === 'Oportuno' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {proc.timeliness}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// TAB 5: TRATAMIENTO Y MEDICAMENTOS
const TabTratamiento: React.FC<{
  audit: Audit;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, onSave }) => {
  const [meds, setMeds] = useState<MedicationTreatment[]>(audit.treatments || []);
  const [newMed, setNewMed] = useState<Partial<MedicationTreatment>>({
    medicationName: '',
    dose: '1g',
    route: 'IV',
    frequency: 'Cada 8 horas',
    isAntibiotic: false,
    pertinence: 'Pertinente',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleAdd = () => {
    if (!newMed.medicationName?.trim()) return;
    const item: MedicationTreatment = {
      id: `med-${Date.now()}`,
      medicationName: newMed.medicationName.trim(),
      dose: newMed.dose || '1g',
      route: newMed.route || 'IV',
      frequency: newMed.frequency || 'Cada 8 horas',
      isAntibiotic: !!newMed.isAntibiotic,
      pertinence: (newMed.pertinence as any) || 'Pertinente',
      startDate: newMed.startDate || new Date().toISOString().split('T')[0],
      reconciliationStatus: 'Conciliado'
    };
    const updated = [...meds, item];
    setMeds(updated);
    onSave({ ...audit, treatments: updated });
    setNewMed({ medicationName: '', dose: '1g', route: 'IV', frequency: 'Cada 8 horas', isAntibiotic: false, pertinence: 'Pertinente', startDate: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">5. Tratamiento, Antibioticoterapia y Conciliación Medicamentosa</h2>
          <p className="text-slate-500 text-[11px]">Vigilancia a la pertinencia farmacológica, uso racional de antibióticos y prevención de RAM.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 text-xs">+ Registrar Medicamento / Esquema</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="md:col-span-2">
            <label className="block text-slate-600 mb-0.5">Medicamento *</label>
            <input
              type="text"
              placeholder="Ej. Meropenem, Vancomicina, Enoxaparina"
              value={newMed.medicationName}
              onChange={e => setNewMed({ ...newMed, medicationName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Dosis & Vía</label>
            <input
              type="text"
              placeholder="1g IV c/8h"
              value={`${newMed.dose} ${newMed.route} ${newMed.frequency}`}
              onChange={e => setNewMed({ ...newMed, dose: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">¿Es antibiótico?</label>
            <select
              value={newMed.isAntibiotic ? 'true' : 'false'}
              onChange={e => setNewMed({ ...newMed, isAntibiotic: e.target.value === 'true' })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            >
              <option value="false">No (Otro fármaco)</option>
              <option value="true">Sí (Antibiótico)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Pertinencia</label>
            <select
              value={newMed.pertinence}
              onChange={e => setNewMed({ ...newMed, pertinence: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold"
            >
              <option value="Pertinente">Pertinente</option>
              <option value="No pertinente">No pertinente</option>
              <option value="En evaluación">En evaluación</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold cursor-pointer"
            >
              + Agregar Fármaco
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Medicamento</th>
              <th className="py-2.5 px-3">Dosis / Vía / Frecuencia</th>
              <th className="py-2.5 px-3">Tipo</th>
              <th className="py-2.5 px-3">F. Inicio</th>
              <th className="py-2.5 px-3">Pertinencia</th>
              <th className="py-2.5 px-3">Conciliación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {meds.map(med => (
              <tr key={med.id} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">{med.medicationName}</td>
                <td className="py-2.5 px-3 text-slate-700">{med.dose} · {med.route} · {med.frequency}</td>
                <td className="py-2.5 px-3">
                  {med.isAntibiotic ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Antibiótico
                    </span>
                  ) : (
                    <span className="text-slate-500">General</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-600">{med.startDate}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {med.pertinence}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-emerald-700 font-medium">{med.reconciliationStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// TAB 6: REGISTRO DE HALLAZGOS (Requirement 18)
const TabHallazgos: React.FC<{
  audit: Audit;
  patient: Patient;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, patient, onSave }) => {
  const [findings, setFindings] = useState<Finding[]>(audit.findings || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Finding>>({
    type: 'Oportunidad',
    priority: 'Alta',
    description: '',
    evidence: '',
    clinicalImpact: '',
    financialImpact: '',
    status: 'Abierto',
    service: patient.service
  });

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description?.trim()) return;

    const newFinding: Finding = {
      id: `fnd-${Date.now()}`,
      auditId: audit.id,
      patientId: patient.id,
      ipsId: audit.ipsId,
      code: `HAL-${Date.now().toString().slice(-4)}`,
      type: (formData.type as FindingType) || 'Oportunidad',
      priority: (formData.priority as FindingPriority) || 'Media',
      description: formData.description.trim(),
      evidence: formData.evidence || 'Verificado en historia clínica digital',
      clinicalImpact: formData.clinicalImpact || '',
      financialImpact: formData.financialImpact || '',
      status: (formData.status as FindingStatus) || 'Abierto',
      registeredAt: new Date().toISOString(),
      registeredBy: 'Auditor Concurrente',
      service: formData.service || patient.service
    };

    const updated = [newFinding, ...findings];
    setFindings(updated);
    onSave({ ...audit, findings: updated });
    setIsModalOpen(false);
  };

  const handleUpdateFindingStatus = (findingId: string, status: FindingStatus) => {
    const updated = findings.map(f => (f.id === findingId ? { ...f, status } : f));
    setFindings(updated);
    onSave({ ...audit, findings: updated });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">6. Registro Estructurado de Hallazgos</h2>
          <p className="text-slate-500 text-[11px]">
            Tipificación: Administrativo, Asistencial, Pertinencia, Oportunidad, Calidad, Seguridad, Financiero.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ REGISTRAR HALLAZGO</span>
        </button>
      </div>

      {findings.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
          No hay hallazgos registrados en este expediente.
        </div>
      ) : (
        <div className="space-y-3">
          {findings.map(f => (
            <div
              key={f.id}
              className={`p-4 rounded-xl border transition-all ${
                f.priority === 'Crítica'
                  ? 'border-rose-300 bg-rose-50/20'
                  : f.priority === 'Alta'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {f.code}
                  </span>
                  <span className="font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {f.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    f.priority === 'Crítica' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    f.priority === 'Alta' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    Prioridad: {f.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Estado:</span>
                  <select
                    value={f.status}
                    onChange={e => handleUpdateFindingStatus(f.id, e.target.value as FindingStatus)}
                    className="font-bold bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="Abierto">Abierto</option>
                    <option value="En gestión">En gestión</option>
                    <option value="Resuelto">Resuelto</option>
                    <option value="Desestimado">Desestimado</option>
                  </select>
                </div>
              </div>

              <p className="mt-3 text-slate-800 font-medium leading-relaxed">{f.description}</p>

              <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div><strong>Evidencia:</strong> {f.evidence}</div>
                <div><strong>Impacto Clínico:</strong> {f.clinicalImpact || 'En valoración'}</div>
                {f.financialImpact && <div className="md:col-span-2 text-rose-800"><strong>Impacto Financiero / Glosa Potencial:</strong> {f.financialImpact}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create Finding */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Registrar Nuevo Hallazgo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateFinding} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Hallazgo *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as FindingType })}
                    className="w-full bg-white border border-slate-300 rounded p-2 font-semibold"
                  >
                    <option value="Administrativo">Administrativo</option>
                    <option value="Asistencial">Asistencial</option>
                    <option value="Pertinencia">Pertinencia</option>
                    <option value="Oportunidad">Oportunidad</option>
                    <option value="Calidad del registro">Calidad del registro</option>
                    <option value="Seguridad">Seguridad del paciente</option>
                    <option value="Financiero">Financiero / Glosas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridad Semáforo *</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as FindingPriority })}
                    className="w-full bg-white border border-slate-300 rounded p-2 font-bold"
                  >
                    <option value="Crítica">🔴 Crítica (Urgente)</option>
                    <option value="Alta">🟠 Alta (Prioritaria)</option>
                    <option value="Media">🟡 Media</option>
                    <option value="Baja">🟢 Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción del Hallazgo *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle claro y objetivo de la situación encontrada..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evidencia Documental (Página / Folio / Nota)</label>
                <input
                  type="text"
                  placeholder="Ej. Folio 4, Evolución médica del 25/10 a las 14:00"
                  value={formData.evidence}
                  onChange={e => setFormData({ ...formData, evidence: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impacto Clínico</label>
                  <input
                    type="text"
                    placeholder="Riesgo de complicación..."
                    value={formData.clinicalImpact}
                    onChange={e => setFormData({ ...formData, clinicalImpact: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impacto Financiero</label>
                  <input
                    type="text"
                    placeholder="Estancia evitable, glosa..."
                    value={formData.financialImpact}
                    onChange={e => setFormData({ ...formData, financialImpact: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2"
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
                  className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Guardar Hallazgo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// TAB 7: SEGURIDAD DEL PACIENTE (Requirement 19)
const TabSeguridad: React.FC<{
  audit: Audit;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, onSave }) => {
  const [safety, setSafety] = useState<PatientSafetyRecord[]>(audit.safetyRecords || []);
  const [newSafety, setNewSafety] = useState<Partial<PatientSafetyRecord>>({
    eventDate: new Date().toISOString().split('T')[0],
    classification: 'Incidente',
    description: '',
    severity: 'Moderada',
    immediateAction: '',
    reportedToCommittee: true
  });

  const handleAdd = () => {
    if (!newSafety.description?.trim()) return;
    const item: PatientSafetyRecord = {
      id: `saf-${Date.now()}`,
      eventDate: newSafety.eventDate || new Date().toISOString().split('T')[0],
      classification: (newSafety.classification as any) || 'Incidente',
      description: newSafety.description.trim(),
      severity: (newSafety.severity as any) || 'Moderada',
      immediateAction: newSafety.immediateAction || 'Manejo según protocolo',
      reportedToCommittee: !!newSafety.reportedToCommittee
    };
    const updated = [...safety, item];
    setSafety(updated);
    onSave({ ...audit, safetyRecords: updated });
    setNewSafety({ eventDate: new Date().toISOString().split('T')[0], classification: 'Incidente', description: '', severity: 'Moderada', immediateAction: '', reportedToCommittee: true });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">7. Seguridad del Paciente y Eventos Adversos</h2>
          <p className="text-slate-500 text-[11px]">Registro de eventos adversos, IAAS, caídas, úlceras por presión y fallas de seguridad.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 text-xs">+ Notificar Evento o Incidente de Seguridad</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-slate-600 mb-0.5">Fecha del Evento</label>
            <input
              type="date"
              value={newSafety.eventDate}
              onChange={e => setNewSafety({ ...newSafety, eventDate: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Clasificación</label>
            <select
              value={newSafety.classification}
              onChange={e => setNewSafety({ ...newSafety, classification: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold"
            >
              <option value="Incidente">Incidente sin daño</option>
              <option value="Evento Adverso Evitable">Evento Adverso Evitable</option>
              <option value="Evento Adverso No Evitable">Evento Adverso No Evitable</option>
              <option value="Evento Centinela">🔴 Evento Centinela</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Severidad</label>
            <select
              value={newSafety.severity}
              onChange={e => setNewSafety({ ...newSafety, severity: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold"
            >
              <option value="Leve">Leve</option>
              <option value="Moderada">Moderada</option>
              <option value="Grave">Grave</option>
              <option value="Muerte">Muerte</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold cursor-pointer"
            >
              + Agregar Registro
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Descripción del suceso e intervenciones asistenciales</label>
          <textarea
            rows={2}
            value={newSafety.description || ''}
            onChange={e => setNewSafety({ ...newSafety, description: e.target.value })}
            placeholder="Ej. Infección del tracto urinario asociada a catéter vesical (IAAS)..."
            className="w-full bg-white border border-slate-300 rounded p-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        {safety.map(s => (
          <div key={s.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>{s.classification}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">Severidad: {s.severity}</span>
              </div>
              <p className="text-slate-700 mt-1">{s.description}</p>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">{s.eventDate}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// TAB 8: SATISFACCIÓN Y PQR (Requirement 20 & Principle: AI does not infer satisfaction)
const TabSatisfaccion: React.FC<{
  audit: Audit;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, onSave }) => {
  const [satisfaction, setSatisfaction] = useState<UserSatisfactionRecord[]>(audit.userSatisfactionRecords || []);
  const [newRec, setNewRec] = useState<Partial<UserSatisfactionRecord>>({
    date: new Date().toISOString().split('T')[0],
    perception: 'Buena',
    channel: 'Ronda de auditoría concurrente',
    comments: '',
    pqrGenerated: false
  });

  const handleAdd = () => {
    if (!newRec.comments?.trim()) return;
    const item: UserSatisfactionRecord = {
      id: `sat-${Date.now()}`,
      date: newRec.date || new Date().toISOString().split('T')[0],
      perception: (newRec.perception as any) || 'Buena',
      channel: newRec.channel || 'Ronda de auditoría',
      comments: newRec.comments.trim(),
      pqrGenerated: !!newRec.pqrGenerated,
      pqrCode: newRec.pqrCode
    };
    const updated = [...satisfaction, item];
    setSatisfaction(updated);
    onSave({ ...audit, userSatisfactionRecords: updated });
    setNewRec({ date: new Date().toISOString().split('T')[0], perception: 'Buena', channel: 'Ronda de auditoría', comments: '', pqrGenerated: false });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">8. Satisfacción y Atención al Usuario (PQR)</h2>
          <p className="text-slate-500 text-[11px]">
            Registro directo de entrevistas o quejas institucionales (Principio: La IA no infiere satisfacción).
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 text-xs">+ Registrar Manifestación de Usuario o Familiar</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-slate-600 mb-0.5">Fecha</label>
            <input
              type="date"
              value={newRec.date}
              onChange={e => setNewRec({ ...newRec, date: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Percepción</label>
            <select
              value={newRec.perception}
              onChange={e => setNewRec({ ...newRec, perception: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-semibold"
            >
              <option value="Excelente">Excelente</option>
              <option value="Buena">Buena</option>
              <option value="Regular">Regular</option>
              <option value="Mala">Mala</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 mb-0.5">Canal</label>
            <input
              type="text"
              placeholder="Ronda de auditoría / SIAU"
              value={newRec.channel}
              onChange={e => setNewRec({ ...newRec, channel: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded p-1.5"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold cursor-pointer"
            >
              + Guardar Registro
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Manifestación explícita del usuario/familiar</label>
          <textarea
            rows={2}
            value={newRec.comments || ''}
            onChange={e => setNewRec({ ...newRec, comments: e.target.value })}
            placeholder="Comentarios sobre el trato del personal, oportunidad de alimentos, aseo o información médica..."
            className="w-full bg-white border border-slate-300 rounded p-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        {satisfaction.map(s => (
          <div key={s.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Percepción: {s.perception} ({s.channel})</div>
              <p className="text-slate-700 mt-0.5 italic">"{s.comments}"</p>
            </div>
            <span className="text-[11px] text-slate-400">{s.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// TAB 9: REVISIÓN DE ESTANCIA Y PERTINENCIA (Requirement 21)
const TabEstancia: React.FC<{
  audit: Audit;
  patient: Patient;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, patient, onSave }) => {
  const stayDays = storageService.calculateStayDays(patient.admissionDate);
  const [data, setData] = useState(audit.stayReview || {
    calculatedStayDays: stayDays,
    expectedStayDays: 5,
    currentService: patient.service,
    clinicalJustification: 'Paciente en fase aguda requiriendo soporte ventilatorio y titulación de inotrópicos.',
    prolongedStayRisk: stayDays > 7,
    dischargeBarriers: ['Pendiente resultado de cultivo bacteriológico para desescalamiento'],
    dischargePlan: 'Traslado a piso de hospitalización general tras extubación exitosa.'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...audit, stayReview: data });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">9. Revisión de Estancia, Pertinencia y Barreras de Egreso</h2>
          <p className="text-slate-500 text-[11px]">Control de días cama, riesgo de estancia evitable y planificación del alta.</p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Revisión</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <span className="block text-slate-500 text-[11px]">DÍAS DE ESTANCIA ACTUAL</span>
          <span className="text-2xl font-bold text-slate-900">{stayDays} días</span>
          <span className="block text-[10px] text-slate-400">Ingreso: {patient.admissionDate}</span>
        </div>
        <div>
          <label className="block text-slate-600 mb-1">Días Esperados Según Diagnóstico</label>
          <input
            type="number"
            value={data.expectedStayDays || 5}
            onChange={e => setData({ ...data, expectedStayDays: Number(e.target.value) })}
            className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold"
          />
        </div>
        <div>
          <label className="block text-slate-600 mb-1">¿Riesgo de Estancia Prolongada?</label>
          <select
            value={data.prolongedStayRisk ? 'true' : 'false'}
            onChange={e => setData({ ...data, prolongedStayRisk: e.target.value === 'true' })}
            className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-amber-800"
          >
            <option value="true">Sí (&gt; Días esperados)</option>
            <option value="false">No (Dentro de lo previsto)</option>
          </select>
        </div>
        <div>
          <span className="block text-slate-500 text-[11px]">SERVICIO ACTUAL</span>
          <span className="text-base font-bold text-slate-900">{patient.service}</span>
          <span className="block text-[10px] text-slate-400">Cama: {patient.roomBed}</span>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Justificación Clínica de la Estancia *</label>
        <textarea
          rows={3}
          required
          value={data.clinicalJustification || ''}
          onChange={e => setData({ ...data, clinicalJustification: e.target.value })}
          className="w-full bg-white border border-slate-300 rounded-lg p-2 leading-relaxed"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Plan de Egreso Oportuno / Metas de Alta</label>
        <textarea
          rows={2}
          value={data.dischargePlan || ''}
          onChange={e => setData({ ...data, dischargePlan: e.target.value })}
          placeholder="Condiciones clínicas o administrativas requeridas para dar el alta hospitalaria..."
          className="w-full bg-white border border-slate-300 rounded-lg p-2"
        />
      </div>
    </form>
  );
};

// TAB 10: RECOMENDACIONES DEL AUDITOR (Requirement 22)
const TabRecomendaciones: React.FC<{
  audit: Audit;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, onSave }) => {
  const [data, setData] = useState(audit.auditorRecommendations || {
    assistanceRecommendations: 'Optimizar esquema antibiótico con base en reporte de microbiología.',
    pertinenceRecommendations: 'Evaluar retiro de sonda vesical al cumplir 72 horas para prevenir IAAS.',
    clinicalManagementRecommendations: 'Gestionar oportunamente la interconsulta por rehabilitación física.',
    dischargeOpportunityRecommendations: 'Iniciar coordinación con trabajo social para egreso hospitalario seguro.'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...audit, auditorRecommendations: data });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">10. Recomendaciones del Auditor Concurrente</h2>
          <p className="text-slate-500 text-[11px]">Sugerencias de pertinencia, gestión clínica y egreso oportuno para la IPS.</p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Recomendaciones</span>
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block font-semibold text-slate-800 mb-1">Recomendaciones Asistenciales</label>
          <textarea
            rows={2}
            value={data.assistanceRecommendations || ''}
            onChange={e => setData({ ...data, assistanceRecommendations: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">Recomendaciones de Pertinencia Médica y Quirúrgica</label>
          <textarea
            rows={2}
            value={data.pertinenceRecommendations || ''}
            onChange={e => setData({ ...data, pertinenceRecommendations: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">Recomendaciones de Gestión Clínica e Interconsultas</label>
          <textarea
            rows={2}
            value={data.clinicalManagementRecommendations || ''}
            onChange={e => setData({ ...data, clinicalManagementRecommendations: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">Recomendaciones de Egreso Oportuno</label>
          <textarea
            rows={2}
            value={data.dischargeOpportunityRecommendations || ''}
            onChange={e => setData({ ...data, dischargeOpportunityRecommendations: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>
    </form>
  );
};

// TAB 11: ACCIONES Y SEGUIMIENTO (Requirement 23)
const TabAcciones: React.FC<{
  audit: Audit;
  onSave: (audit: Audit) => void;
  activeUser: UserType;
}> = ({ audit, onSave }) => {
  const [actions, setActions] = useState<CorrectiveAction[]>(audit.actions || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<CorrectiveAction>>({
    findingCode: audit.findings?.[0]?.code || 'GENERAL',
    actionText: '',
    responsibleName: 'Coordinador Asistencial IPS',
    responsibleRole: 'Médico Jefe de Servicio',
    deadlineDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'Pendiente'
  });

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.actionText?.trim()) return;

    const newAction: CorrectiveAction = {
      id: `act-${Date.now()}`,
      auditId: audit.id,
      patientId: audit.patientId,
      ipsId: audit.ipsId,
      findingCode: formData.findingCode || 'GENERAL',
      actionText: formData.actionText.trim(),
      responsibleName: formData.responsibleName || 'Coordinador IPS',
      responsibleRole: formData.responsibleRole || 'Médico Jefe',
      deadlineDate: formData.deadlineDate || new Date().toISOString().split('T')[0],
      status: (formData.status as ActionStatus) || 'Pendiente',
      followUpNotes: [{
        date: new Date().toISOString().split('T')[0],
        auditorName: 'Auditor Concurrente',
        observation: 'Compromiso registrado en acta de auditoría concurrente.'
      }]
    };

    const updated = [newAction, ...actions];
    setActions(updated);
    onSave({ ...audit, actions: updated });
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (actionId: string, status: ActionStatus) => {
    const updated = actions.map(a => (a.id === actionId ? { ...a, status } : a));
    setActions(updated);
    onSave({ ...audit, actions: updated });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">11. Plan de Acciones y Seguimiento de Compromisos</h2>
          <p className="text-slate-500 text-[11px]">Compromisos con fecha límite, responsable en la IPS y trazabilidad de cumplimiento.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ REGISTRAR ACCIÓN</span>
        </button>
      </div>

      <div className="space-y-3">
        {actions.map(act => {
          const isOverdue = act.status !== 'Cumplida' && new Date(act.deadlineDate) < new Date();

          return (
            <div key={act.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{act.findingCode}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-medium">{act.responsibleName} ({act.responsibleRole})</span>
                  </div>
                  <p className="text-slate-800 font-semibold mt-1">{act.actionText}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={act.status}
                    onChange={e => handleUpdateStatus(act.id, e.target.value as ActionStatus)}
                    className={`font-bold px-2 py-1 rounded text-xs border ${
                      act.status === 'Cumplida' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      isOverdue ? 'bg-rose-50 text-rose-800 border-rose-300' :
                      'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Cumplida">Cumplida</option>
                    <option value="Vencida">Vencida</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                <span className={isOverdue ? 'text-rose-700 font-bold' : ''}>
                  Plazo límite: <strong>{act.deadlineDate}</strong> {isOverdue && '(VENCIDO)'}
                </span>
                <span>{act.followUpNotes?.length || 0} nota(s) de seguimiento</span>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Registrar Compromiso / Acción Correctiva</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateAction} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Acción Correctiva / Preventiva *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle el compromiso adquirido por la IPS..."
                  value={formData.actionText}
                  onChange={e => setFormData({ ...formData, actionText: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsable en IPS</label>
                  <input
                    type="text"
                    value={formData.responsibleName}
                    onChange={e => setFormData({ ...formData, responsibleName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={formData.responsibleRole}
                    onChange={e => setFormData({ ...formData, responsibleRole: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha Límite *</label>
                  <input
                    type="date"
                    required
                    value={formData.deadlineDate}
                    onChange={e => setFormData({ ...formData, deadlineDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Inicial</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as ActionStatus })}
                    className="w-full bg-white border border-slate-300 rounded p-2 font-semibold"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                  </select>
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
                  className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Guardar Acción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// TAB 12: GENERACIÓN DE INFORME (Requirement 24 - 18 sections)
const TabInforme: React.FC<{
  audit: Audit;
  patient: Patient;
  ips: IPS | null;
  activeUser: UserType;
}> = ({ audit, patient, ips, activeUser }) => {
  const [reportHTML, setReportHTML] = useState<string>('');

  useEffect(() => {
    const reportData = reportService.prepareFullAuditReportData(audit, patient, ips || undefined);
    const html = reportService.renderFullAuditReportHTML(reportData);
    setReportHTML(html);
  }, [audit, patient, ips]);

  const handlePrintOrPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">12. Estructura Oficial del Informe de Auditoría Concurrente</h2>
          <p className="text-slate-500 text-[11px]">
            Estructura estandarizada de 18 secciones conforme a la Guía Oficial de Auditoría Concurrente.
          </p>
        </div>
        <button
          onClick={handlePrintOrPDF}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Imprimir / Exportar PDF</span>
        </button>
      </div>

      {/* Rendered report preview */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50 p-4">
        <iframe
          srcDoc={reportHTML}
          title="Vista previa del informe de auditoría"
          className="w-full h-[650px] bg-white rounded-lg border border-slate-300 shadow-xs"
        />
      </div>
    </div>
  );
};

// TAB 13: DOCUMENTOS Y ANEXOS (Requirement 25)
const TabDocumentos: React.FC<{
  audit: Audit;
  onNavigateToUpload: () => void;
}> = ({ audit, onNavigateToUpload }) => {
  const documents = storageService.getDocuments(audit.id);

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">13. Documentos y Anexos Vinculados</h2>
          <p className="text-slate-500 text-[11px]">Historias clínicas en PDF, consentimientos y soportes asociados.</p>
        </div>
        <button
          onClick={onNavigateToUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cargar Nuevo PDF</span>
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 space-y-2">
          <Paperclip className="w-8 h-8 text-slate-300 mx-auto" />
          <p>No hay documentos PDF vinculados a esta auditoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map(doc => (
            <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">{doc.fileName}</div>
                  <div className="text-[11px] text-slate-500">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB · {doc.pageCount} páginas · {doc.documentType}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {doc.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded">
                "{doc.extractedTextSnippet?.slice(0, 150)}..."
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// TAB 14: TRAZABILIDAD (Requirement 26)
const TabTrazabilidad: React.FC<{
  auditId: string;
}> = ({ auditId }) => {
  const auditLogs = storageService.getAuditTrail(auditId);

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">14. Trazabilidad y Registro de Auditoría (Audit Trail)</h2>
          <p className="text-slate-500 text-[11px]">Registro inmutable de acciones, usuarios, roles y marcas de tiempo.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Fecha y Hora</th>
              <th className="py-2.5 px-3">Usuario</th>
              <th className="py-2.5 px-3">Rol</th>
              <th className="py-2.5 px-3">Acción Realizada</th>
              <th className="py-2.5 px-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                  {new Date(log.timestamp).toLocaleString('es-CO')}
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">{log.userName}</td>
                <td className="py-2 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {log.userRole}
                  </span>
                </td>
                <td className="py-2 px-3 font-medium text-cyan-900">{log.action}</td>
                <td className="py-2 px-3 text-slate-600">{log.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
