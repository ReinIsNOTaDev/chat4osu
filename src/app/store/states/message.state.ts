import {
  State,
  Action,
  StateContext,
  Selector,
  createSelector
} from '@ngxs/store';
import produce from 'immer';
import { ReceiveMessage } from '../actions/message.actions';
import { JoinChannelSuccess } from '../actions/channel.actions';
import { ChannelState, ChannelStateModel } from './channel.state';

export interface MessageStateModel {
  messages: {
    [channelName: string]: { sender: string; message: string }[];
  };
}

@State<MessageStateModel>({
  name: 'message',
  defaults: {
    messages: {}
  }
})
export class MessageState {
  @Selector([ChannelState])
  static currentChannelMessages(
    state: MessageStateModel,
    channelState: ChannelStateModel
  ) {
    return state.messages[channelState.currentChannel];
  }

  @Action(ReceiveMessage)
  receiveMessage(ctx: StateContext<MessageStateModel>, action: ReceiveMessage) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        // Create the channel array if it doesn't exist yet
        if (!draft.messages[action.payload.channelName]) {
          draft.messages[action.payload.channelName] = [];
        }
        draft.messages[action.payload.channelName].push({
          message: action.payload.message,
          sender: action.payload.sender
        });
      })
    );
  }

  @Action(JoinChannelSuccess)
  createChannel(
    ctx: StateContext<MessageStateModel>,
    action: JoinChannelSuccess
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.messages[action.payload.channelName] = [];
      })
    );
  }
}
