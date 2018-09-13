import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
import { Login, LoginSuccess, LoginFailed } from '../actions/auth.actions';
import produce from 'immer';
import { IrcService } from '../../providers/irc.service';
import { Router } from '@angular/router';

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
export class AuthState implements NgxsOnInit {
  @Selector()
  static username(state: AuthStateModel) {
    return state.username;
  }

  constructor(public irc: IrcService, public router: Router) {}

  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    // TODO: Replace with store implementation
    this.router.navigate(['/']);
  }

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
    // TODO: Replace with store implementation
    this.router.navigate(['/chat']);

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
