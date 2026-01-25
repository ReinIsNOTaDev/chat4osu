import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Store } from '@ngxs/store';
import { AddToast } from '../store/actions/toast.actions';
import { AppConfig } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  dialog: typeof dialog;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  autoUpdater: typeof autoUpdater;
  log: typeof log;
  fs: typeof fs;
  shell: typeof shell;

  constructor(private store: Store, private storage: StorageService) {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      // this.remote = window.require('electron').remote;
      this.shell = window.require('electron').shell;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      // Load electron-log (v5+ uses /renderer for renderer process)
      const electronLog = window.require('electron-log/renderer');
      this.log = electronLog.default || electronLog;

      // Note: electron-updater must run in main process, not renderer
      // Auto-update functionality disabled in renderer - would need IPC to main process

      // Load dialog from @electron/remote if available, otherwise skip
      try {
        const remote = window.require('@electron/remote');
        this.dialog = remote.dialog;
      } catch (e) {
        console.log('Remote dialog not available');
      }

      this.log.info('Starting...');
    }
  }

  openLinkInBrowser(url: string) {
    if (this.isElectron()) {
      this.shell.openExternal(url);
    }
  }

  async openSaveDialog(options: Electron.SaveDialogOptions, callback: (filename: string) => void) {
    if (this.isElectron()) {
      const file = await this.dialog.showSaveDialog(options);
      callback(file.filePath);
    }
  }

  saveFile(path: string, content: string, callback: () => void) {
    if (this.isElectron()) {
      this.fs.writeFile(path, content, (err) => {
        if (err) {
          console.error('An error ocurred creating the file ' + err.message);
        } else {
          callback();
        }
      });
    }
  }

  openDevTools() {
    if (this.isElectron()) {
      // this.remote.getCurrentWebContents().openDevTools();
    }
  }

  autoUpdateListeners() {
    this.autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
    });

    this.autoUpdater.on('update-available', () => {
      console.log('Update available.');
      this.store.dispatch(
        new AddToast({
          detail:
            'A new update was found and will be downloaded in the background...',
          key: 'toast',
          severity: 'info'
        })
      );
    });

    this.autoUpdater.on('update-not-available', () => {
      console.log('No updates found.');
    });

    this.autoUpdater.on('error', err => {
      console.log('Error in auto-updater.', err);
      this.store.dispatch(
        new AddToast({
          detail:
            'The auto updater has encountered an error. Please check the logs for more info!',
          key: 'toast',
          severity: 'error'
        })
      );
    });

    this.autoUpdater.on('download-progress', progressObj => {
      let log_message = `Download speed: ${
        progressObj.bytesPerSecond
        } - Downloaded ${Math.round(progressObj.percent)} %`;
      log_message = `${log_message} (${progressObj.transferred}/${
        progressObj.total
        })`;
      console.log(log_message);
    });

    this.autoUpdater.on('update-downloaded', info => {
      this.store.dispatch(
        new AddToast({
          detail: 'A new update was downloaded! Please restart chat4osu to install it.',
          key: 'toast',
          severity: 'info'
        })
      );
      this.storage.set('updated', true);
    });
  }

  isElectron = () => window != null && window.process != null && window.process.type != null;

  update() {
    // Auto-update disabled - electron-updater must run in main process
    // Would need IPC communication to trigger updates from renderer
    console.log('Auto-update check skipped - not available in renderer');
  }
}
