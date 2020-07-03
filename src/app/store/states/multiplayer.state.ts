import { State, Action, StateContext, Selector } from '@ngxs/store';
import produce from 'immer';
import { ChangeChannelName } from '../actions/channel.actions';
import { SendMessageToChannel } from '../actions/message.actions';
import { Logout } from '../actions/auth.actions';
import {
  AddUser,
  RemoveUser,
  JoinMpLobby,
  LeaveMpLobby,
  MoveUser,
  SetTeam,
  SetRoomName,
  SetTeamMode,
  SetWinCondition,
  SetFreeMod,
  SetMods,
  SetBeatmap
} from '../actions/multiplayer.actions';
import { ChannelStateModel, ChannelState } from './channel.state';
import { StorageService } from '../../providers/storage.service';
import { Injectable } from '@angular/core';

export interface MpUser {
  username: string;
  slot: number;
  team: string;
  host: boolean;
}

export interface MpLobby {
  mpId: string;
  roomName: string;
  teamMode: string;
  winCondition: string;
  mods: string[];
  freemod: boolean;
  players: MpUser[];
  beatmapId: string;
  status: string;
}

export interface MultiplayerStateModel {
  multiplayerLobbies: { [mpId: string]: MpLobby };
}

@State<MultiplayerStateModel>({
  name: 'multiplayer',
  defaults: {
    multiplayerLobbies: {}
  }
})
@Injectable()
export class MultiplayerState {
  @Selector([ChannelState])
  static lobby(state: MultiplayerStateModel, channelState: ChannelStateModel) {
    return state.multiplayerLobbies[channelState.currentChannel];
  }

  constructor(private storage: StorageService) { }

  @Action(JoinMpLobby)
  async joinLobby(
    ctx: StateContext<MultiplayerStateModel>,
    action: JoinMpLobby
  ) {
    // Save channel for client reopening
    const channels = this.storage.get('channels') || ['#osu'];
    if (channels.indexOf(action.payload) === -1) {
      this.storage.set('channels', [...channels, action.payload]);
    }

    const newLobby: MpLobby = {
      mpId: action.payload,
      roomName: '',
      teamMode: '',
      winCondition: '',
      mods: [],
      freemod: false,
      players: [],
      beatmapId: '',
      status: ''
    };

    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies[action.payload] = newLobby;
      })
    );

    // Initialize channel settings
    ctx.dispatch(
      new SendMessageToChannel({
        channel: action.payload,
        message: '!mp settings',
        date: new Date()
      })
    );
  }

  @Action(LeaveMpLobby)
  async leaveLobby(
    ctx: StateContext<MultiplayerStateModel>,
    action: LeaveMpLobby
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        delete draft.multiplayerLobbies[action.payload];
        draft.multiplayerLobbies[action.payload] = undefined;
      })
    );
  }

  @Action(AddUser)
  async addUser(ctx: StateContext<MultiplayerStateModel>, action: AddUser) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        const user: MpUser = draft.multiplayerLobbies[
          action.payload.channelName
        ].players.find(
          e => e.username.toLowerCase() === action.payload.user.toLowerCase()
        );

        if (!user) {
          draft.multiplayerLobbies[action.payload.channelName].players.push({
            host: false,
            username: action.payload.user,
            slot: action.payload.slot,
            team: action.payload.team
          });
        } else {
          user.host = false;
          user.username = action.payload.user;
          user.slot = action.payload.slot;
          user.team = action.payload.team;
        }

        // Sort users by slot
        draft.multiplayerLobbies[
          action.payload.channelName
        ].players = draft.multiplayerLobbies[
          action.payload.channelName
        ].players.sort((a, b) => a.slot - b.slot);
      })
    );
  }

  @Action(MoveUser)
  async moveUser(ctx: StateContext<MultiplayerStateModel>, action: MoveUser) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        const player = draft.multiplayerLobbies[
          action.payload.channelName
        ].players.find(e => e.username === action.payload.user);
        player.slot = action.payload.slot;

        // Sort users by slot
        draft.multiplayerLobbies[
          action.payload.channelName
        ].players = draft.multiplayerLobbies[
          action.payload.channelName
        ].players.sort((a, b) => a.slot - b.slot);
      })
    );
  }

  @Action(SetTeam)
  async setTeam(ctx: StateContext<MultiplayerStateModel>, action: SetTeam) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        const player = draft.multiplayerLobbies[
          action.payload.channel
        ].players.find(e => e.username === action.payload.username);
        player.team = action.payload.team;
      })
    );
  }

  @Action(SetRoomName)
  async setRoomName(
    ctx: StateContext<MultiplayerStateModel>,
    action: SetRoomName
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies[action.payload.channel].roomName =
          action.payload.name;
      })
    );
  }

  @Action(SetFreeMod)
  async setFreeMod(
    ctx: StateContext<MultiplayerStateModel>,
    action: SetFreeMod
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies[action.payload.channel].freemod =
          action.payload.freemod;
      })
    );
  }

  @Action(SetMods)
  async setMods(ctx: StateContext<MultiplayerStateModel>, action: SetMods) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies[action.payload.channel].mods =
          action.payload.mods;
      })
    );
  }

  @Action(SetTeamMode)
  async setTeamMode(
    ctx: StateContext<MultiplayerStateModel>,
    action: SetTeamMode
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies[action.payload.channel].teamMode =
          action.payload.mode;
      })
    );
  }

  @Action(SetBeatmap)
  async setBeatmap(
    ctx: StateContext<MultiplayerStateModel>,
    action: SetBeatmap
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies[action.payload.channel].beatmapId =
          action.payload.id;
      })
    );
  }

  @Action(SetWinCondition)
  async setWinCondition(
    ctx: StateContext<MultiplayerStateModel>,
    action: SetWinCondition
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies[action.payload.channel].winCondition =
          action.payload.condition;
      })
    );
  }

  @Action(RemoveUser)
  async removeUser(
    ctx: StateContext<MultiplayerStateModel>,
    action: RemoveUser
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        const index = draft.multiplayerLobbies[
          action.payload.channelName
        ].players.findIndex(e => e.username === action.payload.user);
        delete draft.multiplayerLobbies[action.payload.channelName].players[
          index
        ];
        draft.multiplayerLobbies[action.payload.channelName].players.splice(
          index,
          1
        );
      })
    );
  }

  @Action(ChangeChannelName)
  changeChannelName(
    ctx: StateContext<MultiplayerStateModel>,
    action: ChangeChannelName
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies[action.payload.newName] = draft.multiplayerLobbies[action.payload.channelName];
        draft.multiplayerLobbies[action.payload.channelName] = undefined;
        delete draft.multiplayerLobbies[action.payload.channelName];

        draft.multiplayerLobbies[action.payload.newName].mpId = action.payload.newName;
      })
    );
  }

  @Action(Logout)
  async logout(ctx: StateContext<MultiplayerStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.multiplayerLobbies = {};
      })
    );
  }
}
