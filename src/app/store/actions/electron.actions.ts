export class OpenDevTools {
  static readonly type = '[Electron] OpenDevTools';
}

export class OpenExternalUrl {
  static readonly type = '[Electron] OpenExternalUrl';
  constructor(public readonly payload: string) {}
}

export class CheckForUpdates {
  static readonly type = '[Electron] CheckForUpdates';
}
