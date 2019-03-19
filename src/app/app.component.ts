import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { Store, Select } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { StorageService } from './providers/storage.service';
import { Login } from './store/actions/auth.actions';
import { Observable } from 'rxjs';
import { ToastState } from './store/states/toast.state';
import { Message } from 'primeng/api';
import { AddToast } from './store/actions/toast.actions';
import changelog from '../assets/changelog.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @Select(ToastState.lastToast)
  lastToast$: Observable<Message>;

  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private store: Store,
    private storage: StorageService
  ) {
    this.electronService.setVersion();
    if (AppConfig.production) {
      this.electronService.update();

      if (this.storage.get('updated')) {
        setTimeout(() => {
          const changelogList = changelog.map(e => `\n- ${e}`).join('');

          this.store.dispatch(
            new AddToast({
              summary: 'c4o! has been updated!',
              detail: `New in this version:${changelogList}`,
              key: 'toast',
              severity: 'success',
              sticky: true
            })
          );
        }, 500);
        this.storage.set('updated', false)
      }
    }

    translate.setDefaultLang('en');

    if (electronService.isElectron()) {
      // Check storage for settings, etc
      const username = this.storage.get('username');
      const password = this.storage.get('password');

      if (username && password) {
        this.store.dispatch(new Login({ username, password }));
      } else {
        this.store.dispatch(new Navigate(['']));
      }

      if (!AppConfig.production) {
        this.electronService.ipcRenderer.send('dev-tools');
      }
    } else {
      this.store.dispatch(new Navigate(['']));
    }

    // Hack to show toast
    this.lastToast$.subscribe();
  }
}
