# ARQUITECTURA DEL SISTEMA AUDITORÍA FOMAG
## Fase 2 — Arquitectura y Separación de Responsabilidades

---

## 1. Visión General

El **Sistema Inteligente de Auditoría Documental FOMAG** implementa una arquitectura en capas desacoplada basada en Clean Architecture y Principios SOLID, diseñada para procesar, auditar y emitir dictámenes clínicos y administrativos sobre historias clínicas e internaciones hospitalarias concurrentes.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN (UI)                          │
│   (Dashboard, Censo, Expediente 14 Pestañas, Visor PDF, Informes)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Invoca Casos de Uso / Servicios
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAPA DE APLICACIÓN (Use Cases)                     │
│    ProcessExpedientUseCase │ AuditExpedientUseCase │ GenerateReport     │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │ Usa                             │ Coordina
                    ▼                                 ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│          CAPA DE DOMINIO             │  │    CAPA DE INFRAESTRUCTURA    │
│  Entidades: Expedient, Document,     │  │  AI Providers (Gemini/Rules), │
│  Finding, Evidence, AuditRule,       │  │  PDF Processor, OCR Service,  │
│  RiskAssessment, Patient, IPS.       │  │  Storage Adapter, Logger,     │
│  Reglas Clínicas: DEFAULT_RULES      │  │  App Configuration.           │
└──────────────────────────────────────┘  └───────────────────────────────┘
```

---

## 2. Capas y Responsabilidades

### 2.1 Capa de Dominio (`/src/domain/`)
* **Ubicación**: `/src/domain/models/`, `/src/domain/rules/`
* **Responsabilidad**: Modela las entidades puras del negocio asistencial y normativo de auditoría hospitalaria colombiana (FOMAG, MinSalud, Resoluciones 3100/2019, 1995/1999, 256/2016).
* **Entidades Principales**:
  * `Expedient` (Agregado principal de auditoría concurrente).
  * `Document` (`ClinicalDocHC` con metadatos, estado de ingesta y hashes).
  * `Finding` (Hallazgos tipificados por oportunidad, pertinencia, seguridad y costos).
  * `Evidence` (Citas directas de folio, página, texto y nivel de confianza).
  * `AuditRule` (Catálogo de reglas de pertinencia y oportunidad).
  * `AuditResult` & `AuditRiskAssessment` (Calificación de estancia y riesgo).

### 2.2 Capa de Aplicación (`/src/application/`)
* **Ubicación**: `/src/application/expedient/`, `/src/application/audit/`, `/src/application/reporting/`
* **Responsabilidad**: Coordina flujos de negocio sin acoplarse a tecnologías externas ni librerías de UI:
  * `ProcessExpedientUseCase`: Orquesta la inspección del PDF, la extracción OCR, el draft de IA y la indexación en el expediente.
  * `AuditExpedientUseCase`: Evalúa las reglas de auditoría sobre los días de estancia y hallazgos registrados para computar el scoring de pertinencia (0-100) y riesgo.
  * `GenerateReportUseCase`: Ensambla el dataset de 18 secciones y compila el HTML para visualización, impresión y exportación CSV.

### 2.3 Capa de Infraestructura (`/src/infrastructure/`)
* **Ubicación**:
  * `/src/infrastructure/ai/`: Proveedores de IA (`AIProvider` interface, `GeminiAIProvider`, `RuleBasedAIProvider`). Desacopla la lógica clínica del proveedor LLM subyacente.
  * `/src/infrastructure/pdf/`: Procesamiento e inspección de archivos PDF (`PDFProcessor`).
  * `/src/infrastructure/ocr/`: Simulación y ejecución de reconocimiento óptico de caracteres (`OCRService`).
  * `/src/infrastructure/storage/`: Adaptador de almacenamiento persistente (`LocalStorageAdapter`).
  * `/src/infrastructure/logging/`: Logger estructurado que sanitiza y protege PII (`LoggerService`).
  * `/src/infrastructure/config/`: Configuración global y banderas de características (`appConfig`).

### 2.4 Capa de Presentación (`/src/components/`)
* **Ubicación**: `/src/components/`
* **Responsabilidad**: Interfaz de usuario interactiva y responsiva (Tailwind CSS + Lucide Icons + Motion):
  * Censo de Pacientes e IPS (Barranquilla: Bonadona, Misericordia, Clínica Costa).
  * Visor y Cargador de Historias Clínicas con previsualización por páginas.
  * Expediente Concurrente de 14 pestañas clínicas.
  * Generador de Informes Oficiales de 18 secciones.
  * Matriz de Hallazgos y Seguimiento de Compromisos en 24h.

---

## 3. Flujo Principal del Sistema

```text
Usuario
   │  (Sube Historia Clínica / PDF)
   ▼
AuditClinicalRecordUploadView (Presentación)
   │
   ▼
ProcessExpedientUseCase (Aplicación)
   ├──> PDFProcessor (Infraestructura): Inspecciona páginas y metadatos
   ├──> OCRService (Infraestructura): Extrae y normaliza texto
   └──> GeminiAIProvider / RuleBasedProvider (Infraestructura): Estructura Layer 1/2
   │
   ▼
StorageService (Adaptador de Persistencia)
   │
   ▼
AuditExpedienteView (Presentación - 14 Pestañas)
   │  (Auditor valida, califica y registra hallazgos)
   ▼
AuditExpedientUseCase (Aplicación)
   │  (Calcula riesgo, pertinencia y cumplimiento)
   ▼
GenerateReportUseCase / ReportService (Aplicación)
   │  (Genera informe de 18 secciones y PDF para descarga/impresión)
   ▼
Auditor / IPS / FOMAG
```

---

## 4. Regla Permanente de Seguridad Asistencial

Todas las capas del sistema y salidas de informes mantienen de forma inmutable la advertencia:
> *"Esta herramienta es un sistema de apoyo a la auditoría y no reemplaza el criterio profesional del auditor ni las decisiones del equipo asistencial."*
