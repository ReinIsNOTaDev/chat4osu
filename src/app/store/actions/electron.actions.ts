export class OpenDevTools {
  static readonly type = '[Electron] OpenDevTools';
}

export class OpenExternalUrl {
  static readonly type = '[Settings] OpenExternalUrl';
  constructor(public readonly payload: string) {}
}
