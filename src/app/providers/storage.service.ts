import { Injectable } from '@angular/core';
import Store from 'electron-store';

@Injectable()
export class StorageService {
  storage: Store<any>;

  isElectron = () => window && window.process && window.process.type;

  constructor() {
    if (this.isElectron()) {
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
