import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetVersion, OpenExternalUrl } from '../actions/settings.actions';
import produce from 'immer';
import { ElectronService } from '../../providers/electron.service';

export interface SettingsStateModel {
  version: string;
}

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    version: '0.0.0'
  }
})
export class SettingsState {
  @Selector()
  static version(state: SettingsStateModel) {
    return state.version;
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
}
