import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  storage: any;

  isElectron = () => window && window.process && window.process.type;

  constructor() {
    if (this.isElectron()) {
      const electronStore = window.require('electron-store');
      // electron-store v8+ is ESM - default export is on .default property
      const Store = electronStore.default || electronStore;
      this.storage = new Store();
    }
  }

  get(key: string) {
    return this.storage.get(key);
  }

  set(key: string, value: any) {
    return this.storage.set(key, value);
  }

  delete(key: string) {
    return this.storage.delete(key);
  }
}
