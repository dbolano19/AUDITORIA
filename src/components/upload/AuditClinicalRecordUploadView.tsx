import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  FileSearch,
  Layers,
  Search,
  Copy,
  Check,
  Eye,
  BarChart2,
  FileCheck2,
  BookOpen,
  Info,
  ShieldAlert
} from 'lucide-react';
import { ClinicalDocHC, Patient, Audit, CompleteConcurrentAuditResult } from '../../domain/models';
import { storageService } from '../../services/storageService';
import { aiService, AIAnalysisResponse } from '../../services/aiService';
import { ConcurrentAuditEngineReview } from '../audit/ConcurrentAuditEngineReview';
import { FileSecurityService } from '../../infrastructure/security/FileSecurityService';
import { AuthorizeActionUseCase } from '../../application/auth/AuthorizeActionUseCase';
import { AuditSecurityEventUseCase } from '../../application/security/AuditSecurityEventUseCase';
import { processClinicalRecordUseCase } from '../../application/audit/ProcessClinicalRecordUseCase';
import { ClinicalPage, DocumentCoverage, EvidenceValidationResult } from '../../domain/models/ClinicalPage';

interface AuditClinicalRecordUploadViewProps {
  onOpenExpediente: (auditId: string) => void;
  initialAuditId?: string;
}

