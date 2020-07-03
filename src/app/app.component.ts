import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { StorageService } from './providers/storage.service';
import { Login } from './store/actions/auth.actions';
import changelog from '../assets/changelog.json';
import { MatDialog } from '@angular/material/dialog';
import { ChangelogComponent } from './components/changelog/changelog.component';

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
    private storage: StorageService,
    private matDialog: MatDialog
  ) {
    this.electronService.setVersion();
    if (AppConfig.production) {
      this.electronService.update();

      if (this.storage.get('updated') === true || this.storage.get('updated') === undefined) {
        this.matDialog.open(ChangelogComponent, {
          width: '600px',
          data: {
            changes: changelog
          }
        });
        this.storage.set('updated', false);
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
    } else {
      this.store.dispatch(new Navigate(['']));
    }
  }
}
