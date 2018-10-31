import { State, Action, StateContext, Selector } from '@ngxs/store';
import {
  SetVersion,
  OpenExternalUrl,
  ToggleUsersPanel
} from '../actions/settings.actions';
import produce from 'immer';
import { ElectronService } from '../../providers/electron.service';

export interface SettingsStateModel {
  version: string;
  usersVisible: boolean;
}

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    version: '0.0.0',
    usersVisible: false
  }
})
export class SettingsState {
  @Selector()
  static version(state: SettingsStateModel) {
    return state.version;
  }

  @Selector()
  static usersVisible(state: SettingsStateModel) {
    return state.usersVisible;
  }

  constructor(private electron: ElectronService) {}

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
}
