import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ChangeSetting, OpenChangelog } from '../../../../store/actions/settings.actions';
import { Observable } from 'rxjs';
import { SettingsState } from '../../../../store/states/settings.state';

@Component({
  standalone: false,
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {
  @Select(SettingsState.rememberCredentials)
  rememberCredentials$: Observable<boolean>;

  constructor(private store: Store) { }

  ngOnInit(): void { }

  openChangelog() {
    this.store.dispatch(new OpenChangelog());
  }

  changeSetting(key: string, value: any) {
    this.store.dispatch(new ChangeSetting({ key, value }));
  }
}
