import React, { useState, useEffect } from 'react';
import { ClinicalSafetyBanner } from './components/common/ClinicalSafetyBanner';
import { PatientQuickBar } from './components/common/PatientQuickBar';
import { Sidebar, MainNavView } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { IPSManagementView } from './components/ips/IPSManagementView';
import { PatientsView } from './components/patients/PatientsView';
import { AuditsView } from './components/audits/AuditsView';
import { AuditClinicalRecordUploadView } from './components/upload/AuditClinicalRecordUploadView';
import { FindingsManagementView } from './components/findings/FindingsManagementView';
import { ActionsManagementView } from './components/actions/ActionsManagementView';
import { IndicatorsView } from './components/indicators/IndicatorsView';
import { ReportsView } from './components/reports/ReportsView';
import { KnowledgeLibraryView } from './components/knowledge/KnowledgeLibraryView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditExpedienteView } from './components/expediente/AuditExpedienteView';
import { PatientContextAuditDashboard } from './components/audit/PatientContextAuditDashboard';
import { MultiIPSComparisonView } from './components/ips/MultiIPSComparisonView';
import { ContextualTestSuiteRunner } from './components/audit/ContextualTestSuiteRunner';
import { ClinicalIngestionTestSuiteRunner } from './components/audit/ClinicalIngestionTestSuiteRunner';
import { UserManagementView } from './components/security/UserManagementView';
import { SecurityAuditLogView } from './components/security/SecurityAuditLogView';
import { SecurityTestSuiteRunner } from './components/security/SecurityTestSuiteRunner';
import { NewAuditModal } from './components/audits/NewAuditModal';
import { NewPatientModal } from './components/patients/NewPatientModal';
import { storageService } from './services/storageService';
import { Patient, Audit, User, UserRole, AuditSession } from './types';
import { AuthorizeActionUseCase } from './application/auth/AuthorizeActionUseCase';
import { authProvider } from './infrastructure/auth/AuthenticationProvider';

