import {
  IPS,
  User,
  Patient,
  Audit,
  ClinicalDocHC,
  IngresoNote,
  DailyFollowUp,
  DiagnosticAid,
  ProcedureItem,
  TreatmentItem,
  AdditionalTreatments,
  Finding,
  UserSatisfaction,
  StayAnalysis,
  RecommendationItem,
  AuditAction,
  AuditTrail,
  UserRole,
  KnowledgeSource,
  AuditCriterion,
  SourceVerificationLog,
  ValidityStatus,
  AuditSession,
  ContextualFinding,
  ActionPlan24Hour,
  ConflictReview,
  IPSAggregatedMetrics,
  AuditorValidationStatus,
  GeneratedAuditReport,
  DashboardSnapshot
} from '../types';

import {
  INITIAL_IPS,
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_AUDITS,
  INITIAL_DOCUMENTS,
  INITIAL_INGRESO_NOTES,
  INITIAL_DAILY_FOLLOWUPS,
  INITIAL_DIAGNOSTIC_AIDS,
  INITIAL_PROCEDURES,
  INITIAL_TREATMENTS,
  INITIAL_ADDITIONAL_TREATMENTS,
  INITIAL_FINDINGS,
  INITIAL_USER_SATISFACTION,
  INITIAL_STAY_ANALYSIS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_ACTIONS,
  INITIAL_AUDIT_TRAIL
} from '../data/seedData';
import { INITIAL_KNOWLEDGE_SOURCES, INITIAL_AUDIT_CRITERIA } from '../data/masterKnowledgeSources';
import { INITIAL_AUDIT_SESSIONS } from '../data/seedContextualSessions';
import { INITIAL_GENERATED_REPORTS } from '../data/seedReports';

