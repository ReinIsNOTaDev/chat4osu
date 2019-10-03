export class SetVersion {
  static readonly type = '[Settings] SetVersion';
  constructor(public readonly payload: string) {}
}

export class OpenExternalUrl {
  static readonly type = '[Settings] OpenExternalUrl';
  constructor(public readonly payload: string) {}
}

export class ToggleUsersPanel {
  static readonly type = '[Settings] ToggleUsersPanel';
}

export class HideUsersPanel {
  static readonly type = '[Settings] HideUsersPanel';
}
