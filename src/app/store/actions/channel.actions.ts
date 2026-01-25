export class OpenChannelDialog {
  static readonly type = '[Channel] OpenChannelDialog';
}

export class JoinChannel {
  static readonly type = '[Channel] JoinChannel';
  constructor(public payload: { channelName: string }) { }
}

export class JoinAndSetChannel {
  static readonly type = '[Channel] JoinAndSetChannel';
  constructor(public payload: { channelName: string }) { }
}

export class JoinChannelSuccess {
  static readonly type = '[Channel] JoinChannelSuccess';
  constructor(public payload: { channelName: string }) { }
}

export class JoinChannelFailed {
  static readonly type = '[Channel] JoinChannelFailed';
  constructor(public payload: any) { }
}

export class SetChannel {
  static readonly type = '[Channel] SetChannel';
  constructor(public payload: { channelName: string }) { }
}

export class CycleToNextChannel {
  static readonly type = '[Channel] CycleToNextChannel';
}

export class CycleToPreviousChannel {
  static readonly type = '[Channel] CycleToPreviousChannel';
}

export class CycleToChannel {
  static readonly type = '[Channel] CycleToChannel';
  constructor(public payload: { channelIndex: number }) { }
}

export class CycleToLastChannel {
  static readonly type = '[Channel] CycleToLastChannel';
}

export class SetMessage {
  static readonly type = '[Channel] SetMessage';
  constructor(public payload: string) { }
}

export class LeaveChannel {
  static readonly type = '[Channel] LeaveChannel';
  constructor(public payload: { channelName: string }) { }
}

export class GetChannelUsers {
  static readonly type = '[Channel] GetChannelUsers';
  constructor(public payload: { channelName: string }) { }
}

export class SetChannelUsers {
  static readonly type = '[Channel] SetChannelUsers';
  constructor(public payload: { channelName: string; users: string[] }) { }
}

export class SetOperators {
  static readonly type = '[Channel] SetOperators';
  constructor(public payload: { operators: string[] }) { }
}

export class ChangeChannelName {
  static readonly type = '[Channel] ChangeChannelName';
  constructor(public payload: { channelName: string; newName: string }) { }
}

export class RearrangeChannel {
  static readonly type = '[Channel] RearrangeChannel';
  constructor(public payload: { previousIndex: number, currentIndex: number }) { }
}
