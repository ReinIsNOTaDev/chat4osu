import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
import { Login, LoginSuccess, LoginFailed } from '../actions/auth.actions';
import produce from 'immer';
import { IrcService } from '../../providers/irc.service';
import { Navigate } from '@ngxs/router-plugin';

export interface AuthStateModel {
  username: string;
  loggedIn: boolean;
  loggingIn: boolean;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    username: 'dsds',
    loggedIn: false,
    loggingIn: false
  }
})
export class AuthState {
  @Selector()
  static username(state: AuthStateModel) {
    return state.username;
  }

  constructor(public irc: IrcService) {}

  @Action(Login)
  async login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({
      loggingIn: true
    });

    this.irc.connect(
      action.payload.username,
      action.payload.password
    );
  }

  @Action(LoginSuccess)
  loginSuccess(ctx: StateContext<AuthStateModel>, action: LoginSuccess) {
    ctx.dispatch(new Navigate(['/chat']));

    ctx.patchState({
      loggedIn: true,
      loggingIn: false,
      username: action.payload.username
    });
  }

  @Action(LoginFailed)
  loginFailed(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      loggedIn: false,
      loggingIn: false,
      username: ''
    });
  }
}
