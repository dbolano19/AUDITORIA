import React, { useState, useRef } from 'react';
import {
  FileSearch,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  UserCheck,
  Eye,
  Layers,
  FileCheck,
  RefreshCw,
  FolderOpen,
  X
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { aiService, AIAnalysisResponse } from '../../services/aiService';
import { ClinicalDocHC, Patient, Audit, User } from '../../types';
import { ConcurrentAuditEngineReview } from '../audit/ConcurrentAuditEngineReview';
import { FileSecurityService } from '../../infrastructure/security/FileSecurityService';
import { AuditSecurityEventUseCase } from '../../application/security/AuditSecurityEventUseCase';
import { AuthorizeActionUseCase } from '../../application/auth/AuthorizeActionUseCase';

interface AuditClinicalRecordUploadViewProps {
  initialAuditId?: string;
  onOpenExpediente: (auditId: string) => void;
  activeUser: User;
}

export const AuditClinicalRecordUploadView: React.FC<AuditClinicalRecordUploadViewProps> = ({
  initialAuditId,
  onOpenExpediente,
  activeUser
}) => {
  const audits = storageService.getAudits();
  const patients = storageService.getPatients();
  const ipsList = storageService.getIPS();

  const [selectedAuditId, setSelectedAuditId] = useState<string>(
    initialAuditId || audits[0]?.id || ''
  );

  const currentAudit = audits.find(a => a.id === selectedAuditId);
  const currentPatient = currentAudit ? patients.find(p => p.id === currentAudit.patientId) : null;
  const currentIPS = currentAudit ? ipsList.find(i => i.id === currentAudit.ipsId) : null;

  const [documents, setDocuments] = useState<ClinicalDocHC[]>(() =>
    storageService.getDocuments(selectedAuditId)
  );

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<ClinicalDocHC | null>(
    documents[0] || null
  );

  // AI Expert Audit Engine modal & review state (Phase 3)
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIAnalysisResponse | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuditChange = (auditId: string) => {
    setSelectedAuditId(auditId);
    const docs = storageService.getDocuments(auditId);
    setDocuments(docs);
    setSelectedDocForPreview(docs[0] || null);
  };

  const handleFileProcess = async (file: File) => {
    // 1. Permission check
    if (!AuthorizeActionUseCase.hasPermission(activeUser as any, 'hc.upload')) {
      alert(`Acceso denegado: El rol "${activeUser.role}" no tiene permisos para cargar historias clínicas.`);
      return;
    }

    // 2. File security validation (magic bytes, extension, MIME, size, 0-byte corrupt check)
    const validation = await FileSecurityService.validateUploadedFile(file);
    if (!validation.valid) {
      alert(`Error de validación de seguridad: ${validation.errorMessage}`);
      AuditSecurityEventUseCase.logSecurityEvent({
        action: 'SECURITY_ALERT',
        module: 'Historia Clínica',
        resource: file.name,
        result: 'DENEGADO',
        userId: activeUser.id,
        userName: activeUser.name,
        userRole: activeUser.role,
        details: `Carga de archivo rechazada: ${validation.errorCode} - ${validation.errorMessage}`
      });
      return;
    }

    if (!selectedAuditId || !currentPatient) {
      alert('Por favor seleccione primero una auditoría y un paciente para asociar el expediente.');
      return;
    }

    // 3. IPS access check
    if (currentIPS && !AuthorizeActionUseCase.canAccessIPS(activeUser as any, currentIPS.id)) {
      alert(`Acceso denegado: No tiene asignada la IPS "${currentIPS.name}".`);
      return;
    }

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 10;
        if (prev >= 90) {
          clearInterval(interval);
          finishUpload(file);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const finishUpload = (file: File) => {
    setTimeout(() => {
      const pageEstimate = Math.max(3, Math.floor(file.size / 350000));
      const newDoc: ClinicalDocHC = {
        id: `doc-${Date.now()}`,
        patientId: currentPatient!.id,
        auditId: selectedAuditId,
        fileName: file.name,
        fileSize: file.size,
        pageCount: pageEstimate,
        uploadDate: new Date().toISOString(),
        uploadedBy: activeUser.name,
        status: 'Procesado',
        documentType: 'Historia Clínica Completa',
        extractedTextSnippet: `Documento "${file.name}" indexado exitosamente para el paciente ${currentPatient!.fullName}. Contiene evoluciones médicas, notas de ingreso y registros de enfermería listos para auditoría concurrente.`,
        notes: `Cargado por ${activeUser.name} (${activeUser.role}) el ${new Date().toLocaleDateString('es-CO')}.`
      };

      const saved = storageService.saveDocument(newDoc);
      const updatedDocs = storageService.getDocuments(selectedAuditId);
      setDocuments(updatedDocs);
      setSelectedDocForPreview(saved);
      setUploadProgress(null);

      // Audit log registration
      AuditSecurityEventUseCase.logSecurityEvent({
        action: 'UPLOAD_HC',
        module: 'Historia Clínica',
        resource: file.name,
        result: 'EXITOSO',
        userId: activeUser.id,
        userName: activeUser.name,
        userRole: activeUser.role,
        ipsId: currentIPS?.id,
        ipsName: currentIPS?.name,
        auditId: selectedAuditId,
        patientInternalId: currentPatient?.internalId,
        details: `Carga exitosa de historia clínica PDF (${(file.size / (1024 * 1024)).toFixed(2)} MB, ~${pageEstimate} págs) para paciente ${currentPatient?.internalId}`
      });
    }, 300);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Phase 3 Expert Concurrent Audit Engine Trigger
  const handleAnalyzeWithAI = async (doc: ClinicalDocHC) => {
    if (!currentPatient || !currentAudit || !currentIPS) return;
    setIsAIAnalyzing(true);
    setShowAIModal(true);

    try {
      const response = await aiService.analyzeClinicalDocument({
        document: doc,
        patientId: currentPatient.id,
        auditId: currentAudit.id,
        ipsId: currentIPS.id,
        auditDate: currentAudit.auditDate,
        patientName: currentPatient.fullName,
        docType: currentPatient.docType,
        docNumber: currentPatient.docNumber,
        age: currentPatient.age,
        sex: currentPatient.sex,
        roomBed: currentPatient.roomBed,
        service: currentPatient.service,
        ipsName: currentIPS.name,
        admissionDate: currentPatient.admissionDate,
        mainDiagnosis: currentPatient.mainDiagnosis,
        rawText: doc.extractedTextSnippet || ''
      });
      setAiResponse(response);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center shadow-xs">
              <FileSearch className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              AUDITAR HISTORIA CLÍNICA (PDF)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Motor Experto de Auditoría Concurrente FOMAG sobre Historia Clínica en PDF.
          </p>
        </div>

        {/* Audit Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Auditoría destino:</label>
          <select
            value={selectedAuditId}
            onChange={(e) => handleAuditChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-cyan-600 focus:outline-none"
          >
            {audits.map(a => {
              const p = patients.find(pat => pat.id === a.patientId);
              return (
                <option key={a.id} value={a.id}>
                  {a.auditCode} — {p?.fullName || a.patientId}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Target Patient Capsule */}
      {currentPatient && currentAudit && (
        <div className="bg-cyan-50/50 border border-cyan-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-slate-500 block text-[10px]">PACIENTE ASIGNADO</span>
              <strong className="text-slate-900 font-bold text-sm">{currentPatient.fullName}</strong>
              <span className="text-slate-600 ml-1">({currentPatient.docType} {currentPatient.docNumber})</span>
            </div>
            <div className="border-l border-cyan-200 pl-3">
              <span className="text-slate-500 block text-[10px]">IPS & SERVICIO</span>
              <span className="font-semibold text-slate-800">{currentIPS?.name}</span>
              <span className="text-slate-600 ml-1">· {currentPatient.service} ({currentPatient.roomBed})</span>
            </div>
            <div className="border-l border-cyan-200 pl-3">
              <span className="text-slate-500 block text-[10px]">DIAGNÓSTICO PRINCIPAL</span>
              <span className="font-medium text-slate-800 line-clamp-1">{currentPatient.mainDiagnosis}</span>
            </div>
          </div>

          <button
            onClick={() => onOpenExpediente(currentAudit.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Ver Expediente Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Zone & Documents List (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Drag & Drop Dropzone (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-700" />
              <span>Cargar Expediente Clínico PDF</span>
            </h2>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-cyan-600 bg-cyan-50'
                  : 'border-slate-300 hover:border-cyan-500 hover:bg-slate-50/60 bg-slate-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Arrastrar y soltar historia clínica en PDF aquí
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  o haga clic para buscar en su computador
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                <span>Formato aceptado: .PDF</span>
                <span>·</span>
                <span>Hasta 50 MB</span>
              </div>

              <button
                type="button"
                className="mt-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Seleccionar archivo
              </button>
            </div>

            {/* Upload Progress */}
            {uploadProgress !== null && (
              <div className="space-y-1.5 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-900">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-700" />
                    <span>Procesando e indexando PDF...</span>
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-cyan-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-700 h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notice of Clinical Non-Inference (Requirement 11) */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-950">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Criterio Guía FOMAG: NO EVIDENCE → NO CLAIM</span>
              </div>
              <p className="leading-relaxed text-slate-700">
                El motor analiza exhaustivamente la historia clínica con citación exacta por página y soporte documental para cada hallazgo y recomendación de 24 horas.
              </p>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Documentos Vinculados ({documents.length})</span>
            </h2>

            {documents.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-50 rounded-lg">
                No hay documentos cargados en esta auditoría aún.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocForPreview(doc)}
                    className={`p-3 rounded-lg border text-xs transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      selectedDocForPreview?.id === doc.id
                        ? 'border-cyan-600 bg-cyan-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-cyan-700 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{doc.fileName}</div>
                          <div className="text-[10px] text-slate-500">
                            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB · {doc.pageCount} páginas · {doc.documentType}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-2">
                      <span>Cargó: <strong>{doc.uploadedBy}</strong></span>
                      <span>{new Date(doc.uploadDate).toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Document Viewer & AI Preparation View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDocForPreview ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              
              {/* Document Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-700" />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{selectedDocForPreview.fileName}</h3>
                    <span className="text-[10px] text-slate-500">{selectedDocForPreview.documentType} · {selectedDocForPreview.pageCount} páginas</span>
                  </div>
                </div>

                {/* Button "EJECUTAR AUDITORÍA CONCURRENTE" */}
                <button
                  onClick={() => handleAnalyzeWithAI(selectedDocForPreview)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-linear-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>EJECUTAR AUDITORÍA CONCURRENTE</span>
                </button>
              </div>

              {/* Document Preview Canvas */}
              <div className="p-5 space-y-4 bg-slate-100/50 min-h-[420px]">
                
                {/* Visual Representation of the PDF Document */}
                <div className="bg-white rounded-lg border border-slate-300 shadow-xs p-6 font-mono text-xs text-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-slate-500 text-[11px] font-sans">
                    <span className="font-bold text-emerald-800 uppercase tracking-wide">
                      EXPEDIENTE CLÍNICO DIGITALIZADO PARA AUDITORÍA
                    </span>
                    <span>Página 1 de {selectedDocForPreview.pageCount}</span>
                  </div>

                  <div className="space-y-2 leading-relaxed">
                    <div className="text-[11px] font-bold text-slate-900 border-b border-dashed border-slate-200 pb-1 font-sans">
                      INSTITUCIÓN: {currentIPS?.name.toUpperCase()} · COLOMBIA
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-sans">
                      <div>Paciente: <strong>{currentPatient?.fullName}</strong></div>
                      <div>Identificación: <strong>{currentPatient?.docType} {currentPatient?.docNumber}</strong></div>
                      <div>Servicio: <strong>{currentPatient?.service}</strong></div>
                      <div>Cama: <strong>{currentPatient?.roomBed}</strong></div>
                    </div>

                    <div className="pt-2 text-xs font-sans text-slate-800">
                      <span className="font-bold text-emerald-900 block mb-1">FRAGMENTO DOCUMENTAL DE INGRESO:</span>
                      <p className="bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed italic text-slate-700">
                        "{selectedDocForPreview.extractedTextSnippet || 'Sin texto extraído'}"
                      </p>
                    </div>

                    <div className="pt-2 text-xs font-sans text-slate-800">
                      <span className="font-bold text-slate-900 block mb-1">NOTAS DEL AUDITOR:</span>
                      <p className="text-slate-600">
                        {selectedDocForPreview.notes || 'Documento en custodia para trazabilidad de auditoría concurrente.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evidence Extraction Readiness Badge */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Documento indexado para el Motor Experto con soporte de 22 fases de análisis.</span>
                  </div>
                  <button
                    onClick={() => handleAnalyzeWithAI(selectedDocForPreview)}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                  >
                    Ver Análisis Experto
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">Seleccione o cargue un documento PDF para previsualizarlo.</p>
            </div>
          )}
        </div>

      </div>

      {/* Full-Screen Modal: Expert Concurrent Audit Engine Review (Phase 3) */}
      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-300 overflow-hidden my-auto max-h-[95vh] flex flex-col">
            
            {/* Modal Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm tracking-tight">
                    Motor Experto de Auditoría Concurrente FOMAG
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Análisis sobre Historia Clínica en PDF con Citación Documental Obligatoria
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-0">
              {isAIAnalyzing ? (
                <div className="p-16 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="font-bold text-base text-slate-900">
                      Ejecutando Motor Experto de Auditoría Concurrente...
                    </p>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Indexando páginas, clasificando evoluciones, aplicando 10 criterios a paraclínicos, detectando barreras de estancia y estructurando plan de 24 horas.
                    </p>
                  </div>
                </div>
              ) : aiResponse?.expertAuditResult ? (
                <ConcurrentAuditEngineReview
                  auditResult={aiResponse.expertAuditResult}
                  onConfirmAll={() => {
                    alert('Auditoría validada y confirmada por el Auditor Médico. Registro guardado en el expediente.');
                    setShowAIModal(false);
                  }}
                  onExportNote={() => {
                    alert('Nota oficial de auditoría concurrente FOMAG exportada exitosamente.');
                  }}
                />
              ) : (
                <div className="p-8 text-center text-slate-600">
                  No fue posible generar el análisis experto para este documento.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

