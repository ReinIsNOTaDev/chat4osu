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

export class ChangeSetting {
  static readonly type = '[Settings] ChangeSetting';
  constructor(public payload: { key: string; value: any }) { }
}

export class SaveSettings {
  static readonly type = '[Settings] SaveSettings';
}

export class LoadSettings {
  static readonly type = '[Settings] LoadSettings';
}

export class PlayNotificationSound {
  static readonly type = '[Settings] PlayNotificationSound';
}
