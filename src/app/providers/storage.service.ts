import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  storage: any;

  isElectron = () => window && window.process && window.process.type;

  constructor() {
    if (this.isElectron()) {
      const Store = window.require('electron-store');
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
