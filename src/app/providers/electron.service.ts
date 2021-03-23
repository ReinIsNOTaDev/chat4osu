import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Store } from '@ngxs/store';
import { AddToast } from '../store/actions/toast.actions';
import { SetVersion } from '../store/actions/settings.actions';
import { AppConfig } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  dialog: typeof dialog;
  webFrame: typeof webFrame;
  remote: typeof remote;
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
      this.remote = window.require('electron').remote;
      this.shell = window.require('electron').shell;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      // Remote deps
      this.autoUpdater = this.remote.require('electron-updater').autoUpdater;
      this.dialog = this.remote.dialog;
      this.log = this.remote.require('electron-log');
      this.log.info('Starting...');

      // Auto-update settings
      this.autoUpdater.logger = this.log;
      (<any>this.autoUpdater.logger).transports.file.level = 'info';
      this.autoUpdater.autoDownload = true;
      this.autoUpdater.setFeedURL({
        provider: 'generic',
        url: 'https://gitlab.com/hallowatcher/chat4osu/-/jobs/artifacts/master/raw/release?job=build'
      });

      this.store.dispatch(new SetVersion(this.remote.app.getVersion()));

      if (AppConfig.production) {
        this.autoUpdateListeners();
      }
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
      this.remote.getCurrentWebContents().openDevTools();
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
        } - Downloaded ${parseInt(progressObj.percent, 10)} %`;
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
    if (this.isElectron() && AppConfig.production) {
      this.autoUpdater.checkForUpdates();
    }
  }
}