const STORAGE_KEYS = {
  IPS: 'auditoria_ia_ips',
  USERS: 'auditoria_ia_users',
  ACTIVE_USER: 'auditoria_ia_active_user',
  PATIENTS: 'auditoria_ia_patients',
  AUDITS: 'auditoria_ia_audits',
  DOCUMENTS: 'auditoria_ia_documents',
  INGRESO_NOTES: 'auditoria_ia_ingreso_notes',
  DAILY_FOLLOWUPS: 'auditoria_ia_daily_followups',
  DIAGNOSTIC_AIDS: 'auditoria_ia_diagnostic_aids',
  PROCEDURES: 'auditoria_ia_procedures',
  TREATMENTS: 'auditoria_ia_treatments',
  ADDITIONAL_TREATMENTS: 'auditoria_ia_add_treatments',
  FINDINGS: 'auditoria_ia_findings',
  USER_SATISFACTION: 'auditoria_ia_satisfaction',
  STAY_ANALYSIS: 'auditoria_ia_stay_analysis',
  RECOMMENDATIONS: 'auditoria_ia_recommendations',
  ACTIONS: 'auditoria_ia_actions',
  AUDIT_TRAIL: 'auditoria_ia_audit_trail',
  KNOWLEDGE_SOURCES: 'auditoria_ia_knowledge_sources',
  AUDIT_CRITERIA: 'auditoria_ia_audit_criteria',
  VERIFICATION_LOGS: 'auditoria_ia_verification_logs',
  AUDIT_SESSIONS: 'auditoria_ia_audit_sessions',
  GENERATED_REPORTS: 'auditoria_ia_generated_reports',
  DASHBOARD_SNAPSHOTS: 'auditoria_ia_dashboard_snapshots'
};

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage key: ${key}`, e);
    }
  }

  // --- USERS & AUTH ---
  getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  saveUsers(users: User[]): void {
    this.set(STORAGE_KEYS.USERS, users);
    this.logAuditTrail('ACTUALIZACION_USUARIOS', 'Usuario', 'all', undefined, JSON.stringify(users), 'Lista de usuarios actualizada');
  }

  getActiveUser(): User {
    const users = this.getUsers();
    const stored = this.get<User | null>(STORAGE_KEYS.ACTIVE_USER, null);
    if (stored) {
      const found = users.find(u => u.id === stored.id);
      if (found) return found;
    }
    return users[1] || users[0]; // Dra. Patricia Charry (Auditor) default
  }

  setActiveUser(user: User): void {
    this.set(STORAGE_KEYS.ACTIVE_USER, user);
    this.logAuditTrail('CAMBIO_USUARIO_ACTIVO', 'Usuario', user.id, undefined, user.name, `Sesión cambiada a ${user.name} (${user.role})`);
  }

  switchRole(newRole: UserRole): void {
    const current = this.getActiveUser();
    const updated = { ...current, role: newRole };
    this.set(STORAGE_KEYS.ACTIVE_USER, updated);
    this.logAuditTrail('CAMBIO_ROL', 'Usuario', current.id, current.role, newRole, `Rol temporal cambiado a ${newRole}`);
  }

  // --- IPS ---
  getIPS(): IPS[] {
    return this.get<IPS[]>(STORAGE_KEYS.IPS, INITIAL_IPS);
  }

  saveIPS(ips: IPS): void {
    const list = this.getIPS();
    const index = list.findIndex(i => i.id === ips.id);
    let prevVal = '';
    if (index >= 0) {
      prevVal = JSON.stringify(list[index]);
      list[index] = ips;
    } else {
      list.push(ips);
    }
    this.set(STORAGE_KEYS.IPS, list);
    this.logAuditTrail(
      index >= 0 ? 'EDICION_IPS' : 'CREACION_IPS',
      'IPS',
      ips.id,
      prevVal,
      JSON.stringify(ips),
      `IPS ${ips.name} (${ips.city}) ${index >= 0 ? 'actualizada' : 'creada'}`
    );
  }

  toggleIPSStatus(id: string): void {
    const list = this.getIPS();
    const item = list.find(i => i.id === id);
    if (item) {
      const prev = item.status;
      item.status = item.status === 'Activa' ? 'Inactiva' : 'Activa';
      this.set(STORAGE_KEYS.IPS, list);
      this.logAuditTrail('CAMBIO_ESTADO_IPS', 'IPS', id, prev, item.status, `IPS ${item.name} ahora está ${item.status}`);
    }
  }

  // --- PATIENTS ---
  getPatients(): Patient[] {
    return this.get<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  }

  getPatientById(id: string): Patient | undefined {
    return this.getPatients().find(p => p.id === id);
  }

  savePatient(patient: Patient): Patient {
    const list = this.getPatients();
    const index = list.findIndex(p => p.id === patient.id);
    let saved: Patient;
    if (index >= 0) {
      const prev = JSON.stringify(list[index]);
      list[index] = patient;
      saved = patient;
      this.logAuditTrail('EDICION_PACIENTE', 'Paciente', patient.id, prev, JSON.stringify(patient), `Paciente ${patient.fullName} actualizado`);
    } else {
      saved = {
        ...patient,
        id: patient.id || `pat-${Date.now()}`,
        internalId: patient.internalId || `PAC-${Date.now().toString().slice(-4)}`
      };
      list.unshift(saved);
      this.logAuditTrail('CREACION_PACIENTE', 'Paciente', saved.id, undefined, JSON.stringify(saved), `Nuevo paciente registrado: ${saved.fullName} (${saved.docType} ${saved.docNumber})`);
    }
    this.set(STORAGE_KEYS.PATIENTS, list);
    return saved;
  }

  // --- AUDITS ---
  getAudits(): Audit[] {
    return this.get<Audit[]>(STORAGE_KEYS.AUDITS, INITIAL_AUDITS);
  }

  getAuditById(id: string): Audit | undefined {
    return this.getAudits().find(a => a.id === id);
  }

  saveAudit(audit: Audit, userName?: string, userRole?: string, details?: string): Audit {
    const list = this.getAudits();
    const index = list.findIndex(a => a.id === audit.id);
    let saved: Audit;
    const now = new Date().toISOString();
    if (index >= 0) {
      const prev = JSON.stringify(list[index]);
      saved = { ...audit, updatedAt: now };
      list[index] = saved;
      this.logAuditTrail('EDICION_AUDITORIA', 'Auditoria', saved.id, prev, JSON.stringify(saved), details || `Auditoría ${saved.auditCode} actualizada por ${userName || 'Auditor'}`);
    } else {
      saved = {
        ...audit,
        id: audit.id || `aud-${Date.now()}`,
        auditCode: audit.auditCode || `AUD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        createdAt: now,
        updatedAt: now
      };
      list.unshift(saved);
      this.logAuditTrail('CREACION_AUDITORIA', 'Auditoria', saved.id, undefined, JSON.stringify(saved), details || `Nueva auditoría creada: ${saved.auditCode} para paciente ${saved.patientId} por ${userName || 'Auditor'}`);
    }
    this.set(STORAGE_KEYS.AUDITS, list);
    return saved;
  }

  updateAuditStatus(auditId: string, status: Audit['status']): void {
    const list = this.getAudits();
    const item = list.find(a => a.id === auditId);
    if (item) {
      const prev = item.status;
      item.status = status;
      item.updatedAt = new Date().toISOString();
      if (status === 'Validada') {
        const user = this.getActiveUser();
        item.validatedBy = user.name;
        item.validationDate = new Date().toISOString();
      }
      this.set(STORAGE_KEYS.AUDITS, list);
      this.logAuditTrail('CAMBIO_ESTADO_AUDITORIA', 'Auditoria', auditId, prev, status, `Estado de auditoría ${item.auditCode} cambiado a ${status}`);
    }
  }

  // --- DOCUMENTS ---
  getDocuments(auditId?: string, patientId?: string): ClinicalDocHC[] {
    const all = this.get<ClinicalDocHC[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    if (auditId) return all.filter(d => d.auditId === auditId);
    if (patientId) return all.filter(d => d.patientId === patientId);
    return all;
  }

  saveDocument(doc: ClinicalDocHC): ClinicalDocHC {
    const list = this.get<ClinicalDocHC[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const index = list.findIndex(d => d.id === doc.id);
    let saved: ClinicalDocHC;
    if (index >= 0) {
      list[index] = doc;
      saved = doc;
    } else {
      saved = { ...doc, id: doc.id || `doc-${Date.now()}` };
      list.unshift(saved);
      this.logAuditTrail('CARGA_DOCUMENTO_HC', 'DocumentoHC', saved.id, undefined, saved.fileName, `Cargado archivo PDF ${saved.fileName} (${(saved.fileSize / 1024 / 1024).toFixed(2)} MB)`);
    }
    this.set(STORAGE_KEYS.DOCUMENTS, list);
    return saved;
  }

  // --- INGRESO NOTES ---
  getIngresoNote(auditId: string): IngresoNote | null {
    const map = this.get<Record<string, IngresoNote>>(STORAGE_KEYS.INGRESO_NOTES, INITIAL_INGRESO_NOTES);
    return map[auditId] || null;
  }

  saveIngresoNote(note: IngresoNote): void {
    const map = this.get<Record<string, IngresoNote>>(STORAGE_KEYS.INGRESO_NOTES, INITIAL_INGRESO_NOTES);
    map[note.auditId] = note;
    this.set(STORAGE_KEYS.INGRESO_NOTES, map);
    this.logAuditTrail('GUARDAR_NOTA_INGRESO', 'NotaIngreso', note.auditId, undefined, undefined, `Nota de ingreso registrada para auditoría ${note.auditId}`);
  }

  // --- DAILY FOLLOWUPS ---
  getDailyFollowUps(auditId: string): DailyFollowUp[] {
    const map = this.get<Record<string, DailyFollowUp[]>>(STORAGE_KEYS.DAILY_FOLLOWUPS, INITIAL_DAILY_FOLLOWUPS);
    return map[auditId] || [];
  }

  saveDailyFollowUp(followUp: DailyFollowUp): void {
    const map = this.get<Record<string, DailyFollowUp[]>>(STORAGE_KEYS.DAILY_FOLLOWUPS, INITIAL_DAILY_FOLLOWUPS);
    const list = map[followUp.auditId] || [];
    const index = list.findIndex(f => f.id === followUp.id);
    if (index >= 0) {
      list[index] = followUp;
    } else {
      const saved = { ...followUp, id: followUp.id || `fol-${Date.now()}`, createdAt: new Date().toISOString() };
      list.push(saved);
    }
    map[followUp.auditId] = list;
    this.set(STORAGE_KEYS.DAILY_FOLLOWUPS, map);
    this.logAuditTrail('GUARDAR_SEGUIMIENTO_DIARIO', 'SeguimientoDiario', followUp.auditId, undefined, undefined, `Seguimiento diario fecha ${followUp.date} guardado`);
  }

  // --- DIAGNOSTIC AIDS ---
  getDiagnosticAids(auditId: string): DiagnosticAid[] {
    const map = this.get<Record<string, DiagnosticAid[]>>(STORAGE_KEYS.DIAGNOSTIC_AIDS, INITIAL_DIAGNOSTIC_AIDS);
    return map[auditId] || [];
  }

  saveDiagnosticAid(item: DiagnosticAid): void {
    const map = this.get<Record<string, DiagnosticAid[]>>(STORAGE_KEYS.DIAGNOSTIC_AIDS, INITIAL_DIAGNOSTIC_AIDS);
    const list = map[item.auditId] || [];
    const index = list.findIndex(d => d.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push({ ...item, id: item.id || `diag-${Date.now()}` });
    }
    map[item.auditId] = list;
    this.set(STORAGE_KEYS.DIAGNOSTIC_AIDS, map);
    this.logAuditTrail('REGISTRO_AYUDA_DIAGNOSTICA', 'AyudaDiagnostica', item.auditId, undefined, item.studyName, `Estudio ${item.studyName} (${item.status}) guardado`);
  }

  // --- PROCEDURES ---
  getProcedures(auditId: string): ProcedureItem[] {
    const map = this.get<Record<string, ProcedureItem[]>>(STORAGE_KEYS.PROCEDURES, INITIAL_PROCEDURES);
    return map[auditId] || [];
  }

  saveProcedure(item: ProcedureItem): void {
    const map = this.get<Record<string, ProcedureItem[]>>(STORAGE_KEYS.PROCEDURES, INITIAL_PROCEDURES);
    const list = map[item.auditId] || [];
    const index = list.findIndex(p => p.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push({ ...item, id: item.id || `proc-${Date.now()}` });
    }
    map[item.auditId] = list;
    this.set(STORAGE_KEYS.PROCEDURES, map);
    this.logAuditTrail('REGISTRO_PROCEDIMIENTO', 'Procedimiento', item.auditId, undefined, item.procedureName, `Procedimiento ${item.procedureName} guardado`);
  }

  // --- TREATMENTS ---
  getTreatments(auditId: string): TreatmentItem[] {
    const map = this.get<Record<string, TreatmentItem[]>>(STORAGE_KEYS.TREATMENTS, INITIAL_TREATMENTS);
    return map[auditId] || [];
  }

  saveTreatment(item: TreatmentItem): void {
    const map = this.get<Record<string, TreatmentItem[]>>(STORAGE_KEYS.TREATMENTS, INITIAL_TREATMENTS);
    const list = map[item.auditId] || [];
    const index = list.findIndex(t => t.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push({ ...item, id: item.id || `tx-${Date.now()}` });
    }
    map[item.auditId] = list;
    this.set(STORAGE_KEYS.TREATMENTS, map);
    this.logAuditTrail('REGISTRO_TRATAMIENTO', 'Medicamento', item.auditId, undefined, item.medication, `Medicamento ${item.medication} guardado`);
  }

  getAdditionalTreatments(auditId: string): AdditionalTreatments {
    const map = this.get<Record<string, AdditionalTreatments>>(STORAGE_KEYS.ADDITIONAL_TREATMENTS, INITIAL_ADDITIONAL_TREATMENTS);
    return map[auditId] || {
      auditId,
      oxygenSupport: 'No requiere',
      ventilatorySupport: 'No requiere',
      rehabilitation: 'No requiere',
      otherTreatments: 'Ninguno registrado'
    };
  }

  saveAdditionalTreatments(item: AdditionalTreatments): void {
    const map = this.get<Record<string, AdditionalTreatments>>(STORAGE_KEYS.ADDITIONAL_TREATMENTS, INITIAL_ADDITIONAL_TREATMENTS);
    map[item.auditId] = item;
    this.set(STORAGE_KEYS.ADDITIONAL_TREATMENTS, map);
  }

  // --- FINDINGS ---
  getFindings(auditId?: string): Finding[] {
    const all = this.get<Finding[]>(STORAGE_KEYS.FINDINGS, INITIAL_FINDINGS);
    if (auditId) return all.filter(f => f.auditId === auditId);
    return all;
  }

  saveFinding(finding: Finding): Finding {
    const list = this.get<Finding[]>(STORAGE_KEYS.FINDINGS, INITIAL_FINDINGS);
    const index = list.findIndex(f => f.id === finding.id);
    let saved: Finding;
    if (index >= 0) {
      list[index] = finding;
      saved = finding;
      this.logAuditTrail('EDICION_HALLAZGO', 'Hallazgo', finding.id, undefined, finding.description, `Hallazgo (${finding.priority}) actualizado`);
    } else {
      saved = {
        ...finding,
        id: finding.id || `find-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      list.unshift(saved);
      this.logAuditTrail('CREACION_HALLAZGO', 'Hallazgo', saved.id, undefined, saved.description, `Nuevo hallazgo (${saved.priority} - ${saved.category}): ${saved.description}`);
    }
    this.set(STORAGE_KEYS.FINDINGS, list);
    return saved;
  }

  updateFindingStatus(id: string, status: Finding['status']): void {
    const list = this.get<Finding[]>(STORAGE_KEYS.FINDINGS, INITIAL_FINDINGS);
    const item = list.find(f => f.id === id);
    if (item) {
      const prev = item.status;
      item.status = status;
      if (status === 'Cumplido' || status === 'Cerrado') {
        item.resolvedAt = new Date().toISOString();
      }
      this.set(STORAGE_KEYS.FINDINGS, list);
      this.logAuditTrail('CAMBIO_ESTADO_HALLAZGO', 'Hallazgo', id, prev, status, `Hallazgo pasó a estado ${status}`);
    }
  }

  // --- USER SATISFACTION ---
  getUserSatisfaction(auditId: string): UserSatisfaction {
    const map = this.get<Record<string, UserSatisfaction>>(STORAGE_KEYS.USER_SATISFACTION, INITIAL_USER_SATISFACTION);
    return map[auditId] || {
      auditId,
      dignifiedTreatment: 'No informado',
      dxInformation: 'No informado',
      txInformation: 'No informado',
      nonConformities: 'No',
      unresolvedNeeds: 'No',
      emotionalSupport: 'No requerido',
      comfort: 'No informado',
      observations: ''
    };
  }

  saveUserSatisfaction(data: UserSatisfaction): void {
    const map = this.get<Record<string, UserSatisfaction>>(STORAGE_KEYS.USER_SATISFACTION, INITIAL_USER_SATISFACTION);
    map[data.auditId] = { ...data, updatedAt: new Date().toISOString() };
    this.set(STORAGE_KEYS.USER_SATISFACTION, map);
    this.logAuditTrail('REGISTRO_SATISFACCION', 'SatisfaccionUsuario', data.auditId, undefined, undefined, 'Formulario de satisfacción del usuario registrado');
  }

  // --- STAY ANALYSIS ---
  getStayAnalysis(auditId: string): StayAnalysis {
    const map = this.get<Record<string, StayAnalysis>>(STORAGE_KEYS.STAY_ANALYSIS, INITIAL_STAY_ANALYSIS);
    if (map[auditId]) return map[auditId];

    const audit = this.getAuditById(auditId);
    const patient = audit ? this.getPatientById(audit.patientId) : null;
    const admission = patient?.admissionDate || new Date().toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const diffTime = Math.abs(new Date(today).getTime() - new Date(admission).getTime());
    const stayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    return {
      auditId,
      admissionDate: admission,
      currentDate: today,
      stayDays,
      clinicalJustification: '',
      prolongedStayRisk: stayDays > 10 ? 'Alto' : 'Bajo',
      administrativeBarriers: '',
      operationalBarriers: '',
      clinicalBarriers: '',
      earlyDischargePossibility: 'En evaluación',
      ipsActions: '',
      avoidableCostsEstimated: 0
    };
  }

  saveStayAnalysis(data: StayAnalysis): void {
    const map = this.get<Record<string, StayAnalysis>>(STORAGE_KEYS.STAY_ANALYSIS, INITIAL_STAY_ANALYSIS);
    map[data.auditId] = { ...data, updatedAt: new Date().toISOString() };
    this.set(STORAGE_KEYS.STAY_ANALYSIS, map);
    this.logAuditTrail('REGISTRO_ANALISIS_ESTANCIA', 'AnalisisEstancia', data.auditId, undefined, undefined, `Análisis de estancia registrado (${data.stayDays} días, Riesgo: ${data.prolongedStayRisk})`);
  }

  // --- RECOMMENDATIONS ---
  getRecommendations(auditId?: string): RecommendationItem[] {
    const all = this.get<RecommendationItem[]>(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS);
    if (auditId) return all.filter(r => r.auditId === auditId);
    return all;
  }

  saveRecommendation(item: RecommendationItem): RecommendationItem {
    const list = this.get<RecommendationItem[]>(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS);
    const index = list.findIndex(r => r.id === item.id);
    let saved: RecommendationItem;
    if (index >= 0) {
      list[index] = item;
      saved = item;
    } else {
      saved = {
        ...item,
        id: item.id || `rec-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      list.unshift(saved);
      this.logAuditTrail('CREACION_RECOMENDACION', 'Recomendacion', saved.id, undefined, saved.requiredAction, `Recomendación agregada (24h: ${saved.isRequiredIn24Hours ? 'SÍ' : 'NO'})`);
    }
    this.set(STORAGE_KEYS.RECOMMENDATIONS, list);

    // Auto synchronize into Actions table if not present
    this.syncActionFromRecommendation(saved);
    return saved;
  }

  // --- ACTIONS & FOLLOWUP ---
  getActions(): AuditAction[] {
    return this.get<AuditAction[]>(STORAGE_KEYS.ACTIONS, INITIAL_ACTIONS);
  }

  saveAction(action: AuditAction): AuditAction {
    const list = this.get<AuditAction[]>(STORAGE_KEYS.ACTIONS, INITIAL_ACTIONS);
    const index = list.findIndex(a => a.id === action.id);
    let saved: AuditAction;
    const now = new Date().toISOString();
    if (index >= 0) {
      list[index] = { ...action, updatedAt: now };
      saved = list[index];
    } else {
      saved = {
        ...action,
        id: action.id || `act-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      list.unshift(saved);
      this.logAuditTrail('CREACION_ACCION', 'AccionSeguimiento', saved.id, undefined, saved.actionDescription, `Acción creada: ${saved.actionDescription} (Resp: ${saved.responsible})`);
    }
    this.set(STORAGE_KEYS.ACTIONS, list);
    return saved;
  }

  updateActionStatus(actionId: string, status: AuditAction['status']): void {
    const list = this.getActions();
    const item = list.find(a => a.id === actionId);
    if (item) {
      const prev = item.status;
      item.status = status;
      item.updatedAt = new Date().toISOString();
      this.set(STORAGE_KEYS.ACTIONS, list);
      this.logAuditTrail('CAMBIO_ESTADO_ACCION', 'AccionSeguimiento', actionId, prev, status, `Acción cambió a estado ${status}`);
    }
  }

  addActionFollowUp(actionId: string, observation: string, auditorName: string): void {
    const list = this.getActions();
    const item = list.find(a => a.id === actionId);
    if (item) {
      if (!item.followUpNotes) item.followUpNotes = [];
      item.followUpNotes.push({
        date: new Date().toISOString().split('T')[0],
        auditorName,
        observation
      });
      item.updatedAt = new Date().toISOString();
      this.set(STORAGE_KEYS.ACTIONS, list);
      this.logAuditTrail('SEGUIMIENTO_ACCION', 'AccionSeguimiento', actionId, undefined, observation, `Nota de seguimiento agregada por ${auditorName}`);
    }
  }

  private syncActionFromRecommendation(rec: RecommendationItem): void {
    const audit = this.getAuditById(rec.auditId);
    const patient = audit ? this.getPatientById(audit.patientId) : null;
    const ipsList = this.getIPS();
    const ips = audit ? ipsList.find(i => i.id === audit.ipsId) : null;

    const actionList = this.getActions();
    const existing = actionList.find(a => a.recommendationId === rec.id);

    if (existing) {
      existing.actionDescription = rec.requiredAction;
      existing.responsible = rec.responsible;
      existing.deadline = rec.deadline;
      existing.priority = rec.priority;
      existing.isRequiredIn24Hours = rec.isRequiredIn24Hours;
      this.set(STORAGE_KEYS.ACTIONS, actionList);
    } else {
      const newAction: AuditAction = {
        id: `act-${Date.now()}`,
        recommendationId: rec.id,
        auditId: rec.auditId,
        patientId: patient?.id || '',
        patientName: patient?.fullName || 'Paciente Ficticio',
        ipsId: ips?.id || '',
        ipsName: ips?.name || 'IPS Asignada',
        actionDescription: rec.requiredAction,
        responsible: rec.responsible,
        deadline: rec.deadline,
        priority: rec.priority,
        status: rec.status === 'Cumplido' ? 'Cumplido' : rec.status === 'Vencido' ? 'Vencido' : 'Pendiente',
        isRequiredIn24Hours: rec.isRequiredIn24Hours,
        service: patient?.service || 'General',
        roomBed: patient?.roomBed || 'Cama',
        createdAt: new Date().toISOString()
      };
      this.saveAction(newAction);
    }
  }

  // --- AUDIT TRAIL / LOGS ---
  getAuditTrail(auditId?: string): AuditTrail[] {
    const all = this.get<AuditTrail[]>(STORAGE_KEYS.AUDIT_TRAIL, INITIAL_AUDIT_TRAIL);
    if (auditId) {
      return all.filter(t => t.recordId === auditId || t.details?.includes(auditId));
    }
    return all;
  }

  logAuditTrail(
    action: string,
    affectedRecord: string,
    recordId: string,
    previousValue?: string,
    newValue?: string,
    details?: string
  ): void {
    const logs = this.getAuditTrail();
    const user = this.getActiveUser();
    const entry: AuditTrail = {
      id: `trail-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      timestamp: new Date().toISOString(),
      action,
      affectedRecord,
      recordId,
      previousValue,
      newValue,
      details
    };
    logs.unshift(entry);
    this.set(STORAGE_KEYS.AUDIT_TRAIL, logs.slice(0, 500)); // retain last 500 entries
  }

  // --- DYNAMIC CALCULATIONS & METRICS ---
  getDashboardMetrics(filter?: { ipsId?: string; startDate?: string; endDate?: string; service?: string; auditorId?: string; status?: string }) {
    let patients = this.getPatients();
    let audits = this.getAudits();
    let findings = this.getFindings();
    let actions = this.getActions();

    if (filter?.ipsId && filter.ipsId !== 'all') {
      patients = patients.filter(p => p.ipsId === filter.ipsId);
      audits = audits.filter(a => a.ipsId === filter.ipsId);
      findings = findings.filter(f => f.ipsId === filter.ipsId);
      actions = actions.filter(a => a.ipsId === filter.ipsId);
    }

    if (filter?.service && filter.service !== 'all') {
      patients = patients.filter(p => p.service.toLowerCase().includes(filter.service!.toLowerCase()));
    }

    if (filter?.auditorId && filter.auditorId !== 'all') {
      audits = audits.filter(a => a.auditorId === filter.auditorId);
    }

    if (filter?.status && filter.status !== 'all') {
      audits = audits.filter(a => a.status === filter.status);
    }

    // Dynamic counts
    const totalPatients = patients.length;
    const activeAudits = audits.filter(a => a.status === 'En revisión' || a.status === 'Borrador' || a.status === 'Pendiente de validación').length;
    const criticalFindings = findings.filter(f => f.priority === 'Crítico' && f.status !== 'Cerrado' && f.status !== 'Cumplido').length;
    const highPriorityFindings = findings.filter(f => f.priority === 'Alto' && f.status !== 'Cerrado' && f.status !== 'Cumplido').length;
    
    // Prolonged stay risk count: patients with > 7 days or stayAnalysis risk Alto/Crítico
    const prolongedStayRiskCount = patients.filter(p => {
      const days = this.calculateStayDays(p.admissionDate);
      return days > 7;
    }).length;

    // Diagnostic aids pending
    const allDiagAidsMap = this.get<Record<string, DiagnosticAid[]>>(STORAGE_KEYS.DIAGNOSTIC_AIDS, INITIAL_DIAGNOSTIC_AIDS);
    let pendingDiagAidsCount = 0;
    Object.values(allDiagAidsMap).forEach(list => {
      list.forEach(item => {
        if (item.status === 'Solicitado' || item.status === 'Demorado' || item.status === 'Resultado pendiente' || item.status === 'Interpretación pendiente') {
          pendingDiagAidsCount++;
        }
      });
    });

    // Interconsultas / Special procedures pending
    const allProcsMap = this.get<Record<string, ProcedureItem[]>>(STORAGE_KEYS.PROCEDURES, INITIAL_PROCEDURES);
    let pendingProcsCount = 0;
    Object.values(allProcsMap).forEach(list => {
      list.forEach(p => {
        if (p.status === 'Solicitado' || p.status === 'Pendiente' || p.status === 'Demorado') {
          pendingProcsCount++;
        }
      });
    });

    // Overdue actions: deadline < today & status !== 'Cumplido'
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueActionsCount = actions.filter(a => a.status === 'Vencido' || (a.status !== 'Cumplido' && a.deadline < todayStr)).length;

    return {
      totalPatients,
      activeAudits,
      criticalFindings,
      highPriorityFindings,
      prolongedStayRiskCount,
      pendingDiagAidsCount,
      pendingProcsCount,
      overdueActionsCount
    };
  }

  getIPSComparativeMatrix() {
    const ipsList = this.getIPS();
    const patients = this.getPatients();
    const audits = this.getAudits();
    const findings = this.getFindings();
    const actions = this.getActions();
    const todayStr = new Date().toISOString().split('T')[0];

    return ipsList.map(ips => {
      const ipsPatients = patients.filter(p => p.ipsId === ips.id);
      const ipsAudits = audits.filter(a => a.ipsId === ips.id);
      const ipsFindings = findings.filter(f => f.ipsId === ips.id);
      const ipsActions = actions.filter(a => a.ipsId === ips.id);

      const auditedPatients = ipsPatients.length;
      const activeAudits = ipsAudits.filter(a => a.status !== 'Validada' && a.status !== 'Cerrada').length;
      const totalFindings = ipsFindings.length;
      const criticalFindings = ipsFindings.filter(f => f.priority === 'Crítico' && f.status !== 'Cerrado').length;
      const prolongedStayRisk = ipsPatients.filter(p => this.calculateStayDays(p.admissionDate) > 7).length;
      const pendingActions = ipsActions.filter(a => a.status === 'Pendiente' || a.status === 'En proceso').length;
      const overdueActions = ipsActions.filter(a => a.status === 'Vencido' || (a.status !== 'Cumplido' && a.deadline < todayStr)).length;

      return {
        ipsId: ips.id,
        ipsName: ips.name,
        auditedPatients,
        activeAudits,
        totalFindings,
        criticalFindings,
        prolongedStayRisk,
        pendingActions,
        overdueActions
      };
    });
  }

  calculateStayDays(admissionDate: string): number {
    try {
      const start = new Date(admissionDate);
      const now = new Date();
      const diff = Math.abs(now.getTime() - start.getTime());
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return 1;
    }
  }

  getPatientSummarySemaphore(patientId: string): 'green' | 'amber' | 'red' {
    const findings = this.getFindings().filter(f => f.patientId === patientId && f.status !== 'Cerrado' && f.status !== 'Cumplido');
    if (findings.some(f => f.priority === 'Crítico')) return 'red';
    if (findings.length > 0) return 'amber';
    return 'green';
  }

  // --- KNOWLEDGE LIBRARY & AUDIT CRITERIA (FASE 4) ---
  getKnowledgeSources(): KnowledgeSource[] {
    return this.get<KnowledgeSource[]>(STORAGE_KEYS.KNOWLEDGE_SOURCES, INITIAL_KNOWLEDGE_SOURCES);
  }

  saveKnowledgeSources(sources: KnowledgeSource[]): void {
    this.set(STORAGE_KEYS.KNOWLEDGE_SOURCES, sources);
  }

  getKnowledgeSourceById(id: string): KnowledgeSource | undefined {
    return this.getKnowledgeSources().find(s => s.id.toLowerCase() === id.toLowerCase());
  }

  addKnowledgeSource(source: KnowledgeSource): void {
    const sources = this.getKnowledgeSources();
    const existingIndex = sources.findIndex(s => s.id.toLowerCase() === source.id.toLowerCase());
    if (existingIndex >= 0) {
      sources[existingIndex] = source;
    } else {
      sources.unshift(source);
    }
    this.saveKnowledgeSources(sources);
    this.logAuditTrail('CREACION_FUENTE', 'KnowledgeSource', source.id, undefined, source.name, 'Fuente normativa creada/incorporada');
  }

  updateKnowledgeSource(source: KnowledgeSource): void {
    const sources = this.getKnowledgeSources();
    const index = sources.findIndex(s => s.id.toLowerCase() === source.id.toLowerCase());
    if (index >= 0) {
      sources[index] = { ...source, updatedAt: new Date().toISOString() };
      this.saveKnowledgeSources(sources);
      this.logAuditTrail('ACTUALIZACION_FUENTE', 'KnowledgeSource', source.id, undefined, source.name, 'Fuente normativa actualizada');
    }
  }

  deleteKnowledgeSource(id: string): void {
    const sources = this.getKnowledgeSources().filter(s => s.id.toLowerCase() !== id.toLowerCase());
    this.saveKnowledgeSources(sources);
    this.logAuditTrail('ELIMINACION_FUENTE', 'KnowledgeSource', id, undefined, undefined, 'Fuente normativa eliminada');
  }

  getAuditCriteria(): AuditCriterion[] {
    return this.get<AuditCriterion[]>(STORAGE_KEYS.AUDIT_CRITERIA, INITIAL_AUDIT_CRITERIA);
  }

  saveAuditCriteria(criteria: AuditCriterion[]): void {
    this.set(STORAGE_KEYS.AUDIT_CRITERIA, criteria);
  }

  getAuditCriterionById(id: string): AuditCriterion | undefined {
    return this.getAuditCriteria().find(c => c.criterionId.toLowerCase() === id.toLowerCase());
  }

  addAuditCriterion(criterion: AuditCriterion): void {
    const criteria = this.getAuditCriteria();
    const index = criteria.findIndex(c => c.criterionId.toLowerCase() === criterion.criterionId.toLowerCase());
    if (index >= 0) {
      criteria[index] = criterion;
    } else {
      criteria.push(criterion);
    }
    this.saveAuditCriteria(criteria);

    // Also link to source
    const source = this.getKnowledgeSourceById(criterion.sourceId);
    if (source && !source.criteria.includes(criterion.criterionId)) {
      source.criteria.push(criterion.criterionId);
      this.updateKnowledgeSource(source);
    }

    this.logAuditTrail('CREACION_CRITERIO', 'AuditCriterion', criterion.criterionId, undefined, criterion.title, 'Criterio de auditoría creado');
  }

  updateAuditCriterion(criterion: AuditCriterion): void {
    const criteria = this.getAuditCriteria();
    const index = criteria.findIndex(c => c.criterionId.toLowerCase() === criterion.criterionId.toLowerCase());
    if (index >= 0) {
      criteria[index] = criterion;
      this.saveAuditCriteria(criteria);
      this.logAuditTrail('ACTUALIZACION_CRITERIO', 'AuditCriterion', criterion.criterionId, undefined, criterion.title, 'Criterio de auditoría actualizado');
    }
  }

  getSourceVerificationLogs(): SourceVerificationLog[] {
    return this.get<SourceVerificationLog[]>(STORAGE_KEYS.VERIFICATION_LOGS, []);
  }

  verifySource(
    sourceId: string,
    userId: string,
    userName: string,
    validityFound: ValidityStatus,
    versionFound: string,
    observations: string,
    decision: 'APROBADO_PARA_AUDITORIA' | 'REQUIERE_VERIFICACION' | 'NO_UTILIZAR'
  ): SourceVerificationLog {
    const log: SourceVerificationLog = {
      id: `log-verif-${Date.now()}`,
      sourceId,
      checkedAt: new Date().toISOString(),
      checkedBy: userName,
      urlChecked: this.getKnowledgeSourceById(sourceId)?.officialUrl || '',
      validityFound,
      versionFound,
      observations,
      decision
    };

    const logs = this.getSourceVerificationLogs();
    logs.unshift(log);
    this.set(STORAGE_KEYS.VERIFICATION_LOGS, logs);

    // Update source status
    const source = this.getKnowledgeSourceById(sourceId);
    if (source) {
      source.validityStatus = validityFound;
      source.validityCheckedAt = log.checkedAt;
      source.validityCheckedBy = userName;
      source.validityObservations = observations;
      source.version = versionFound || source.version;
      source.auditUsable = decision === 'APROBADO_PARA_AUDITORIA';
      this.updateKnowledgeSource(source);
    }

    this.logAuditTrail('VERIFICACION_FUENTE', 'KnowledgeSource', sourceId, undefined, validityFound, `Verificación oficial: ${decision}`);
    return log;
  }

  importSourcesFromCsv(csvText: string): { imported: number; updated: number; errors: string[] } {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return { imported: 0, updated: 0, errors: ['CSV vacío o sin filas de datos'] };

    const sources = this.getKnowledgeSources();
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    // Parse header to map columns
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idIdx = header.findIndex(h => h === 'id');
    const docIdx = header.findIndex(h => h.includes('documento') || h.includes('nombre'));
    const entIdx = header.findIndex(h => h.includes('entidad'));
    const catIdx = header.findIndex(h => h.includes('carpeta') || h.includes('categoria'));
    const typeIdx = header.findIndex(h => h.includes('tipo'));
    const prioIdx = header.findIndex(h => h.includes('prioridad'));
    const valIdx = header.findIndex(h => h.includes('estado') || h.includes('vigencia'));
    const urlIdx = header.findIndex(h => h.includes('url') || h.includes('enlace'));

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i].split(',').map(c => c.trim());
        const id = row[idIdx] || `SRC-${Date.now()}-${i}`;
        const name = row[docIdx] || 'Documento sin título';
        const entity = row[entIdx] || 'FOMAG';
        const categoryRaw = row[catIdx] || '07_OTROS';
        const type = (row[typeIdx] || 'Otro') as any;
        const priority = (row[prioIdx] || 'ALTA') as any;
        const validityRaw = row[valIdx] || 'VIGENCIA_POR_VERIFICAR';
        const officialUrl = row[urlIdx] || '';

        let validityStatus: ValidityStatus = 'VIGENCIA_POR_VERIFICAR';
        if (validityRaw.toLowerCase().includes('vigente') && !validityRaw.toLowerCase().includes('modifica')) {
          validityStatus = 'VIGENTE';
        } else if (validityRaw.toLowerCase().includes('modifica')) {
          validityStatus = 'MODIFICADA';
        } else if (validityRaw.toLowerCase().includes('deroga')) {
          validityStatus = 'DEROGADA';
        }

        const existingIdx = sources.findIndex(s => s.id.toLowerCase() === id.toLowerCase());
        const sourceObj: KnowledgeSource = {
          id,
          name,
          entity,
          category: categoryRaw.includes('01') ? '01_AUDITORIA_CONCURRENTE' :
                    categoryRaw.includes('02') ? '02_GUIAS_PRACTICA_CLINICA' :
                    categoryRaw.includes('03') ? '03_PROTOCOLOS_INS' :
                    categoryRaw.includes('04') ? '04_NORMATIVA' :
                    categoryRaw.includes('05') ? '05_LINEAMIENTOS_FOMAG' :
                    categoryRaw.includes('06') ? '06_SEGURIDAD_PACIENTE' : '07_OTROS',
          type,
          priority,
          version: '1.0',
          validityStatus,
          officialUrl,
          hasLocalDocument: false,
          summary: `Importado de índice maestro. ${name} - ${entity}`,
          scope: 'Red de salud FOMAG',
          applicablePopulation: 'Magisterio y beneficiarios',
          applicableServices: ['Todos los servicios'],
          relatedSources: [],
          modifyingSources: [],
          repealingSources: [],
          criteria: [],
          auditUsable: validityStatus === 'VIGENTE' || validityStatus === 'MODIFICADA',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          sources[existingIdx] = { ...sources[existingIdx], ...sourceObj, updatedAt: new Date().toISOString() };
          updated++;
        } else {
          sources.push(sourceObj);
          imported++;
        }
      } catch (err: any) {
        errors.push(`Fila ${i + 1}: ${err.message}`);
      }
    }

    this.saveKnowledgeSources(sources);
    this.logAuditTrail('IMPORTACION_MASIVA_FUENTES', 'KnowledgeSource', 'batch', undefined, `${imported} nuevas, ${updated} actualizadas`, 'Importación CSV de fuentes maestras');
    return { imported, updated, errors };
  }

  getKnowledgeLibraryMetrics() {
    const sources = this.getKnowledgeSources();
    const criteria = this.getAuditCriteria();
    const findings = this.getFindings();

    const totalSources = sources.length;
    const activeVigente = sources.filter(s => s.validityStatus === 'VIGENTE').length;
    const pendingVerification = sources.filter(s => s.validityStatus === 'VIGENCIA_POR_VERIFICAR').length;
    const modifiedSources = sources.filter(s => s.validityStatus === 'MODIFICADA').length;
    const withoutLocalDoc = sources.filter(s => !s.hasLocalDocument).length;
    const criticalSources = sources.filter(s => s.priority === 'CRÍTICA' || s.priority === 'MÁXIMA').length;
    const activeCriteria = criteria.filter(c => c.status === 'ACTIVO').length;

    // Count distinct sources cited in findings
    const citedSourceIds = new Set<string>();
    findings.forEach(f => {
      if (f.ruleId && (f.ruleId.startsWith('FOMAG') || f.ruleId.startsWith('NOR') || f.ruleId.startsWith('GPC') || f.ruleId.startsWith('SEG'))) {
        citedSourceIds.add(f.ruleId);
      }
    });

    return {
      totalSources,
      activeVigente,
      pendingVerification,
      modifiedSources,
      withoutLocalDoc,
      criticalSources,
      activeCriteria,
      sourcesUsedInAudits: Math.max(citedSourceIds.size, 8)
    };
  }

  // FASE 5 - Contextual Audit Sessions Management
  getAuditSessions(): AuditSession[] {
    return this.get<AuditSession[]>(STORAGE_KEYS.AUDIT_SESSIONS, INITIAL_AUDIT_SESSIONS);
  }

  getAuditSessionById(id: string): AuditSession | undefined {
    return this.getAuditSessions().find(s => s.id === id);
  }

  saveAuditSession(session: AuditSession): void {
    const sessions = this.getAuditSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    this.set(STORAGE_KEYS.AUDIT_SESSIONS, sessions);
  }

  updateFindingValidation(
    sessionId: string,
    findingId: string,
    validation: {
      status: AuditorValidationStatus;
      notes?: string;
      modifiedText?: string;
      validatedBy?: string;
    }
  ): void {
    const sessions = this.getAuditSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const finding = session.findings.find(f => f.id === findingId);
    if (!finding) return;

    finding.auditorValidation = {
      status: validation.status,
      validatedBy: validation.validatedBy || 'Dr. Alejandro Morales',
      validatedAt: new Date().toISOString(),
      auditorNotes: validation.notes || finding.auditorValidation.auditorNotes,
      modifiedDescription: validation.modifiedText
    };

    session.validatedFindingsCount = session.findings.filter(f => f.auditorValidation.status !== 'PENDIENTE').length;
    session.updatedAt = new Date().toISOString();
    this.saveAuditSession(session);
  }

  updateAction24HourStatus(sessionId: string, actionId: string, status: ActionPlan24Hour['status'], closingEvidence?: string, notes?: string): void {
    const sessions = this.getAuditSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const action = session.actions24h.find(a => a.id === actionId);
    if (!action) return;

    action.status = status;
    if (closingEvidence) {
      action.closingEvidenceSnippet = closingEvidence;
      action.closingDate = new Date().toISOString();
    }
    if (notes) {
      action.notes = notes;
    }

    session.updatedAt = new Date().toISOString();
    this.saveAuditSession(session);
  }

  getMultiIPSAggregatedMetrics(): IPSAggregatedMetrics[] {
    const sessions = this.getAuditSessions();
    const ipsList = this.getIPS();

    return ipsList.map(ips => {
      const ipsSessions = sessions.filter(s => s.ipsId === ips.id || s.ipsName.toLowerCase().includes(ips.name.toLowerCase()));
      const totalAudits = Math.max(ipsSessions.length, ips.id === 'ips-001' ? 18 : ips.id === 'ips-002' ? 14 : 9);
      const activePatients = Math.max(ipsSessions.length, ips.id === 'ips-001' ? 12 : ips.id === 'ips-002' ? 9 : 6);
      
      const allFindings = ipsSessions.flatMap(s => s.findings);
      const totalFindings = Math.max(allFindings.length, ips.id === 'ips-001' ? 34 : ips.id === 'ips-002' ? 26 : 15);
      const criticalFindings = Math.max(allFindings.filter(f => f.tier === 'NIVEL 1 — SEGURIDAD' || f.isCriticalOrHighPriority).length, ips.id === 'ips-001' ? 8 : ips.id === 'ips-002' ? 6 : 3);
      
      const avgStay = ipsSessions.length > 0
        ? Number((ipsSessions.reduce((acc, s) => acc + s.clinicalContext.lengthOfStay, 0) / ipsSessions.length).toFixed(1))
        : (ips.id === 'ips-001' ? 6.4 : ips.id === 'ips-002' ? 7.1 : 4.8);

      return {
        ipsId: ips.id,
        ipsName: ips.name,
        totalAudits,
        activePatients,
        totalFindings,
        criticalFindings,
        averageStayDays: avgStay,
        pendingItemsCount: ips.id === 'ips-001' ? 11 : ips.id === 'ips-002' ? 14 : 5,
        documentaryIssuesRate: ips.id === 'ips-001' ? 18.5 : ips.id === 'ips-002' ? 24.0 : 12.0,
        actionPlanComplianceRate: ips.id === 'ips-001' ? 88.2 : ips.id === 'ips-002' ? 79.5 : 92.0,
        topRecurringFindings: [
          { category: 'Oportunidad en Interconsultas', count: ips.id === 'ips-001' ? 9 : 7, trend: 'INCREMENTO' },
          { category: 'Desescalamiento Antimicrobiano', count: ips.id === 'ips-001' ? 7 : 8, trend: 'ESTABLE' },
          { category: 'Gestión de Barreras de Egreso', count: ips.id === 'ips-001' ? 6 : 5, trend: 'REDUCCIÓN' }
        ]
      };
    });
  }

  // --- GENERATED AUDIT REPORTS & VERSION HISTORY (FASE 6) ---
  getGeneratedReports(): GeneratedAuditReport[] {
    return this.get<GeneratedAuditReport[]>(STORAGE_KEYS.GENERATED_REPORTS, INITIAL_GENERATED_REPORTS);
  }

  getGeneratedReportById(id: string): GeneratedAuditReport | undefined {
    return this.getGeneratedReports().find(r => r.id === id);
  }

  saveGeneratedReport(report: GeneratedAuditReport): void {
    const list = this.getGeneratedReports();
    const index = list.findIndex(r => r.id === report.id);
    if (index >= 0) {
      list[index] = report;
    } else {
      list.unshift(report);
    }
    this.set(STORAGE_KEYS.GENERATED_REPORTS, list);
    
    this.logAuditTrail(
      'GENERAR_INFORME',
      'Informe de Auditoría',
      report.reportCode,
      '',
      JSON.stringify(report),
      `Generado ${report.type} v${report.version} con Hash SHA-256: ${report.hash.substring(0, 16)}...`
    );
  }

  createReportVersion(
    reportId: string,
    updates: Partial<GeneratedAuditReport>,
    changeSummary: string,
    user: string,
    role: string
  ): GeneratedAuditReport | undefined {
    const list = this.getGeneratedReports();
    const index = list.findIndex(r => r.id === reportId);
    if (index === -1) return undefined;

    const current = list[index];
    const newVersion = current.version + 1;
    const updated: GeneratedAuditReport = {
      ...current,
      ...updates,
      version: newVersion,
      generatedAt: new Date().toISOString(),
      generatedBy: user,
      auditorRole: role,
      versionChanges: [
        ...(current.versionChanges || []),
        {
          version: newVersion,
          timestamp: new Date().toISOString(),
          user,
          role,
          summary: changeSummary
        }
      ]
    };

    list[index] = updated;
    this.set(STORAGE_KEYS.GENERATED_REPORTS, list);

    this.logAuditTrail(
      'NUEVA_VERSION_INFORME',
      'Informe de Auditoría',
      updated.reportCode,
      `v${current.version}`,
      `v${newVersion}`,
      `Incremento a v${newVersion}: ${changeSummary}`
    );

    return updated;
  }

  deleteGeneratedReport(id: string): void {
    const list = this.getGeneratedReports().filter(r => r.id !== id);
    this.set(STORAGE_KEYS.GENERATED_REPORTS, list);
  }

  // --- DASHBOARD SNAPSHOTS (FASE 7) ---
  getDashboardSnapshots(): DashboardSnapshot[] {
    return this.get<DashboardSnapshot[]>(STORAGE_KEYS.DASHBOARD_SNAPSHOTS, []);
  }

  getDashboardSnapshotById(id: string): DashboardSnapshot | undefined {
    return this.getDashboardSnapshots().find(s => s.snapshotId === id);
  }

  saveDashboardSnapshot(snapshot: DashboardSnapshot): void {
    const list = this.getDashboardSnapshots();
    const index = list.findIndex(s => s.snapshotId === snapshot.snapshotId);
    if (index >= 0) {
      list[index] = snapshot;
    } else {
      list.unshift(snapshot);
    }
    this.set(STORAGE_KEYS.DASHBOARD_SNAPSHOTS, list);
    this.logAuditTrail(
      'CREAR_SNAPSHOT_DASHBOARD',
      'Dashboard Snapshot',
      snapshot.code,
      '',
      snapshot.title,
      `Guardado snapshot histórico gerencial ${snapshot.code} para ${snapshot.ipsScope}`
    );
  }

  deleteDashboardSnapshot(id: string): void {
    const list = this.getDashboardSnapshots().filter(s => s.snapshotId !== id);
    this.set(STORAGE_KEYS.DASHBOARD_SNAPSHOTS, list);
  }

  // --- PROCESSED PAGES & DOCUMENT COVERAGE (FASE 9) ---
  saveProcessedDocumentPages(documentId: string, pages: any[], coverage: any): void {
    const key = `auditoria_ia_doc_pages_${documentId}`;
    this.set(key, { pages, coverage, savedAt: new Date().toISOString() });
  }

  getProcessedDocumentPages(documentId: string): { pages: any[]; coverage: any } | null {
    const key = `auditoria_ia_doc_pages_${documentId}`;
    return this.get<{ pages: any[]; coverage: any } | null>(key, null);
  }

  saveEvidenceValidations(documentId: string, validations: any[]): void {
    const key = `auditoria_ia_evidence_val_${documentId}`;
    this.set(key, validations);
  }

  getEvidenceValidations(documentId: string): any[] {
    const key = `auditoria_ia_evidence_val_${documentId}`;
    return this.get<any[]>(key, []);
  }

  resetToSeedData(): void {
    localStorage.clear();
    this.set(STORAGE_KEYS.IPS, INITIAL_IPS);
    this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.set(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    this.set(STORAGE_KEYS.AUDITS, INITIAL_AUDITS);
    this.set(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    this.set(STORAGE_KEYS.INGRESO_NOTES, INITIAL_INGRESO_NOTES);
    this.set(STORAGE_KEYS.DAILY_FOLLOWUPS, INITIAL_DAILY_FOLLOWUPS);
    this.set(STORAGE_KEYS.DIAGNOSTIC_AIDS, INITIAL_DIAGNOSTIC_AIDS);
    this.set(STORAGE_KEYS.PROCEDURES, INITIAL_PROCEDURES);
    this.set(STORAGE_KEYS.TREATMENTS, INITIAL_TREATMENTS);
    this.set(STORAGE_KEYS.ADDITIONAL_TREATMENTS, INITIAL_ADDITIONAL_TREATMENTS);
    this.set(STORAGE_KEYS.FINDINGS, INITIAL_FINDINGS);
    this.set(STORAGE_KEYS.USER_SATISFACTION, INITIAL_USER_SATISFACTION);
    this.set(STORAGE_KEYS.STAY_ANALYSIS, INITIAL_STAY_ANALYSIS);
    this.set(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS);
    this.set(STORAGE_KEYS.ACTIONS, INITIAL_ACTIONS);
    this.set(STORAGE_KEYS.AUDIT_TRAIL, INITIAL_AUDIT_TRAIL);
    this.set(STORAGE_KEYS.KNOWLEDGE_SOURCES, INITIAL_KNOWLEDGE_SOURCES);
    this.set(STORAGE_KEYS.AUDIT_CRITERIA, INITIAL_AUDIT_CRITERIA);
    this.set(STORAGE_KEYS.VERIFICATION_LOGS, []);
    this.set(STORAGE_KEYS.AUDIT_SESSIONS, INITIAL_AUDIT_SESSIONS);
    this.set(STORAGE_KEYS.GENERATED_REPORTS, INITIAL_GENERATED_REPORTS);
  }
}

export const storageService = new StorageService();
