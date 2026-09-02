# MATRIZ DE MIGRACIÓN ARQUITECTÓNICA — FASE 2
## Sistema Inteligente de Auditoría Documental FOMAG

| Archivo / Componente Original | Responsabilidad Original | Nuevo Módulo / Capa | Acción Realizada | Estado | Nivel de Riesgo |
|---|---|---|---|---|---|
| `/src/types/index.ts` | Definición monolítica de tipos | `/src/domain/models/index.ts` | Separado en entidades puras de Dominio (`Expedient`, `Document`, `Finding`, `Evidence`, `AuditRule`, `AuditResult`, `Risk`) | **MIGRADO & REEXPORTADO** | Bajo |
| *Nuevo* | Catálogo de reglas normativas de auditoría | `/src/domain/rules/auditRules.ts` | Implementación del catálogo FOMAG / MinSalud (Resolución 3100/1995/256) | **CREADO** | Bajo |
| `/src/services/aiService.ts` | Servicio monolítico acoplado a IA | `/src/infrastructure/ai/` (`AIProvider`, `GeminiProvider`, `RuleBasedProvider`) + Facade en `services/` | Desacoplamiento del proveedor de IA; ahora la lógica de auditoría no depende directamente del vendor | **MIGRADO** | Bajo |
| *Nuevo* | Manejo de configuración y variables de entorno | `/src/infrastructure/config/appConfig.ts` | Centralización de límites de archivos, extensiones permitidas y feature flags | **CREADO** | Bajo |
| *Nuevo* | Registro de eventos operacionales | `/src/infrastructure/logging/loggerService.ts` | Creación de logger estructurado seguro que previene fugas de datos sensibles (PII-Safe) | **CREADO** | Bajo |
| *Nuevo* | Ingesta e inspección de documentos PDF | `/src/infrastructure/pdf/pdfProcessor.ts` | Módulo de análisis de tamaño, cálculo estimado de páginas y thumbnails | **CREADO** | Bajo |
| *Nuevo* | Pipeline de OCR y extracción de texto | `/src/infrastructure/ocr/ocrService.ts` | Servicio de extracción con índice de confianza y división por secciones clínicas | **CREADO** | Bajo |
| *Nuevo* | Adaptador de almacenamiento local/remoto | `/src/infrastructure/storage/storageAdapter.ts` | Abstracción de acceso y serialización resiliente a fallos | **CREADO** | Bajo |
| *Nuevo* | Orquestación de ingesta y procesamiento | `/src/application/expedient/ProcessExpedientUseCase.ts` | Caso de uso que orquesta PDF + OCR + AI Provider + Creación de Entidad | **CREADO** | Bajo |
| *Nuevo* | Evaluación de pertinencia y scoring | `/src/application/audit/AuditExpedientUseCase.ts` | Caso de uso que aplica reglas de auditoría y calcula matrices de riesgo | **CREADO** | Bajo |
| `/src/services/reportService.ts` | Generación monolítica de informes | `/src/application/reporting/GenerateReportUseCase.ts` + Facade en `services/` | Caso de uso de renderizado HTML de 18 secciones, impresión PDF y exportación CSV | **MIGRADO** | Bajo |
| `/src/services/storageService.ts` | Almacén y persistencia de expedientes | `/src/services/storageService.ts` | Preservado como repositorio/fachada para retrocompatibilidad total de la UI | **PRESERVADO & COMPATIBLE** | Bajo |
| `/src/components/*` | Vistas de Presentación (Dashboard, Censo, Expediente 14 Tabs, Upload, Informes) | `/src/components/*` | Mantenidas en su totalidad, funcionando sobre la nueva arquitectura modular | **PRESERVADO & VERIFICADO** | Bajo |

---

## Principio Aplicado: PRESERVAR → SEPARAR → MIGRAR → PROBAR
1. **Preservar**: Ninguna pantalla o función clínica fue eliminada.
2. **Separar**: Modelos a `domain/`, casos de uso a `application/`, implementaciones concretas a `infrastructure/`.
3. **Migrar**: Se crearon adaptadores y reexportaciones para que los imports existentes funcionen al 100%.
4. **Probar**: Validación con linter (`tsc --noEmit`) y compilación de producción con Vite (`npm run build`).
