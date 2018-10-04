import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
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

export interface AuthStateModel {
  username: string;
  loggedIn: boolean;
  loggingIn: boolean;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    username: '',
    loggedIn: false,
    loggingIn: false
  }
})
export class AuthState {
  @Selector()
  static username(state: AuthStateModel) {
    return state.username;
  }

  @Selector()
  static loggingIn(state: AuthStateModel) {
    return state.loggingIn;
  }

  constructor(private irc: IrcService, private storage: StorageService) {}

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
        draft.loggingIn = false;
      })
    );

    // Save auth in storage
    this.storage.set('username', action.payload.username);
    this.storage.set('password', action.payload.password);
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
        draft.loggingIn = false;
        draft.loggedIn = false;
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
