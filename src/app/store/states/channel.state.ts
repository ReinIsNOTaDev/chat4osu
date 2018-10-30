import { State, Action, StateContext, Selector } from '@ngxs/store';
import produce from 'immer';
import {
  JoinChannel,
  JoinChannelSuccess,
  JoinChannelFailed,
  SetChannel,
  JoinAndSetChannel,
  LeaveChannel,
  SetChannelUsers
} from '../actions/channel.actions';
import { IrcService } from '../../providers/irc.service';
import { ReceiveMessage } from '../actions/message.actions';
import { Logout } from '../actions/auth.actions';

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

  constructor(public irc: IrcService) {}

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

  @Action(SetChannelUsers)
  async setChannelUsers(
    ctx: StateContext<ChannelStateModel>,
    action: SetChannelUsers
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.users[action.payload.channelName] = action.payload.users;
      })
    );
  }

  @Action(Logout)
  async logout(ctx: StateContext<ChannelStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.channels = [];
        draft.currentChannel = '';
        draft.multiplayer = false;
      })
    );
  }
}
