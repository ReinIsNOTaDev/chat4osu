export class JoinChannel {
  static readonly type = '[Channel] JoinChannel';
  constructor(public payload: { channelName: string }) {}
}

export class JoinChannelSuccess {
  static readonly type = '[Channel] JoinChannelSuccess';
  constructor(public payload: { channelName: string }) {}
}

export class JoinChannelFailed {
  static readonly type = '[Channel] JoinChannelFailed';
  constructor(public payload: any) {}
}
