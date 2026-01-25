import {
  State,
  Action,
  StateContext,
  Selector,
  Store
} from '@ngxs/store';
import { produce } from 'immer';
import {
  ClearMessages,
  ReceiveMessage,
  SendMessage,
  SendMessageToChannel
} from '../actions/message.actions';
import { JoinChannelSuccess, LeaveChannel, ChangeChannelName } from '../actions/channel.actions';
import { ChannelState, ChannelStateModel } from './channel.state';
import { IrcService } from '../../providers/irc.service';
import { AuthState } from './auth.state';
import { Logout } from '../actions/auth.actions';
import { Injectable } from '@angular/core';
import { SettingsState } from './settings.state';

export interface MessageStateModel {
  messages: {
    [channelName: string]: {
      sender: string;
      message: string;
      date: Date;
      action?: boolean;
    }[];
  };
}

@State<MessageStateModel>({
  name: 'message',
  defaults: {
    messages: {}
  }
})
@Injectable()
export class MessageState {
  @Selector([ChannelState])
  static currentChannelMessages(
    state: MessageStateModel,
    channelState: ChannelStateModel
  ) {
    return state.messages[channelState.currentChannel];
  }

  constructor(private store: Store, private irc: IrcService) { }

  @Action(SendMessage)
  SendMessage(ctx: StateContext<MessageStateModel>, action: SendMessage) {
    const channelName = this.store.selectSnapshot(ChannelState.currentChannel);
    const username = this.store.selectSnapshot(AuthState.username);
    const message = action.payload.message.trim();
    this.irc.sendMessage(channelName, message);

    if (message.charAt(0) !== '/') {
      ctx.setState(
        produce(ctx.getState(), draft => {
          // Create the channel array if it doesn't exist yet
          if (!draft.messages[channelName]) {
            draft.messages[channelName] = [];
          }

          draft.messages[channelName].push({
            message: message,
            sender: username,
            date: action.payload.date
          });
        })
      );
    }
  }

  @Action(SendMessageToChannel)
  sendMessageToChannel(
    ctx: StateContext<MessageStateModel>,
    action: SendMessageToChannel
  ) {
    const channelName = action.payload.channel;
    const username = this.store.selectSnapshot(AuthState.username);
    const message = action.payload.message.trim();
    this.irc.sendMessage(channelName, message);

    if (message.charAt(0) !== '/') {
      ctx.setState(
        produce(ctx.getState(), draft => {
          // Create the channel array if it doesn't exist yet
          if (!draft.messages[channelName]) {
            draft.messages[channelName] = [];
          }

          draft.messages[channelName].push({
            message: message,
            sender: username,
            date: action.payload.date
          });
        })
      );
    }
  }

  @Action(ReceiveMessage)
  receiveMessage(ctx: StateContext<MessageStateModel>, action: ReceiveMessage) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        let channelKey = Object.keys(draft.messages).find(
          key => key.toLowerCase() === action.payload.channelName.toLowerCase()
        );

        const mp =
          action.payload.channelName
            .trim()
            .toLowerCase()
            .indexOf('#mp_') !== -1;

        // Create the channel array if it doesn't exist yet, for PMs
        if ((!channelKey || !draft.messages[channelKey])) {
          // If the channel to create is an actual channel, don't create it.
          // This is because it might be a message in an already closed channel
          if (action.payload.channelName.trim().charAt(0) === '#' && action.payload.channelName.trim() !== '#highlights' && !mp) {
            return;
          }

          draft.messages[action.payload.channelName] = [];
          channelKey = action.payload.channelName;
        }

        if (draft.messages[channelKey]) {
          draft.messages[channelKey].push({
            message: action.payload.message,
            sender: action.payload.sender,
            date: action.payload.date,
            action: action.payload.action
          });
        }
      })
    );
  }

  @Action(ReceiveMessage)
  handleHighlights(ctx: StateContext<MessageStateModel>, action: ReceiveMessage) {
    if (action.payload.action) {
      return;
    }

    const message = action.payload.message.toLowerCase();
    const myUsername = this.store.selectSnapshot(AuthState.username).toLowerCase();
    const keywordsSetting = this.store.selectSnapshot(SettingsState.notificationKeywords);

    let keywords;
    if (keywordsSetting && keywordsSetting.trim() !== '') {
      keywords = this.store.selectSnapshot(SettingsState.notificationKeywords).toLowerCase().split(',');
    }

    const highlightCriteria = {
      includesUsername: message.includes(myUsername.replace('_', ' '))
        || message.includes(myUsername.replace(' ', '_')),
      includesKeyword: keywords != null ? keywords.some(keyword => message.includes(keyword)) : false
    };

    if (highlightCriteria.includesUsername || highlightCriteria.includesKeyword) {
      this.store.dispatch(new ReceiveMessage({
        action: true,
        channelName: '#highlights',
        sender: 'Highlighted',
        message: `in ${action.payload.channelName} by ${action.payload.sender}: ${action.payload.message}`,
        date: action.payload.date
      }));
    }
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

  @Action(ChangeChannelName)
  changeChannelName(
    ctx: StateContext<MessageStateModel>,
    action: ChangeChannelName
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.messages[action.payload.newName] = [...draft.messages[action.payload.channelName]];
        delete draft.messages[action.payload.channelName];
      })
    );
  }

  @Action(ClearMessages)
  clearMessages(ctx: StateContext<MessageStateModel>, action: ClearMessages) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.messages[action.payload.channelName] = [];
      })
    );
  }

  @Action(LeaveChannel)
  leaveChannel(ctx: StateContext<MessageStateModel>, action: LeaveChannel) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        delete draft.messages[action.payload.channelName];
      })
    );
  }

  @Action(Logout)
  async logout(ctx: StateContext<MessageStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.messages = {};
      })
    );
  }
}
