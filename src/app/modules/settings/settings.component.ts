import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { LoadSettings, SaveSettings } from '../../store/actions/settings.actions';
import { Navigate } from '@ngxs/router-plugin';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(private store: Store) { }

  ngOnInit(): void { }

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
