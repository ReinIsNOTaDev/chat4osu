import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetVersion } from '../actions/settings.actions';
import produce from 'immer';

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

  @Action(SetVersion)
  setVersion(ctx: StateContext<SettingsStateModel>, action: SetVersion) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.version = action.payload;
      })
    );
  }
}