export function App() {
  // Navigation state
  const [currentView, setCurrentView] = useState<MainNavView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active User / Role
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [activeUser, setActiveUser] = useState<User>(() => storageService.getUsers()[0]);

  // Active Context Patient & Audit (for Quick Context Bar & 3-click flow)
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [activePatientId, setActivePatientId] = useState<string | null>(() => {
    const p = storageService.getPatients()[0];
    return p ? p.id : null;
  });

  // Expediente Mode (When an audit is opened in 14-tab mode)
  const [openedExpedienteAuditId, setOpenedExpedienteAuditId] = useState<string | null>(null);
  const [openedContextualSessionId, setOpenedContextualSessionId] = useState<string | null>(null);

  // Modals
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [auditCreationPatientId, setAuditCreationPatientId] = useState<string | undefined>(undefined);

  // App metrics for sidebar badges
  const [metrics, setMetrics] = useState(() => storageService.getDashboardMetrics());

  useEffect(() => {
    setMetrics(storageService.getDashboardMetrics());
  }, [currentView, openedExpedienteAuditId]);

  const activePatient = activePatientId ? storageService.getPatientById(activePatientId) : null;
  const activeAudit = activeAuditId ? storageService.getAuditById(activeAuditId) : null;

  const handleRoleChange = (role: UserRole) => {
    const userWithRole = users.find(u => u.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      name: `${role} FOMAG`,
      email: `${role.toLowerCase()}@auditoria-ia.co`,
      role: role,
      status: 'activo' as const,
      ipsAssigned: role === 'Administrador' || role === 'Gerencia' || role === 'Coordinador' ? ['all'] : ['ips-bonadona'],
      specialty: 'Auditoría Médica'
    };
    setActiveUser(userWithRole);
  };

  const handleSwitchUser = (newUser: User) => {
    setActiveUser(newUser);
  };

  const handleResetData = () => {
    if (window.confirm('¿Desea restablecer los datos iniciales de las IPS de Barranquilla (Bonadona, Misericordia, Costa)?')) {
      storageService.resetToSeedData();
      setUsers(storageService.getUsers());
      setActiveUser(storageService.getUsers()[0]);
      setOpenedExpedienteAuditId(null);
      setCurrentView('dashboard');
      window.location.reload();
    }
  };

  // 3-Click Navigation Handlers
  const handleOpenExpediente = (auditId: string) => {
    const a = storageService.getAuditById(auditId);
    if (a) {
      setActiveAuditId(auditId);
      setActivePatientId(a.patientId);
      setOpenedExpedienteAuditId(auditId);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setActivePatientId(patient.id);
    const audits = storageService.getAudits().filter(a => a.patientId === patient.id);
    if (audits[0]) {
      setActiveAuditId(audits[0].id);
    }
  };

  const handleOpenNewAuditForPatient = (patientId: string) => {
    setAuditCreationPatientId(patientId);
    setIsNewAuditModalOpen(true);
  };

  const handleOpenExpedienteForPatient = (patientId: string) => {
    const audits = storageService.getAudits().filter(a => a.patientId === patientId);
    if (audits.length > 0) {
      handleOpenExpediente(audits[0].id);
    } else {
      handleOpenNewAuditForPatient(patientId);
    }
  };

  const handleAuditCreated = (newAuditId: string) => {
    setActiveAuditId(newAuditId);
    const audit = storageService.getAuditById(newAuditId);
    if (audit) {
      setActivePatientId(audit.patientId);
    }
    setOpenedExpedienteAuditId(newAuditId);
  };

  const handlePatientCreated = (newPatientId: string) => {
    setActivePatientId(newPatientId);
    setCurrentView('patients');
  };

  const getViewTitle = () => {
    if (openedContextualSessionId) return 'Auditoría Concurrente Contextual del Paciente';
    if (openedExpedienteAuditId) return 'Expediente de Auditoría Concurrente (14 Módulos)';
    switch (currentView) {
      case 'dashboard': return 'Dashboard Principal';
      case 'ips': return 'Gestión de IPS (Barranquilla)';
      case 'multi_ips': return 'Tablero Comparativo de IPS (Barranquilla)';
      case 'patients': return 'Censo de Pacientes Hospitalizados';
      case 'audits': return 'Registro de Auditorías';
      case 'audit-hc': return 'Auditar Historia Clínica (PDF)';
      case 'findings': return 'Matriz de Hallazgos Clínicos';
      case 'actions': return 'Acciones y Seguimiento de Compromisos';
      case 'indicators': return 'Indicadores de Calidad Asistencial';
      case 'reports': return 'Informes Oficiales de Auditoría';
      case 'users': return 'Administración de Usuarios y Roles';
      case 'security_logs': return 'Historial de Seguridad y Trazabilidad';
      case 'security_tests': return 'Suite de Validación de Seguridad (25 Casos FOMAG)';
      case 'knowledge': return 'Biblioteca Maestra de Normativa y Criterios FOMAG';
      case 'ingestion_tests': return 'Suite de Ingestión Documental Real (PDF/OCR)';
      case 'contextual_tests': return 'Suite de Validación y Pruebas Clínicas (20 Casos FOMAG)';
      case 'settings': return 'Configuración y Roles';
      default: return 'Auditoría Concurrente IA';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* 1. Mandatory Clinical Safety Banner (Requirement 31) */}
      <ClinicalSafetyBanner />

      <div className="flex-1 flex">
        
        {/* 2. Left Sidebar (Requirement 4) */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setOpenedExpedienteAuditId(null);
            setCurrentView(view);
          }}
          activeUser={activeUser}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          overdueActionsCount={metrics.overdueActionsCount}
          criticalFindingsCount={metrics.criticalFindings}
        />

        {/* 3. Main Workspace Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          
          {/* Top Navbar */}
          <Navbar
            activeUser={activeUser}
            onRoleChange={handleRoleChange}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            title={getViewTitle()}
            onResetData={handleResetData}
            onSwitchUser={handleSwitchUser}
          />

          {/* Quick Context Patient Bar (When a patient is in active session context) */}
          {activePatient && (
            <PatientQuickBar
              patient={activePatient}
              activeAudit={activeAudit || undefined}
              onOpenAuditExpediente={handleOpenExpediente}
              onCreateNewAudit={handleOpenNewAuditForPatient}
              onOpenUpload={() => {
                setOpenedExpedienteAuditId(null);
                setCurrentView('audit-hc');
              }}
            />
          )}

          {/* View Content Renderer */}
          <main className="flex-1 pb-12">
            {openedContextualSessionId ? (
              (() => {
                const session = storageService.getAuditSessionById(openedContextualSessionId) || storageService.getAuditSessions()[0];
                return (
                  <PatientContextAuditDashboard
                    session={session}
                    onBack={() => setOpenedContextualSessionId(null)}
                  />
                );
              })()
            ) : openedExpedienteAuditId ? (
              <AuditExpedienteView
                auditId={openedExpedienteAuditId}
                onBack={() => setOpenedExpedienteAuditId(null)}
                activeUser={activeUser}
                onNavigateToUpload={() => {
                  setOpenedExpedienteAuditId(null);
                  setCurrentView('audit-hc');
                }}
              />
            ) : (
              <>
                {currentView === 'dashboard' && (
                  <DashboardView
                    onNavigate={(v) => setCurrentView(v)}
                    onOpenNewAuditModal={() => {
                      setAuditCreationPatientId(undefined);
                      setIsNewAuditModalOpen(true);
                    }}
                    onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
                    onOpenExpediente={handleOpenExpediente}
                    activeUser={activeUser}
                  />
                )}

                {currentView === 'ips' && (
                  <IPSManagementView />
                )}

                {currentView === 'multi_ips' && (
                  <MultiIPSComparisonView />
                )}

                {currentView === 'patients' && (
                  <PatientsView
                    onSelectPatient={handleSelectPatient}
                    onOpenNewAuditForPatient={handleOpenNewAuditForPatient}
                    onOpenExpedienteForPatient={handleOpenExpedienteForPatient}
                    activeUser={activeUser}
                  />
                )}

                {currentView === 'audits' && (
                  <AuditsView
                    onOpenExpediente={handleOpenExpediente}
                    onOpenNewAuditModal={() => {
                      setAuditCreationPatientId(undefined);
                      setIsNewAuditModalOpen(true);
                    }}
                    onNavigateToAuditHC={(auditId) => {
                      if (auditId) setActiveAuditId(auditId);
                      setCurrentView('audit-hc');
                    }}
                    activeUser={activeUser}
                  />
                )}

                {currentView === 'audit-hc' && (
                  <AuditClinicalRecordUploadView
                    initialAuditId={activeAuditId || undefined}
                    onOpenExpediente={handleOpenExpediente}
                    activeUser={activeUser}
                  />
                )}

                {currentView === 'findings' && (
                  <FindingsManagementView
                    onOpenExpediente={handleOpenExpediente}
                    activeUser={activeUser}
                  />
                )}

                {currentView === 'actions' && (
                  <ActionsManagementView
                    onOpenExpediente={handleOpenExpediente}
                    activeUser={activeUser}
                  />
                )}

                {currentView === 'indicators' && (
                  <IndicatorsView />
                )}

                {currentView === 'reports' && (
                  <ReportsView
                    onOpenExpediente={handleOpenExpediente}
                    activeUser={activeUser}
                  />
                )}

                {currentView === 'users' && (
                  <UserManagementView
                    activeUser={activeUser as any}
                    onUserUpdated={() => setUsers(storageService.getUsers())}
                  />
                )}

                {currentView === 'security_logs' && (
                  <SecurityAuditLogView
                    activeUser={activeUser as any}
                  />
                )}

                {currentView === 'security_tests' && (
                  <SecurityTestSuiteRunner />
                )}

                {currentView === 'knowledge' && (
                  <KnowledgeLibraryView
                    activeUser={activeUser}
                  />
                )}

                {currentView === 'ingestion_tests' && (
                  <ClinicalIngestionTestSuiteRunner />
                )}

                {currentView === 'contextual_tests' && (
                  <ContextualTestSuiteRunner />
                )}

                {currentView === 'settings' && (
                  <SettingsView
                    activeUser={activeUser}
                    onRoleChange={handleRoleChange}
                    onResetData={handleResetData}
                  />
                )}
              </>
            )}
          </main>

        </div>

      </div>

      {/* Global Modals */}
      <NewAuditModal
        isOpen={isNewAuditModalOpen}
        onClose={() => setIsNewAuditModalOpen(false)}
        onAuditCreated={handleAuditCreated}
        initialPatientId={auditCreationPatientId || activePatientId || undefined}
        activeUser={activeUser}
      />

      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />

    </div>
  );
}

export default App;
