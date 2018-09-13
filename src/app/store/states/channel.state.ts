import { State, Action, StateContext } from '@ngxs/store';
import produce from 'immer';
import {
  JoinChannel,
  JoinChannelSuccess,
  JoinChannelFailed
} from '../actions/channel.actions';
import { IrcService } from '../../providers/irc.service';

export interface ChannelStateModel {
  channels: string[];
}

@State<ChannelStateModel>({
  name: 'channel',
  defaults: {
    channels: []
  }
})
export class ChannelState {
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
}
