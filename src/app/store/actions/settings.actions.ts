export class SetVersion {
  static readonly type = '[Settings] SetVersion';
  constructor(public readonly payload: string) {}
}
