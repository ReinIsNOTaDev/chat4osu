import { Injectable } from '@angular/core';
import * as Store from 'electron-store';
import { ElectronService } from './electron.service';

@Injectable()
export class StorageService {
  storage: typeof Store;

  constructor(electron: ElectronService) {
    if (electron.isElectron()) {
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
