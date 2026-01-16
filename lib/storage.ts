export class LocalStorageManager {
  private isAvailable: boolean = false

  constructor() {
    this.isAvailable = this.checkAvailability()
  }

  private checkAvailability(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isAvailable) return null

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable) return false

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  removeItem(key: string): boolean {
    if (!this.isAvailable) return false

    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }

  clear(): boolean {
    if (!this.isAvailable) return false

    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  }

  getUsage(): { used: number; available: number } {
    if (!this.isAvailable) return { used: 0, available: 0 }

    try {
      let total = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
      // Approximate 5-10MB limit for most browsers
      return { used: total, available: 5 * 1024 * 1024 - total }
    } catch {
      return { used: 0, available: 0 }
    }
  }
}
