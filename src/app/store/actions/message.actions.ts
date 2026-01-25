export class SendMessage {
  static readonly type = '[Message] SendMessage';
  constructor(public payload: { message: string; date: Date }) {}
}

export class SendMessageToChannel {
  static readonly type = '[Message] SendMessageToChannel';
  constructor(
    public payload: { channel: string; message: string; date: Date }
  ) {}
}

export class ClearMessages {
  static readonly type = '[Message] ClearMessages';
  constructor(public payload: { channelName: string; }) {}
}

export class ReceiveMessage {
  static readonly type = '[Message] ReceiveMessage';
  constructor(
    public payload: {
      channelName: string;
      sender: string;
      message: string;
      date: Date;
      action?: boolean;
    }
  ) {}
}
