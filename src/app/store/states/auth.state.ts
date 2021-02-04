import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import {
  Login,
  LoginSuccess,
  LoginFailed,
  Logout
} from '../actions/auth.actions';
import produce from 'immer';
import { IrcService } from '../../providers/irc.service';
import { Navigate } from '@ngxs/router-plugin';
import { StorageService } from '../../providers/storage.service';
import { Injectable } from '@angular/core';
import { SettingsState } from './settings.state';
import { HotkeysService } from '../../providers/hotkeys.service';

export interface AuthStateModel {
  username: string;
  password: string;
  loggedIn: boolean;
  loggingIn: boolean;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    username: '',
    password: '',
    loggedIn: false,
    loggingIn: false
  }
})
@Injectable()
export class AuthState {
  @Selector()
  static username(state: AuthStateModel) {
    return state.username;
  }

  @Selector()
  static password(state: AuthStateModel) {
    return state.password;
  }

  @Selector()
  static loggingIn(state: AuthStateModel) {
    return state.loggingIn;
  }

  constructor(private irc: IrcService, private storage: StorageService, private store: Store, private hotkeys: HotkeysService) {}

  @Action(Login)
  async login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.loggingIn = true;
      })
    );

    this.irc.connect(
      action.payload.username,
      action.payload.password
    );
  }

  @Action(LoginSuccess)
  loginSuccess(ctx: StateContext<AuthStateModel>, action: LoginSuccess) {
    ctx.dispatch(new Navigate(['/chat']));

    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.loggedIn = true;
        draft.username = action.payload.username;
        draft.password = action.payload.password;
        draft.loggingIn = false;
      })
    );

    // Save auth in storage ONLY if remember credentials is set to true
    const saveCredentials = this.store.selectSnapshot(SettingsState.rememberCredentials) || false;

    if (saveCredentials) {
      this.storage.set('username', action.payload.username);
      this.storage.set('password', action.payload.password);
    }
  }

  @Action(LoginFailed)
  loginFailed(ctx: StateContext<AuthStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.loggedIn = false;
        draft.username = '';
        draft.loggingIn = false;
      })
    );

    // Remove auth from storage
    this.storage.delete('username');
    this.storage.delete('password');
  }

  @Action(Logout)
  async logout(ctx: StateContext<AuthStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.loggedIn = false;
        draft.loggingIn = false;
        draft.username = '';
      })
    );

    this.irc.logout();

    // Remove auth from storage
    this.storage.delete('username');
    this.storage.delete('password');

    ctx.dispatch(new Navigate(['/']));
  }
}
