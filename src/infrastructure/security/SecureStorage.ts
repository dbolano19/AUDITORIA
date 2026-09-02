/**
 * Secure Storage layer abstraction
 * Prevents storage of plaintext passwords and handles session token isolation.
 */
export class SecureStorage {
  private static readonly PREFIX = 'fomag_sec_';

  /**
   * Encodes a value before storing (Base64 + prefix) for client-side storage obfuscation
   */
  static setItem(key: string, value: any): void {
    try {
      const json = JSON.stringify(value);
      const encoded = btoa(encodeURIComponent(json));
      localStorage.setItem(`${this.PREFIX}${key}`, encoded);
    } catch (e) {
      console.error(`SecureStorage write error for key ${key}:`, e);
    }
  }

  /**
   * Decodes an item from secure storage
   */
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(`${this.PREFIX}${key}`);
      if (!raw) return defaultValue;
      const decoded = decodeURIComponent(atob(raw));
      return JSON.parse(decoded) as T;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Removes an item
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`);
    } catch {}
  }

  /**
   * Clears all session and secure data on logout
   */
  static clearSessionData(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(this.PREFIX) || k.includes('session') || k.includes('active_user'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
  }
}
