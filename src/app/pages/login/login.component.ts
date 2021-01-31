import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Login } from '../../store/actions/auth.actions';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthState } from '../../store/states/auth.state';
import { SettingsState } from '../../store/states/settings.state';
import { ChangeSetting, OpenExternalUrl, SaveSettings } from '../../store/actions/settings.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Select(AuthState.loggingIn)
  loggingIn$: Observable<boolean>;

  @Select(SettingsState.version)
  version$: Observable<string>;

  @Select(SettingsState.rememberCredentials)
  rememberCredentials$: Observable<boolean>;

  loginForm: FormGroup;

  constructor(public store: Store) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ])
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.store.dispatch(new Login(this.loginForm.value));
    }
  }

  openIrcPage(event) {
    event.preventDefault();
    this.store.dispatch(new OpenExternalUrl('https://osu.ppy.sh/p/irc'));
  }

  changeRememberCredentials(value: any) {
    this.store.dispatch(new ChangeSetting({ key: 'rememberCredentials', value }));
    setTimeout(() => {
      this.store.dispatch(new SaveSettings());
    }, 100);
  }
}
