import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { StorageService } from './providers/storage.service';
import { Login } from './store/actions/auth.actions';
import { LoadSettings, OpenChangelog } from './store/actions/settings.actions';
import { fadeInAnimation } from './app.animations';
import { RouterOutlet } from '@angular/router';
import { CheckForUpdates } from './store/actions/electron.actions';
import { ElectronState } from './store/states/electron.state';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    fadeInAnimation
  ]
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private store: Store,
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.store.dispatch(new LoadSettings());

    if (AppConfig.production) {
      this.store.dispatch(new CheckForUpdates());

      if (this.storage.get('updated') === true || this.storage.get('updated') === undefined) {
        this.store.dispatch(new OpenChangelog());
        this.storage.set('updated', false);
      }
    }

    this.translate.setDefaultLang('en');

    if (this.store.selectSnapshot(ElectronState.isElectron)) {
      // Check storage for settings, etc
      const username = this.storage.get('username');
      const password = this.storage.get('password');

      if (username && username !== '' && password && password !== '') {
        this.store.dispatch(new Login({ username, password }));
      } else {
        this.store.dispatch(new Navigate(['']));
      }
    } else {
      this.store.dispatch(new Navigate(['']));
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
