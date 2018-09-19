import {
  State,
  Action,
  StateContext,
  Selector,
  createSelector,
  Store
} from '@ngxs/store';
import produce from 'immer';
import { ReceiveMessage, SendMessage } from '../actions/message.actions';
import { JoinChannelSuccess } from '../actions/channel.actions';
import { ChannelState, ChannelStateModel } from './channel.state';
import { IrcService } from '../../providers/irc.service';
import { AuthState } from './auth.state';

export interface MessageStateModel {
  messages: {
    [channelName: string]: { sender: string; message: string; date: Date }[];
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

  constructor(private store: Store, private irc: IrcService) {}

  @Action(SendMessage)
  SendMessage(ctx: StateContext<MessageStateModel>, action: SendMessage) {
    const channelName = this.store.selectSnapshot(ChannelState.currentChannel);
    const username = this.store.selectSnapshot(AuthState.username);
    this.irc.sendMessage(channelName, action.payload.message);

    ctx.setState(
      produce(ctx.getState(), draft => {
        // Create the channel array if it doesn't exist yet
        if (!draft.messages[channelName]) {
          draft.messages[channelName] = [];
        }

        draft.messages[channelName].push({
          message: action.payload.message,
          sender: username,
          date: action.payload.date
        });
      })
    );
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
          sender: action.payload.sender,
          date: action.payload.date
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
        if (!draft.messages[action.payload.channelName]) {
          draft.messages[action.payload.channelName] = [];
        }
      })
    );
  }
}
