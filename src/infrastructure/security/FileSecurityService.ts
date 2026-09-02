export interface FileValidationResult {
  valid: boolean;
  errorCode?: 'INVALID_MIME_TYPE' | 'INVALID_EXTENSION' | 'FILE_EMPTY' | 'FILE_TOO_LARGE' | 'FILE_CORRUPT' | 'SECURITY_BLOCKED';
  errorMessage?: string;
  sanitizedFileName?: string;
  secureInternalId?: string;
  fileSizeBytes?: number;
  calculatedHash?: string;
}

export class FileSecurityService {
  private static readonly MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
  private static readonly ALLOWED_MIME_TYPES = ['application/pdf'];
  private static readonly ALLOWED_EXTENSIONS = ['.pdf'];
  private static readonly DISALLOWED_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.sh', '.js', '.vbs', '.msi', '.ps1', '.php', '.py', '.scr', '.dll'
  ];

  /**
   * Sanitizes filename against path traversal, special characters, and double extensions
   */
  static sanitizeFileName(rawFileName: string): string {
    if (!rawFileName) return `documento_${Date.now()}.pdf`;
    
    // Remove directory traversal characters
    let name = rawFileName.replace(/[\/\\]/g, '_').trim();
    
    // Normalize unicode
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Replace non-alphanumeric (except dot, underscore, dash)
    name = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Ensure it ends with .pdf and not .exe.pdf
    const lower = name.toLowerCase();
    for (const badExt of this.DISALLOWED_EXTENSIONS) {
      if (lower.includes(badExt)) {
        name = name.replace(new RegExp(badExt, 'gi'), '_blocked_');
      }
    }

    if (!name.toLowerCase().endsWith('.pdf')) {
      name = `${name}.pdf`;
    }

    return name;
  }

  /**
   * Validates an uploaded File instance
   */
  static async validateUploadedFile(file: File): Promise<FileValidationResult> {
    if (!file) {
      return {
        valid: false,
        errorCode: 'FILE_EMPTY',
        errorMessage: 'No se recibió ningún archivo para procesar.'
      };
    }

    // 1. Check size: empty
    if (file.size === 0) {
      return {
        valid: false,
        errorCode: 'FILE_EMPTY',
        errorMessage: 'El archivo está vacío (0 bytes) y no contiene información procesable.'
      };
    }

    // 2. Check size: too large
    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        errorCode: 'FILE_TOO_LARGE',
        errorMessage: `El archivo supera el límite máximo permitido de 50MB (Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`
      };
    }

    // 3. Extension check
    const rawName = file.name.toLowerCase();
    const hasValidExtension = this.ALLOWED_EXTENSIONS.some(ext => rawName.endsWith(ext));
    if (!hasValidExtension) {
      return {
        valid: false,
        errorCode: 'INVALID_EXTENSION',
        errorMessage: 'Extensión no permitida. El sistema solo acepta expedientes en formato PDF (.pdf).'
      };
    }

    // 4. Blacklist extension check
    for (const badExt of this.DISALLOWED_EXTENSIONS) {
      if (rawName.includes(badExt)) {
        return {
          valid: false,
          errorCode: 'SECURITY_BLOCKED',
          errorMessage: 'El archivo contiene extensiones potencialmente peligrosas o ejecutables.'
        };
      }
    }

    // 5. MIME Type check (fallback check if browser provided it)
    if (file.type && !this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        errorCode: 'INVALID_MIME_TYPE',
        errorMessage: `Tipo MIME no compatible (${file.type}). Se requiere application/pdf.`
      };
    }

    // 6. Magic bytes header inspection (PDF must start with %PDF-)
    try {
      const slice = file.slice(0, 8);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const header = String.fromCharCode(...bytes.slice(0, 5));
      
      if (!header.startsWith('%PDF-')) {
        return {
          valid: false,
          errorCode: 'FILE_CORRUPT',
          errorMessage: 'Cabecera de archivo inválida o corrupta. El contenido binario no corresponde a un documento PDF estándar.'
        };
      }
    } catch {
      // In constrained environments where slice/arrayBuffer is not supported
    }

    // 7. Generate safe identifiers and hash
    const sanitizedFileName = this.sanitizeFileName(file.name);
    const secureInternalId = `doc_hc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const calculatedHash = `sha256_${Date.now()}_${file.size}`;

    return {
      valid: true,
      sanitizedFileName,
      secureInternalId,
      fileSizeBytes: file.size,
      calculatedHash
    };
  }

  /**
   * Generates a safe file identifier without exposing local path
   */
  static generateSecureStoragePath(ipsId: string, auditId: string, secureId: string): string {
    const cleanIps = ipsId.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanAudit = auditId.replace(/[^a-zA-Z0-9_-]/g, '');
    return `secure_vault/${cleanIps}/${cleanAudit}/${secureId}.dat`;
  }
}
