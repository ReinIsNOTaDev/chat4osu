import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LoadSettings, SaveSettings } from '../../store/actions/settings.actions';
import { Navigate } from '@ngxs/router-plugin';
import { SettingsState } from '../../store/states/settings.state';
import { Observable } from 'rxjs';
import { HotkeysService } from '../../providers/hotkeys.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Select(SettingsState.version)
  version$: Observable<string>;

  constructor(private store: Store, private hotkeysService: HotkeysService) { }

  ngOnInit(): void {
    this.hotkeysService.changeScope('settings');
  }

  ngOnDestroy(): void {
    this.hotkeysService.changeScope('app');
  }

  saveSettings() {
    this.store.dispatch(new SaveSettings()).subscribe(() => {
      this.store.dispatch(new Navigate(['/chat']));
    });
  }

  cancel() {
    this.store.dispatch(new LoadSettings()).subscribe(() => {
      this.store.dispatch(new Navigate(['/chat']));
    });
  }
}
