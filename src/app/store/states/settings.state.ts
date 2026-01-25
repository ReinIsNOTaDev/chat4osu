import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import {
  ToggleUsersPanel,
  HideUsersPanel,
  LoadSettings,
  ChangeSetting,
  SaveSettings,
  PlayNotificationSound,
  OpenChangelog, CreateHotkey, DeleteHotkey
} from '../actions/settings.actions';
import { produce } from 'immer';
import { Injectable, NgZone } from '@angular/core';
import { StorageService } from '../../providers/storage.service';
import soundDb from '../../sounds.json';
import { SoundService } from '../../providers/sound.service';
import { ChangelogComponent } from '../../components/changelog/changelog.component';
import changelog from '../../../assets/changelog.json';
import { MatDialog } from '@angular/material/dialog';
import { AuthState } from './auth.state';
import { HotkeysService } from '../../providers/hotkeys.service';

export interface Settings {
  notificationSoundEnabled: boolean;
  selectedSound: string;
  notificationKeywords: string;
  rememberCredentials: boolean;
  hotkeys: { hotkeyString: string; command: string; }[];
}

export interface SettingsStateModel {
  usersVisible: boolean;
  appSettings: Settings;
}

const defaultAppSettings: Settings = {
  notificationSoundEnabled: true,
  selectedSound: 'click',
  notificationKeywords: '',
  rememberCredentials: false,
  hotkeys: []
};

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    usersVisible: false,
    appSettings: defaultAppSettings
  }
})
@Injectable()
export class SettingsState {
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

  @Selector()
  static notificationKeywords(state: SettingsStateModel) {
    return state.appSettings.notificationKeywords;
  }

  @Selector()
  static rememberCredentials(state: SettingsStateModel) {
    return state.appSettings.rememberCredentials;
  }

  @Selector()
  static hotkeys(state: SettingsStateModel) {
    return state.appSettings.hotkeys;
  }

  constructor(
    private storage: StorageService,
    private sounds: SoundService,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private store: Store,
    private hotkeys: HotkeysService
  ) { }

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

      // Set remember credentials to true if there's already a username and password stored
      const username = this.storage.get('username');
      const password = this.storage.get('password');
      if (username && username !== '' && password && password !== '') {
        draft.appSettings.rememberCredentials = true;
      }

      // Register custom hotkeys every time we load settings
      this.registerHotkeys(draft.appSettings.hotkeys);
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

    // Handlers for changed settings
    const username = this.store.selectSnapshot(AuthState.username);
    const password = this.store.selectSnapshot(AuthState.password);

    // Save credentials every time we save settings and 'rememberCredentials' is true
    if (settings.rememberCredentials) {
      this.storage.set('username', username);
      this.storage.set('password', password);
    } else {
      this.storage.delete('username');
      this.storage.delete('password');
    }

    // Register custom hotkeys every time we save settings
    this.registerHotkeys(settings.hotkeys);
  }

  @Action(PlayNotificationSound)
  playNotificationSound(ctx: StateContext<SettingsStateModel>) {
    const settings = ctx.getState().appSettings;
    if (settings.notificationSoundEnabled) {
      this.sounds.playSound(soundDb.find(e => e.name === settings.selectedSound).file);
    }
  }

  @Action(OpenChangelog)
  openChangelog() {
    this.ngZone.run(() => {
      this.dialog.open(ChangelogComponent, {
        width: '600px',
        autoFocus: false,
        data: {
          changes: changelog
        }
      });
    });
  }

  @Action(CreateHotkey)
  createHotkey(ctx: StateContext<SettingsStateModel>, action: CreateHotkey) {
    const newState = produce(ctx.getState(), draft => {

      // Delete existing hotkey if it exists
      const existingHotkeyIndex = draft.appSettings.hotkeys.findIndex(
        e => e.hotkeyString.toLowerCase() === action.payload.hotkey.toString().toLowerCase()
      );
      if (existingHotkeyIndex >= 0) {
        draft.appSettings.hotkeys.splice(existingHotkeyIndex, 1);
      }

      draft.appSettings.hotkeys.push({ hotkeyString: action.payload.hotkey.toString(), command: action.payload.command });
    });
    ctx.setState(newState);
  }

  @Action(DeleteHotkey)
  deleteHotkey(ctx: StateContext<SettingsStateModel>, action: DeleteHotkey) {
    const newState = produce(ctx.getState(), draft => {
      const existingHotkeyIndex = draft.appSettings.hotkeys.findIndex(
        e => e.hotkeyString.toLowerCase() === action.hotkeyString.toLowerCase()
      );
      if (existingHotkeyIndex >= 0) {
        draft.appSettings.hotkeys.splice(existingHotkeyIndex, 1);
      }
    });
    ctx.setState(newState);
  }

  private registerHotkeys(customHotkeys: { hotkeyString: string; command: string; }[]) {
    this.hotkeys.reset();
    this.hotkeys.registerHotkeys();

    for (const hotkey of customHotkeys) {
      this.hotkeys.addCustomHotkey(hotkey.hotkeyString, hotkey.command);
    }
  }
}
