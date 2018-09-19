import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { StorageService } from './providers/storage.service';
import { Login } from './store/actions/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private store: Store,
    private storage: StorageService
  ) {
    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }

    // Check storage for settings, etc
    const username = this.storage.get('username');
    const password = this.storage.get('password');

    if (username && password) {
      this.store.dispatch(new Login({ username, password }));
    } else {
      this.store.dispatch(new Navigate(['']));
    }
  }
}
