/**
 * INFRASTRUCTURE LAYER - Logging Service
 * Provides structured, operational logging while preserving patient privacy (PII-safe).
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  metadata?: Record<string, unknown>;
}

class LoggerService {
  private inMemoryLogs: StructuredLog[] = [];
  private readonly maxLogsCount = 500;

  private formatMessage(level: LogLevel, context: string, message: string, metadata?: Record<string, unknown>): StructuredLog {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      metadata: metadata ? this.sanitizeMetadata(metadata) : undefined
    };
  }

  /**
   * Sanitizes metadata to avoid logging sensitive clinical details or full document payloads
   */
  private sanitizeMetadata(meta: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta)) {
      if (['fullText', 'rawText', 'documentContent', 'rawPayload'].includes(key)) {
        clean[key] = '[REDACTED_CONTENT_SIZE:' + (typeof value === 'string' ? value.length : 'OBJECT') + ']';
      } else {
        clean[key] = value;
      }
    }
    return clean;
  }

  private pushLog(log: StructuredLog): void {
    this.inMemoryLogs.unshift(log);
    if (this.inMemoryLogs.length > this.maxLogsCount) {
      this.inMemoryLogs.pop();
    }

    if (log.level === 'ERROR') {
      console.error(`[${log.timestamp}] [${log.context}] ❌ ${log.message}`, log.metadata || '');
    } else if (log.level === 'WARN') {
      console.warn(`[${log.timestamp}] [${log.context}] ⚠️ ${log.message}`, log.metadata || '');
    } else {
      console.log(`[${log.timestamp}] [${log.context}] ℹ️ ${log.message}`, log.metadata || '');
    }
  }

  debug(context: string, message: string, metadata?: Record<string, unknown>): void {
    this.pushLog(this.formatMessage('DEBUG', context, message, metadata));
  }

  info(context: string, message: string, metadata?: Record<string, unknown>): void {
    this.pushLog(this.formatMessage('INFO', context, message, metadata));
  }

  warn(context: string, message: string, metadata?: Record<string, unknown>): void {
    this.pushLog(this.formatMessage('WARN', context, message, metadata));
  }

  error(context: string, message: string, metadata?: Record<string, unknown>): void {
    this.pushLog(this.formatMessage('ERROR', context, message, metadata));
  }

  getLogs(filterLevel?: LogLevel): StructuredLog[] {
    if (filterLevel) {
      return this.inMemoryLogs.filter(l => l.level === filterLevel);
    }
    return [...this.inMemoryLogs];
  }

  clearLogs(): void {
    this.inMemoryLogs = [];
  }
}

export const logger = new LoggerService();
