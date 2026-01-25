export class JoinMpLobby {
  static readonly type = '[Multiplayer] JoinMpLobby';
  constructor(public payload: string) {}
}

export class LeaveMpLobby {
  static readonly type = '[Multiplayer] LeaveMpLobby';
  constructor(public payload: string) {}
}

export class SetRoomName {
  static readonly type = '[Multiplayer] SetRoomName';
  constructor(public payload: { channel: string; name: string }) {}
}

export class SetTeamMode {
  static readonly type = '[Multiplayer] SetTeamMode';
  constructor(public payload: { channel: string; mode: string }) {}
}

export class SetWinCondition {
  static readonly type = '[Multiplayer] SetWinCondition';
  constructor(public payload: { channel: string; condition: string }) {}
}

export class SetMods {
  static readonly type = '[Multiplayer] SetMods';
  constructor(public payload: { channel: string; mods: string[] }) {}
}

export class SetFreeMod {
  static readonly type = '[Multiplayer] SetFreeMod';
  constructor(public payload: { channel: string; freemod: boolean }) {}
}

export class SetPlayerCount {
  static readonly type = '[Multiplayer] SetPlayerCount';
  constructor(public payload: { channel: string; count: number }) {}
}

export class SetBeatmap {
  static readonly type = '[Multiplayer] SetBeatmap';
  constructor(public payload: { channel: string; id: string }) {}
}

export class SetTeam {
  static readonly type = '[Multiplayer] SetTeam';
  constructor(
    public payload: { channel: string; username: string; team: string }
  ) {}
}

export class SetHost {
  static readonly type = '[Multiplayer] SetHost';
  constructor(public payload: { channel: string; username: number }) {}
}

export class AddUser {
  static readonly type = '[Multiplayer] AddUser';
  constructor(
    public payload: {
      channelName: string;
      user: string;
      slot: number;
      team?: string;
    }
  ) {}
}

export class MoveUser {
  static readonly type = '[Multiplayer] MoveUser';
  constructor(
    public payload: { channelName: string; user: string; slot: number }
  ) {}
}

export class RemoveUser {
  static readonly type = '[Multiplayer] RemoveUser';
  constructor(public payload: { channelName: string; user: string }) {}
}
