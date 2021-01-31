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
  GetChannelUsers,
  ChangeChannelName, RearrangeChannel, SetOperators, OpenChannelDialog, CycleToNextChannel, CycleToPreviousChannel
} from '../actions/channel.actions';
import { IrcService } from '../../providers/irc.service';
import { ReceiveMessage, SendMessage } from '../actions/message.actions';
import { Logout } from '../actions/auth.actions';
import {
  JoinMpLobby,
  LeaveMpLobby
} from '../actions/multiplayer.actions';
import { UpdateFormValue } from '@ngxs/form-plugin';
import { HideUsersPanel, PlayNotificationSound } from '../actions/settings.actions';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, NgZone } from '@angular/core';
import { JoinChannelComponent } from '../../components/join-channel/join-channel.component';
import { MatDialog } from '@angular/material/dialog';

export interface ChannelStateModel {
  channels: string[];
  unreadChannels: string[];
  operators: string[];
  users: { [channel: string]: string[] };
  writtenMessages: { [channel: string]: string };
  writtenMessageForm: any;
  currentChannel: string;
  multiplayer: boolean;
}

@State<ChannelStateModel>({
  name: 'channel',
  defaults: {
    channels: [],
    unreadChannels: [],
    users: {},
    operators: [],
    writtenMessages: {},
    currentChannel: '',
    multiplayer: false,
    writtenMessageForm: {
      model: {},
      dirty: false,
      status: '',
      errors: {}
    }
  }
})
@Injectable()
export class ChannelState {
  @Selector()
  static channels(state: ChannelStateModel) {
    return state.channels;
  }

