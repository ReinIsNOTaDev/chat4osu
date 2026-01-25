import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ChangeSetting, PlayNotificationSound } from '../../../../store/actions/settings.actions';
import { SettingsState } from '../../../../store/states/settings.state';
import { Observable } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  @Select(SettingsState.notificationSoundEnabled)
  soundEnabled$: Observable<boolean>;

  @Select(SettingsState.selectedSound)
  selectedSound$: Observable<string>;

  @Select(SettingsState.notificationKeywords)
  notificationKeywords$: Observable<string>;

  keywords: string;

  constructor(private store: Store) { }

  ngOnInit(): void { }

  changeSetting(key: string, value: any) {
    this.store.dispatch(new ChangeSetting({ key, value }));
  }

  playNotificationSound() {
    this.store.dispatch(new PlayNotificationSound());
  }
}
