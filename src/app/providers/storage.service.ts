import { Injectable } from '@angular/core';
import * as Store from 'electron-store';

@Injectable()
export class StorageService {
  storage: typeof Store;

  isElectron = () => window && window.process && window.process.type;

  constructor() {
    if (this.isElectron()) {
      const electronStoreModule = window.require('electron-store');
      this.storage = new electronStoreModule();
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
