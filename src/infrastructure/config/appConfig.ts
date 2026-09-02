/**
 * INFRASTRUCTURE LAYER - Configuration
 * Environment management, limits, and feature toggles.
 */

export interface AppConfig {
  appName: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  maxFileUploadSizeBytes: number;
  allowedDocumentExtensions: string[];
  features: {
    enableAIAnalysis: boolean;
    enableAdvancedOCR: boolean;
    enableAutomaticRiskScoring: boolean;
    enableAuditTrail: boolean;
  };
  safetyDisclaimer: string;
}

export const appConfig: AppConfig = {
  appName: 'Sistema Inteligente de Auditoría FOMAG',
  version: '2.0.0-fase2',
  environment: (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ? 'production' : 'development',
  maxFileUploadSizeBytes: 25 * 1024 * 1024, // 25 MB
  allowedDocumentExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
  features: {
    enableAIAnalysis: true,
    enableAdvancedOCR: true,
    enableAutomaticRiskScoring: true,
    enableAuditTrail: true
  },
  safetyDisclaimer:
    'Esta herramienta es un sistema de apoyo a la auditoría y no reemplaza el criterio profesional del auditor ni las decisiones del equipo asistencial.'
};
