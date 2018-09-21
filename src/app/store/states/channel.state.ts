import { State, Action, StateContext, Selector } from '@ngxs/store';
import produce from 'immer';
import {
  JoinChannel,
  JoinChannelSuccess,
  JoinChannelFailed,
  SetChannel,
  JoinAndSetChannel
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
      })
    );
  }
}
