/**
 * INFRASTRUCTURE LAYER - Storage Adapter
 * Abstraction for local / remote persistence repositories.
 */
import { logger } from '../logging/loggerService';

export interface StorageAdapter {
  getItem<T>(key: string, defaultValue: T): T;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue;
      }
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (err: any) {
      logger.error('LocalStorageAdapter', `Error leyendo clave ${key}: ${err.message}`);
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err: any) {
      logger.error('LocalStorageAdapter', `Error guardando clave ${key}: ${err.message}`);
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (err: any) {
      logger.error('LocalStorageAdapter', `Error eliminando clave ${key}: ${err.message}`);
    }
  }

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
    } catch (err: any) {
      logger.error('LocalStorageAdapter', `Error limpiando almacenamiento: ${err.message}`);
    }
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
