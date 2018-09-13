import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Login } from '../../store/actions/auth.actions';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(public store: Store) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl(''),
      password: new FormControl('')
    });
  }

  login() {
    this.store.dispatch(new Login(this.loginForm.value));
  }
}
