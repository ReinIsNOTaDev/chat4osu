export class SendMessage {
  static readonly type = '[Message] SendMessage';
  constructor(public payload: { channelName: string; message: string }) {}
}

export class SendMessageSuccess {
  static readonly type = '[Message] SendMessageSuccess';
  constructor(public payload: { channelName: string; message: string }) {}
}

export class SendMessageFailed {
  static readonly type = '[Message] SendMessageFailed';
  constructor(public payload: any) {}
}

export class ReceiveMessage {
  static readonly type = '[Message] ReceiveMessage';
  constructor(
    public payload: { channelName: string; sender: string; message: string }
  ) {}
}
