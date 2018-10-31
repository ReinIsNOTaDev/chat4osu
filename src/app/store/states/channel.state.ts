import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import produce from 'immer';
import {
  JoinChannel,
  JoinChannelSuccess,
  JoinChannelFailed,
  SetChannel,
  JoinAndSetChannel,
  LeaveChannel,
  SetChannelUsers,
  GetChannelUsers
} from '../actions/channel.actions';
import { IrcService } from '../../providers/irc.service';
import { ReceiveMessage } from '../actions/message.actions';
import { Logout } from '../actions/auth.actions';
import {
  AddUser,
  RemoveUser,
  JoinMpLobby,
  LeaveMpLobby
} from '../actions/multiplayer.actions';

export interface ChannelStateModel {
  channels: string[];
  users: { [channel: string]: string[] };
  currentChannel: string;
  multiplayer: boolean;
}

@State<ChannelStateModel>({
  name: 'channel',
  defaults: {
    channels: [],
    users: {},
    currentChannel: '',
    multiplayer: false
  }
})
export class ChannelState {
  @Selector()
  static channels(state: ChannelStateModel) {
    return state.channels;
  }

  @Selector()
  static currentChannel(state: ChannelStateModel) {
    return state.currentChannel;
  }

  @Selector()
  static multiplayer(state: ChannelStateModel) {
    return state.multiplayer;
  }

  @Selector()
  static users(state: ChannelStateModel) {
    return state.users[state.currentChannel];
  }

  constructor(public irc: IrcService, public store: Store) {}

  @Action(JoinChannel)
  joinChannel(ctx: StateContext<ChannelStateModel>, action: JoinChannel) {
    this.irc.joinChannel(action.payload.channelName);
  }

  @Action(JoinAndSetChannel)
  joinAndSetChannel(ctx: StateContext<ChannelStateModel>, action: JoinChannel) {
    this.irc.joinChannel(action.payload.channelName, true);
  }

  @Action(JoinChannelSuccess)
  joinChannelSuccess(
    ctx: StateContext<ChannelStateModel>,
    action: JoinChannelSuccess
  ) {
    const mp =
      action.payload.channelName
        .trim()
        .toLowerCase()
        .indexOf('#mp_') !== -1;

    if (mp) {
      this.store.dispatch(new JoinMpLobby(action.payload.channelName));
    }

    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.channels.push(action.payload.channelName);
      })
    );
  }

  @Action(JoinChannelFailed)
  joinChannelFailed(ctx: StateContext<ChannelStateModel>) {
    // Todo
  }

  @Action(ReceiveMessage)
  receiveMessage(ctx: StateContext<ChannelStateModel>, action: ReceiveMessage) {
    const state = ctx.getState();

    const channelKey = state.channels.find(
      key => key.toLowerCase() === action.payload.channelName.toLowerCase()
    );

    if (!channelKey) {
      ctx.setState(
        produce(state, draft => {
          draft.channels.push(action.payload.channelName);
        })
      );
    }
  }

  @Action(SetChannel)
  setChannel(ctx: StateContext<ChannelStateModel>, action: SetChannel) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.currentChannel = action.payload.channelName;
        const channel = action.payload.channelName;

        if (
          channel
            .trim()
            .toLowerCase()
            .indexOf('#mp_') !== -1
        ) {
          draft.multiplayer = true;
        } else {
          draft.multiplayer = false;
        }
      })
    );
  }

  @Action(LeaveChannel)
  leaveChannel(ctx: StateContext<ChannelStateModel>, action: SetChannel) {
    this.irc.partChannel(action.payload.channelName);

    const mp =
      action.payload.channelName
        .trim()
        .toLowerCase()
        .indexOf('#mp_') !== -1;

    if (mp) {
      this.store.dispatch(new LeaveMpLobby(action.payload.channelName));
    }

    ctx.setState(
      produce(ctx.getState(), draft => {
        const index = draft.channels.indexOf(action.payload.channelName);
        draft.channels.splice(index, 1);

        if (draft.channels.length === 0) {
          draft.currentChannel = '';
        } else if (
          draft.channels.indexOf(draft.currentChannel) === -1 &&
          draft.channels[index]
        ) {
          draft.currentChannel = draft.channels[index];
        } else if (
          draft.channels.indexOf(draft.currentChannel) === -1 &&
          !draft.channels[index]
        ) {
          draft.currentChannel = draft.channels[index - 1];
        }

        const channel = draft.currentChannel;

        if (
          channel
            .trim()
            .toLowerCase()
            .indexOf('#mp_') !== -1
        ) {
          draft.multiplayer = true;
        } else {
          draft.multiplayer = false;
        }
      })
    );
  }

  @Action(GetChannelUsers)
  async getChannelUsers(
    ctx: StateContext<ChannelStateModel>,
    action: GetChannelUsers
  ) {
    this.irc.getUsers(action.payload.channelName);
  }

  @Action(SetChannelUsers)
  async setChannelUsers(
    ctx: StateContext<ChannelStateModel>,
    action: SetChannelUsers
  ) {
    const mp =
      action.payload.channelName
        .trim()
        .toLowerCase()
        .indexOf('#mp_') !== -1;

    if (!mp) {
      ctx.setState(
        produce(ctx.getState(), draft => {
          draft.users[action.payload.channelName] = action.payload.users;
        })
      );
    }
  }

  @Action(Logout)
  async logout(ctx: StateContext<ChannelStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.channels = [];
        draft.users = {};
        draft.currentChannel = '';
        draft.multiplayer = false;
      })
    );
  }
}