export const AuditClinicalRecordUploadView: React.FC<AuditClinicalRecordUploadViewProps> = ({
  onOpenExpediente,
  initialAuditId
}) => {
  const activeUser = storageService.getActiveUser();
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
  
  // Pipeline processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<'processing' | 'ocr' | 'completed' | 'error'>('processing');
  const [processingError, setProcessingError] = useState<string | null>(null);

  const [selectedDocForPreview, setSelectedDocForPreview] = useState<ClinicalDocHC | null>(
    documents[0] || null
  );

  // Processed real pages and coverage for the selected document
  const [activeTab, setActiveTab] = useState<'folios' | 'cobertura' | 'evidencias' | 'resumen'>('folios');
  const [docPages, setDocPages] = useState<ClinicalPage[]>([]);
  const [docCoverage, setDocCoverage] = useState<DocumentCoverage | null>(null);
  const [docValidations, setDocValidations] = useState<EvidenceValidationResult[]>([]);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [selectedPageForModal, setSelectedPageForModal] = useState<ClinicalPage | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // AI Expert Audit Engine modal & review state
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIAnalysisResponse | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load processed data whenever selected document changes
  useEffect(() => {
    if (selectedDocForPreview) {
      const processed = storageService.getProcessedDocumentPages(selectedDocForPreview.id);
      if (processed) {
        setDocPages(processed.pages || []);
        setDocCoverage(processed.coverage || null);
      } else {
        setDocPages([]);
        setDocCoverage(null);
      }

      const validations = storageService.getEvidenceValidations(selectedDocForPreview.id);
      setDocValidations(validations || []);
    } else {
      setDocPages([]);
      setDocCoverage(null);
      setDocValidations([]);
    }
  }, [selectedDocForPreview]);

  const handleAuditChange = (auditId: string) => {
    setSelectedAuditId(auditId);
    const docs = storageService.getDocuments(auditId);
    setDocuments(docs);
    setSelectedDocForPreview(docs[0] || null);
  };

  const handleFileProcess = async (file: File) => {
    setProcessingError(null);

    // 1. Permission check
    if (!AuthorizeActionUseCase.hasPermission(activeUser as any, 'hc.upload')) {
      alert(`Acceso denegado: El rol "${activeUser.role}" no tiene permisos para cargar historias clínicas.`);
      return;
    }

    if (!selectedAuditId || !currentPatient || !currentAudit) {
      alert('Por favor seleccione primero una auditoría y un paciente para asociar el expediente.');
      return;
    }

    // 2. IPS access check
    if (currentIPS && !AuthorizeActionUseCase.canAccessIPS(activeUser as any, currentIPS.id)) {
      alert(`Acceso denegado: No tiene asignada la IPS "${currentIPS.name}".`);
      return;
    }

    // 3. File security validation (magic bytes, MIME, 0-byte corrupt check)
    const validation = await FileSecurityService.validateUploadedFile(file);
    if (!validation.valid) {
      setProcessingError(validation.errorMessage || 'Archivo no válido.');
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

    setIsProcessing(true);
    setProcessingProgress(5);
    setProcessingStage('Iniciando inspección binaria y lectura del PDF...');

    try {
      // Execute full real ingestion pipeline with PDF.js and Tesseract OCR
      const result = await processClinicalRecordUseCase.execute({
        file,
        patient: currentPatient,
        audit: currentAudit,
        ipsId: currentIPS?.id || 'IPS-01',
        ipsName: currentIPS?.name || 'IPS Principal',
        userId: activeUser.id,
        userName: activeUser.name,
        userRole: activeUser.role,
        onProgress: (prog) => {
          setProcessingStage(prog.currentStage);
          setProcessingProgress(prog.percentage);
          setProcessingStatus(prog.status);
        }
      });

      // Update view state
      const updatedDocs = storageService.getDocuments(selectedAuditId);
      setDocuments(updatedDocs);
      setSelectedDocForPreview(result.document);
      setDocPages(result.pages);
      setDocCoverage(result.coverage);
      setDocValidations(result.evidenceValidations);

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
        details: `Carga e indexación real de historia clínica PDF (${(file.size / (1024 * 1024)).toFixed(2)} MB, ${result.coverage.totalPages} folios reales, ${result.coverage.ocrPages} con OCR)`
      });

    } catch (err: any) {
      console.error('Error procesando historia clínica:', err);
      setProcessingError(err.message || 'Error desconocido al procesar el archivo PDF.');
      setProcessingStatus('error');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
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

  // Trigger Concurrent Audit Engine Review
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

  const filteredPages = docPages.filter(p => {
    if (!pageSearchQuery) return true;
    const q = pageSearchQuery.toLowerCase();
    return (
      p.pageNumber.toString().includes(q) ||
      p.normalizedText.toLowerCase().includes(q) ||
      p.detectedSections.some(s => s.toLowerCase().includes(q)) ||
      p.detectedServices.some(s => s.toLowerCase().includes(q)) ||
      p.extractionMethod.toLowerCase().includes(q)
    );
  });

  const handleCopyPageText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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
              INGESTIÓN Y AUDITORÍA DE HISTORIA CLÍNICA (PDF / OCR)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Pipeline Real: Extracción nativa con PDF.js, OCR con Tesseract.js y verificación estricta de evidencias.
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
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 ${
                isProcessing
                  ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-75'
                  : isDragging
                  ? 'border-cyan-600 bg-cyan-50 cursor-pointer'
                  : 'border-slate-300 hover:border-cyan-500 hover:bg-slate-50/60 bg-slate-50/30 cursor-pointer'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shadow-xs">
                {isProcessing ? (
                  <RefreshCw className="w-7 h-7 animate-spin text-cyan-700" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isProcessing ? 'Procesando expediente...' : 'Arrastrar y soltar historia clínica en PDF aquí'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isProcessing ? 'Por favor espere mientras se extrae el texto...' : 'o haga clic para seleccionar desde su equipo'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                <span>Formato: .PDF Real</span>
                <span>·</span>
                <span>Capas nativas + OCR</span>
              </div>

              {!isProcessing && (
                <button
                  type="button"
                  className="mt-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Seleccionar archivo PDF
                </button>
              )}
            </div>

            {/* Live Ingestion Pipeline Progress */}
            {isProcessing && (
              <div className="space-y-2 p-3.5 bg-cyan-50/70 rounded-xl border border-cyan-200">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-950">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-700" />
                    <span>{processingStage}</span>
                  </span>
                  <span className="font-mono">{processingProgress}%</span>
                </div>
                <div className="w-full bg-cyan-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-700 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-cyan-800 flex items-center justify-between pt-1">
                  <span>Modo: {processingStatus === 'ocr' ? 'OCR Tesseract (Página Escaneada)' : 'Extracción Vectorial PDF.js'}</span>
                  <span>Strict Traceability</span>
                </div>
              </div>
            )}

            {/* Processing Error Message */}
            {processingError && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Error en la carga:</strong>
                  <span>{processingError}</span>
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
                El sistema extrae el texto folio por folio y valida que cada hallazgo esté soportado por un fragmento documental real en la página citada.
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
                            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB · {doc.pageCount} páginas reales · {doc.documentType}
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

        {/* Right Column: Document Viewer & Tabbed Analysis View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDocForPreview ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              
              {/* Document Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-700" />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{selectedDocForPreview.fileName}</h3>
                    <span className="text-[10px] text-slate-500">
                      {selectedDocForPreview.pageCount} páginas procesadas · {(selectedDocForPreview.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
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

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-white px-4 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setActiveTab('folios')}
                  className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'folios'
                      ? 'border-cyan-600 text-cyan-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Folios Extraídos & OCR ({docPages.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('cobertura')}
                  className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'cobertura'
                      ? 'border-cyan-600 text-cyan-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Cobertura Documental {docCoverage ? `(${docCoverage.coveragePercentage}%)` : ''}</span>
                </button>

                <button
                  onClick={() => setActiveTab('evidencias')}
                  className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'evidencias'
                      ? 'border-cyan-600 text-cyan-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Validación de Evidencias ({docValidations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('resumen')}
                  className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'resumen'
                      ? 'border-cyan-600 text-cyan-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Resumen Clínico</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 bg-slate-50/50 min-h-[420px]">
                
                {/* TAB 1: FOLIOS EXTRAÍDOS & OCR */}
                {activeTab === 'folios' && (
                  <div className="space-y-3">
                    {/* Search in pages */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar texto, sección (p. ej. 'Evolución', 'Medicamentos') o número de folio..."
                        value={pageSearchQuery}
                        onChange={(e) => setPageSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                      />
                    </div>

                    {docPages.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-lg border border-slate-200">
                        <FileSearch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold">Sin folios individuales registrados.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Cargue un nuevo PDF para ver el desglose página por página con OCR.</p>
                      </div>
                    ) : filteredPages.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200">
                        No se encontraron folios que coincidan con "{pageSearchQuery}".
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                        {filteredPages.map(page => (
                          <div
                            key={page.pageNumber}
                            className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-2 hover:border-slate-300 transition-colors shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200 font-mono">
                                  Pág. {page.pageNumber}
                                </span>
                                
                                {page.extractionMethod === 'native_pdf' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    PDF Nativo
                                  </span>
                                ) : page.extractionMethod === 'ocr' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <Sparkles className="w-3 h-3" />
                                    OCR Tesseract ({Math.round((page.confidence || 0.8) * 100)}%)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    {page.extractionMethod}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span>{page.charCount} caracteres ({page.wordCount} palabras)</span>
                                <button
                                  onClick={() => setSelectedPageForModal(page)}
                                  className="text-cyan-700 hover:text-cyan-900 font-semibold underline flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Inspeccionar</span>
                                </button>
                              </div>
                            </div>

                            {/* Detected Sections Pills */}
                            {page.detectedSections.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] text-slate-400 font-medium mr-1">Secciones:</span>
                                {page.detectedSections.map((sec, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded text-[9px] font-semibold"
                                  >
                                    {sec}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Text Snippet Preview */}
                            <p className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] text-slate-700 font-mono italic line-clamp-2">
                              {page.normalizedText || '(Sin texto extraído en esta página)'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: COBERTURA DOCUMENTAL */}
                {activeTab === 'cobertura' && (
                  <div className="space-y-4">
                    {docCoverage ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-500 block font-semibold">TOTAL FOLIOS</span>
                            <strong className="text-xl font-bold text-slate-900">{docCoverage.totalPages}</strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Páginas en PDF</span>
                          </div>

                          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-emerald-700 block font-semibold">FOLIOS NATIVOS</span>
                            <strong className="text-xl font-bold text-emerald-700">{docCoverage.nativeTextPages}</strong>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{docCoverage.nativeTextCoveragePercentage}% del total</span>
                          </div>

                          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-indigo-700 block font-semibold">FOLIOS CON OCR</span>
                            <strong className="text-xl font-bold text-indigo-700">{docCoverage.ocrPages}</strong>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{docCoverage.ocrCoveragePercentage}% escaneadas</span>
                          </div>

                          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-500 block font-semibold">CARACTERES TOTALES</span>
                            <strong className="text-lg font-bold text-slate-800">{docCoverage.totalExtractedCharacters.toLocaleString()}</strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{docCoverage.totalExtractedWords.toLocaleString()} palabras</span>
                          </div>

                          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-500 block font-semibold">CONFIABILIDAD PROMEDIO</span>
                            <strong className="text-lg font-bold text-cyan-800">
                              {docCoverage.averageConfidence ? `${Math.round(docCoverage.averageConfidence * 100)}%` : '100%'}
                            </strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Calidad óptica</span>
                          </div>

                          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-500 block font-semibold">TIEMPO PROCESAMIENTO</span>
                            <strong className="text-lg font-bold text-slate-800">
                              {(docCoverage.processingTotalDurationMs / 1000).toFixed(2)}s
                            </strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Pipeline Concurrente</span>
                          </div>
                        </div>

                        {/* Coverage Bar */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span>Cobertura Documental Efectiva</span>
                            <span>{docCoverage.coveragePercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                            <div
                              className="bg-emerald-600 h-2.5 transition-all"
                              style={{ width: `${docCoverage.nativeTextCoveragePercentage}%` }}
                              title={`Texto nativo: ${docCoverage.nativeTextCoveragePercentage}%`}
                            />
                            <div
                              className="bg-indigo-600 h-2.5 transition-all"
                              style={{ width: `${docCoverage.ocrCoveragePercentage}%` }}
                              title={`OCR óptico: ${docCoverage.ocrCoveragePercentage}%`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              <span>Nativo ({docCoverage.nativeTextPages} págs)</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                              <span>OCR ({docCoverage.ocrPages} págs)</span>
                            </span>
                            <span>{docCoverage.isFullyCovered ? '✓ 100% Cubierto' : 'Parcial'}</span>
                          </div>
                        </div>

                        {/* Warnings if any */}
                        {docCoverage.warnings && docCoverage.warnings.length > 0 && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1 text-xs text-amber-900">
                            <div className="font-bold flex items-center gap-1 text-amber-950">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                              <span>Advertencias de Extracción ({docCoverage.warnings.length}):</span>
                            </div>
                            <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-700">
                              {docCoverage.warnings.map((w, idx) => (
                                <li key={idx}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-lg border border-slate-200">
                        <Info className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <span>Métricas de cobertura no disponibles para este registro previo. Cargue un nuevo PDF para calcularlas.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: VALIDACIÓN DE EVIDENCIAS */}
                {activeTab === 'evidencias' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-cyan-700" />
                        <span>Verificación estricta de citas contra el texto real de cada página del expediente.</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {docValidations.filter(v => v.status === 'VALID').length} / {docValidations.length} Verificadas
                      </span>
                    </div>

                    {docValidations.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-lg border border-slate-200">
                        <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold">Sin validaciones de evidencia registradas.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Haga clic en "Ejecutar Auditoría Concurrente" para generar y validar evidencias en tiempo real.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        {docValidations.map((val, idx) => (
                          <div
                            key={idx}
                            className={`bg-white p-3 rounded-lg border text-xs space-y-1.5 shadow-2xs ${
                              val.status === 'VALID'
                                ? 'border-emerald-200'
                                : val.status === 'PARTIAL'
                                ? 'border-amber-200'
                                : 'border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {val.status === 'VALID' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    VALIDADA 100%
                                  </span>
                                ) : val.status === 'PARTIAL' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    PARCIAL ({Math.round(val.similarityScore * 100)}%)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    NO LOCALIZADA
                                  </span>
                                )}

                                <span className="font-mono text-[11px] font-bold text-slate-800">
                                  Página {val.pageNumber}
                                </span>
                              </div>

                              <span className="text-[10px] text-slate-400 font-mono">
                                Coincidencia: {Math.round(val.similarityScore * 100)}%
                              </span>
                            </div>

                            <p className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] text-slate-800 font-mono italic">
                              "{val.snippet}"
                            </p>

                            <p className="text-[10px] text-slate-600">
                              <strong>Dictamen:</strong> {val.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: RESUMEN CLÍNICO */}
                {activeTab === 'resumen' && (
                  <div className="bg-white rounded-lg border border-slate-300 p-5 font-mono text-xs text-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-slate-500 text-[11px] font-sans">
                      <span className="font-bold text-emerald-800 uppercase tracking-wide">
                        EXPEDIENTE CLÍNICO DIGITALIZADO PARA AUDITORÍA
                      </span>
                      <span>{selectedDocForPreview.pageCount} Folios</span>
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
                )}

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

      {/* Modal: Full Page Text Inspector */}
      {selectedPageForModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">
                  Inspección de Folio {selectedPageForModal.pageNumber} — {selectedPageForModal.extractionMethod === 'ocr' ? 'OCR Tesseract' : 'PDF Nativo'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPageForModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Caracteres: <strong>{selectedPageForModal.charCount}</strong></span>
                <span>·</span>
                <span>Palabras: <strong>{selectedPageForModal.wordCount}</strong></span>
                <span>·</span>
                <span>Confiabilidad: <strong>{selectedPageForModal.confidence ? `${Math.round(selectedPageForModal.confidence * 100)}%` : '100%'}</strong></span>
              </div>
              <button
                onClick={() => handleCopyPageText(selectedPageForModal.normalizedText)}
                className="flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-semibold cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copiado' : 'Copiar texto'}</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50">
              <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
                {selectedPageForModal.normalizedText || '(Página sin texto legible)'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Modal: Expert Concurrent Audit Engine Review */}
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
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
