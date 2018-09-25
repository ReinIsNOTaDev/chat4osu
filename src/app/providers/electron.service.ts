import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Store } from '@ngxs/store';
import { AddToast } from '../store/actions/toast.actions';

@Injectable()
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  autoUpdater: typeof autoUpdater;
  log: typeof log;
  fs: typeof fs;

  constructor(private store: Store) {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      // Remote deps
      this.autoUpdater = this.remote.require('electron-updater').autoUpdater;
      this.log = this.remote.require('electron-log');
      this.log.info('Starting...');

      // Auto-update settings
      this.autoUpdater.logger = this.log;
      (<any>this.autoUpdater.logger).transports.file.level = 'info';
      this.autoUpdater.autoDownload = true;
      this.autoUpdater.setFeedURL({
        provider: 'generic',
        url:
          'https://gitlab.com/hallowatcher/chat4osu/-/jobs/artifacts/master/raw/release?job=build'
      });

      this.autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
      });

      this.autoUpdater.on('update-available', () => {
        console.log('Update available.');
        this.store.dispatch(
          new AddToast({
            summary: 'New update!',
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
            summary: 'New update!',
            detail: 'A new update was downloaded, restarting...',
            key: 'toast',
            severity: 'success'
          })
        );
      });

      this.autoUpdater.on('update-downloaded', info => {
        setTimeout(() => {
          this.autoUpdater.quitAndInstall();
        }, 3000);
      });
    }
  }

  isElectron = () => window && window.process && window.process.type;

  update() {
    if (this.isElectron()) {
      this.autoUpdater.checkForUpdates();
    }
  }
}
