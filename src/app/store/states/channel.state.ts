import { State, Action, StateContext, Selector } from '@ngxs/store';
import produce from 'immer';
import {
  JoinChannel,
  JoinChannelSuccess,
  JoinChannelFailed,
  SetChannel
} from '../actions/channel.actions';
import { IrcService } from '../../providers/irc.service';
import { ReceiveMessage } from '../actions/message.actions';

export interface ChannelStateModel {
  channels: string[];
  currentChannel: string;
}

@State<ChannelStateModel>({
  name: 'channel',
  defaults: {
    channels: [],
    currentChannel: ''
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

  constructor(public irc: IrcService) {}

  @Action(JoinChannel)
  joinChannel(ctx: StateContext<ChannelStateModel>, action: JoinChannel) {
    this.irc.joinChannel(action.payload.channelName);
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
    if (state.channels.indexOf(action.payload.channelName) === -1) {
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
      })
    );
  }
}
