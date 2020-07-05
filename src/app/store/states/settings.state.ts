import { State, Action, StateContext, Selector } from '@ngxs/store';
import {
  SetVersion,
  OpenExternalUrl,
  ToggleUsersPanel, HideUsersPanel, LoadSettings, ChangeSetting, SaveSettings, PlayNotificationSound
} from '../actions/settings.actions';
import produce from 'immer';
import { ElectronService } from '../../providers/electron.service';
import { Injectable } from '@angular/core';
import { StorageService } from '../../providers/storage.service';
import soundDb from '../../sounds.json';
import { SoundService } from '../../providers/sound.service';

export interface Settings {
  notificationSoundEnabled: boolean;
  selectedSound: string;
}

export interface SettingsStateModel {
  version: string;
  usersVisible: boolean;
  appSettings: Settings;
}

const defaultAppSettings: Settings = {
  notificationSoundEnabled: true,
  selectedSound: 'click'
};

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    version: '0.0.0',
    usersVisible: false,
    appSettings: defaultAppSettings
  }
})
@Injectable()
export class SettingsState {
  @Selector()
  static version(state: SettingsStateModel) {
    return state.version;
  }

  @Selector()
  static usersVisible(state: SettingsStateModel) {
    return state.usersVisible;
  }

  @Selector()
  static notificationSoundEnabled(state: SettingsStateModel) {
    return state.appSettings.notificationSoundEnabled;
  }

  @Selector()
  static selectedSound(state: SettingsStateModel) {
    return state.appSettings.selectedSound;
  }

  constructor(private electron: ElectronService, private storage: StorageService, private sounds: SoundService) { }

  @Action(SetVersion)
  setVersion(ctx: StateContext<SettingsStateModel>, action: SetVersion) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.version = action.payload;
      })
    );
  }

  @Action(OpenExternalUrl)
  openExternalUrl(ctx: StateContext<SettingsStateModel>, action: SetVersion) {
    this.electron.openLinkInBrowser(action.payload);
  }

  @Action(ToggleUsersPanel)
  toggleUsersPanel(ctx: StateContext<SettingsStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.usersVisible = !draft.usersVisible;
      })
    );
  }

  @Action(HideUsersPanel)
  hideUsersPanel(ctx: StateContext<SettingsStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.usersVisible = false;
      })
    );
  }

  @Action(LoadSettings)
  loadSettings(ctx: StateContext<SettingsStateModel>) {
    const appSettings = this.storage.get('app-settings') || defaultAppSettings;
    const newState = produce(ctx.getState(), draft => {
      draft.appSettings = appSettings;
    });
    ctx.setState(newState);
  }

  @Action(ChangeSetting)
  changeSetting(ctx: StateContext<SettingsStateModel>, action: ChangeSetting) {
    const newState = produce(ctx.getState(), draft => {
      draft.appSettings = {
        ...draft.appSettings,
        [action.payload.key]: action.payload.value
      };
    });
    ctx.setState(newState);
  }

  @Action(SaveSettings)
  saveSettings(ctx: StateContext<SettingsStateModel>) {
    const settings = ctx.getState().appSettings;
    this.storage.set('app-settings', settings);
  }

  @Action(PlayNotificationSound)
  playNotificationSound(ctx: StateContext<SettingsStateModel>) {
    const settings = ctx.getState().appSettings;
    if (settings.notificationSoundEnabled) {
      this.sounds.playSound(soundDb.find(e => e.name === settings.selectedSound).file);
    }
  }
}
