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
  UserRole
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
  AUDIT_TRAIL: 'auditoria_ia_audit_trail'
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
  }
}

export const storageService = new StorageService();