  @Selector()
  static unreadChannels(state: ChannelStateModel) {
    return state.unreadChannels;
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

  @Selector()
  static operators(state: ChannelStateModel) {
    return state.operators;
  }

  @Selector()
  static writtenMessage(state: ChannelStateModel) {
    return state.writtenMessages[state.currentChannel];
  }

  constructor(private irc: IrcService, private store: Store, private dialog: MatDialog, private ngZone: NgZone) { }

  @Action(OpenChannelDialog)
  openChannelDialog(ctx: StateContext<ChannelStateModel>) {
    this.ngZone.run(() => {
      const dialogRef = this.dialog.open(JoinChannelComponent, {
        width: '300px',
        panelClass: 'no-padding'
      });

      dialogRef.afterClosed().subscribe(channelName => {
        if (!channelName) {
          return;
        }

        ctx.dispatch(new JoinAndSetChannel({ channelName }));
      });
    });
  }

  @Action(JoinChannel)
  joinChannel(ctx: StateContext<ChannelStateModel>, action: JoinChannel) {
    try {
      ctx.setState(
        produce(ctx.getState(), draft => {
          if (draft.channels.findIndex(e => e.toLowerCase() === action.payload.channelName.toLowerCase()) !== -1) {
            throw new Error('You are already in this channel!');
          }

          draft.channels.push(action.payload.channelName);
          draft.writtenMessages[action.payload.channelName] = '';
        })
      );

      this.irc.joinChannel(action.payload.channelName);
    } catch {
      ctx.dispatch(new SetChannel({ channelName: action.payload.channelName }));
    }
  }

  @Action(JoinAndSetChannel)
  joinAndSetChannel(ctx: StateContext<ChannelStateModel>, action: JoinChannel) {
    try {
      ctx.setState(
        produce(ctx.getState(), draft => {
          if (draft.channels.findIndex(e => e.toLowerCase() === action.payload.channelName.toLowerCase()) !== -1) {
            throw new Error('You are already in this channel!');
          }

          draft.channels.push(action.payload.channelName);
          draft.writtenMessages[action.payload.channelName] = '';
        })
      );

      this.irc.joinChannel(action.payload.channelName, true);
    } catch {
      ctx.dispatch(new SetChannel({ channelName: action.payload.channelName }));
    }
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

    if (action.payload.channelName.charAt(0) === '#') {
      this.store.dispatch(new ReceiveMessage({
        channelName: action.payload.channelName,
        date: new Date(),
        sender: 'Joined',
        message: action.payload.channelName,
        action: true
      }));
    }
  }

  @Action(JoinChannelFailed)
  joinChannelFailed(ctx: StateContext<ChannelStateModel>) {
    // Todo
  }

  @Action(UpdateFormValue)
  updateWrittenMessage(ctx: StateContext<ChannelStateModel>, action: UpdateFormValue) {
    const state = ctx.getState();

    if (action.payload.path !== 'channel.writtenMessageForm' || state.currentChannel === '') {
      return;
    }

    ctx.setState(
      produce(state, draft => {
        draft.writtenMessages[draft.currentChannel] = action.payload.value.message;
      })
    );
  }

  @Action(SendMessage)
  removeWrittenMessage(ctx: StateContext<ChannelStateModel>) {
    const state = ctx.getState();
    ctx.setState(
      produce(state, draft => {
        draft.writtenMessages[draft.currentChannel] = '';
        draft.writtenMessageForm.model.message = '';
      })
    );
  }

  @Action(ReceiveMessage)
  receiveMessage(ctx: StateContext<ChannelStateModel>, action: ReceiveMessage) {
    const state = ctx.getState();

    const channelKey = state.channels.find(
      key => key.toLowerCase() === action.payload.channelName.toLowerCase()
    );

    ctx.setState(
      produce(state, draft => {
        const messageChannel = action.payload.channelName.toLowerCase();
        if (!channelKey) {
          draft.channels.push(action.payload.channelName);
        }

        if (!document.hasFocus() && (messageChannel === '#highlights' || messageChannel.charAt(0) !== '#')) {
          ctx.dispatch(new PlayNotificationSound());
        } else if (
          state.currentChannel.toLowerCase() !== messageChannel
          && (messageChannel === '#highlights' || messageChannel.charAt(0) !== '#')
        ) {
          ctx.dispatch(new PlayNotificationSound());
        }

        if (state.currentChannel.toLowerCase() !== messageChannel && state.unreadChannels.indexOf(messageChannel) === -1) {
          draft.unreadChannels.push(action.payload.channelName);
        }
      })
    );
  }

  @Action(CycleToNextChannel)
  cycleToNextChannel(ctx: StateContext<ChannelStateModel>) {
    const state = ctx.getState();
    const currentChannelIndex = state.channels.findIndex(e => e.toLowerCase() === state.currentChannel);
    const channelsOpen = state.channels.length;

    if (channelsOpen <= 1) {
      return;
    }

    let nextIndex = currentChannelIndex + 1;
    if (nextIndex === channelsOpen) {
      nextIndex = 0;
    }

    ctx.dispatch(new SetChannel({ channelName: state.channels[nextIndex] }));
  }

  @Action(CycleToPreviousChannel)
  cycleToPreviousChannel(ctx: StateContext<ChannelStateModel>) {
    const state = ctx.getState();
    const currentChannelIndex = state.channels.findIndex(e => e.toLowerCase() === state.currentChannel);
    const channelsOpen = state.channels.length;

    if (channelsOpen <= 1) {
      return;
    }

    let nextIndex = currentChannelIndex - 1;
    if (nextIndex < 0) {
      nextIndex = channelsOpen - 1;
    }

    ctx.dispatch(new SetChannel({ channelName: state.channels[nextIndex] }));
  }

  @Action(SetChannel)
  setChannel(ctx: StateContext<ChannelStateModel>, action: SetChannel) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        const channel = draft.channels.find(e => e.toLowerCase() === action.payload.channelName.toLowerCase());
        draft.currentChannel = channel;

        // Change form
        draft.writtenMessageForm.model.message = draft.writtenMessages[channel];

        // Remove from unread channels
        const channelNameIndex = draft.unreadChannels.indexOf(channel);
        if (channelNameIndex !== -1) {
          draft.unreadChannels.splice(channelNameIndex, 1);
        }

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

  @Action(ChangeChannelName)
  changeChannelName(ctx: StateContext<ChannelStateModel>, action: ChangeChannelName) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        const index = draft.channels.indexOf(action.payload.channelName);

        if (index === -1) {
          return;
        }

        draft.channels[index] = action.payload.newName;
        draft.writtenMessages[action.payload.newName] = draft.writtenMessages[action.payload.channelName];
        delete draft.writtenMessages[action.payload.channelName];

        if (draft.currentChannel === action.payload.channelName) {
          draft.currentChannel = action.payload.newName;
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
        delete draft.writtenMessages[action.payload.channelName];

        // Remove from unread channels
        const channelNameIndex = draft.unreadChannels.indexOf(action.payload.channelName);
        if (channelNameIndex !== -1) {
          draft.unreadChannels.splice(channelNameIndex, 1);
        }

        if (draft.channels.length === 0) {
          draft.currentChannel = '';
          draft.writtenMessageForm.model.message = '';
          ctx.dispatch(new HideUsersPanel());
        } else if (
          draft.channels.indexOf(draft.currentChannel) === -1 &&
          draft.channels[index]
        ) {
          draft.currentChannel = draft.channels[index];
          draft.writtenMessageForm.model.message = draft.writtenMessages[draft.channels[index]];
        } else if (
          draft.channels.indexOf(draft.currentChannel) === -1 &&
          !draft.channels[index]
        ) {
          draft.currentChannel = draft.channels[index - 1];
          draft.writtenMessageForm.model.message = draft.writtenMessages[draft.channels[index - 1]];
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

  @Action(SetOperators)
  async setOperators(
    ctx: StateContext<ChannelStateModel>,
    action: SetOperators
  ) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.operators = action.payload.operators;
      })
    );
  }

  @Action(RearrangeChannel)
  rearrangeChannel(ctx: StateContext<ChannelStateModel>, action: RearrangeChannel) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        moveItemInArray(draft.channels, action.payload.previousIndex, action.payload.currentIndex);
      })
    );
  }

  @Action(Logout)
  async logout(ctx: StateContext<ChannelStateModel>) {
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.channels = [];
        draft.users = {};
        draft.currentChannel = '';
        draft.multiplayer = false;
        draft.writtenMessages = {};
        draft.writtenMessageForm = {
          model: {},
          dirty: false,
          status: '',
          errors: {}
        };
      })
    );
  }
}
