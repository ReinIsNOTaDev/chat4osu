import { Hotkey } from '../../providers/hotkeys.service';

export class SetVersion {
  static readonly type = '[Settings] SetVersion';
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

export class OpenChangelog {
  static readonly type = '[Settings] OpenChangelog';
}

export class CreateHotkey {
  static readonly type = '[Settings] CreateHotkey';
  constructor(public payload: { hotkey: Hotkey; command: string }) { }
}

export class DeleteHotkey {
  static readonly type = '[Settings] DeleteHotkey';
  constructor(public hotkeyString: string) { }
}
