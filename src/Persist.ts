

export class Persist {
  static store<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  static load<T>(key: string): T | null {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }
}