export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: { username: string; password: string }) {}
}

export class LoginSuccess {
  static readonly type = '[Auth] LoginSuccess';
  constructor(public payload: { username: string; password: string }) {}
}

export class LoginFailed {
  static readonly type = '[Auth] LoginFailed';
  constructor(public payload: any) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}
