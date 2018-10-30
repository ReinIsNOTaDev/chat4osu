export class JoinChannel {
  static readonly type = '[Channel] JoinChannel';
  constructor(public payload: { channelName: string }) {}
}

export class JoinAndSetChannel {
  static readonly type = '[Channel] JoinAndSetChannel';
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

export class SetChannel {
  static readonly type = '[Channel] SetChannel';
  constructor(public payload: { channelName: string }) {}
}

export class LeaveChannel {
  static readonly type = '[Channel] LeaveChannel';
  constructor(public payload: { channelName: string }) {}
}

export class GetChannelUsers {
  static readonly type = '[Channel] GetChannelUsers';
  constructor(public payload: { channelName: string }) {}
}

export class SetChannelUsers {
  static readonly type = '[Channel] SetChannelUsers';
  constructor(public payload: { channelName: string; users: string[] }) {}
}
