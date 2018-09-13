import { State, Action, StateContext } from '@ngxs/store';
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
    username: '',
    loggedIn: false,
    loggingIn: false
  }
})
export class AuthState {
  constructor(public irc: IrcService, public router: Router) {}

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
    // TODO: Replace with store implementation
    this.router.navigate(['/chat']);

    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.loggedIn = true;
        draft.username = action.payload.username;
        draft.loggingIn = false;
      })
    );
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
  }
}
