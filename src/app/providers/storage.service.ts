import { Injectable } from '@angular/core';
import * as Store from 'electron-store';

@Injectable()
export class StorageService {
  storage: Store;

  constructor() {
    this.storage = new Store();
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
