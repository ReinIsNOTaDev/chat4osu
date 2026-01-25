import { Component, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChannelState } from '../../store/states/channel.state';
import { MessageState } from '../../store/states/message.state';
import { AuthState } from '../../store/states/auth.state';
import {
  SetChannel,
  LeaveChannel, RearrangeChannel, OpenChannelDialog
} from '../../store/actions/channel.actions';
import { SendMessage } from '../../store/actions/message.actions';
import { Logout } from '../../store/actions/auth.actions';
import { ToggleUsersPanel } from '../../store/actions/settings.actions';
import { SettingsState } from '../../store/states/settings.state';
import { MultiplayerState, MpLobby } from '../../store/states/multiplayer.state';
import { Navigate } from '@ngxs/router-plugin';
import { OpenExternalUrl } from '../../store/actions/electron.actions';

@Component({
  standalone: false,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Select(ChannelState.channels)
  channels$: Observable<string[]>;

  @Select(ChannelState.unreadChannels)
  unreadChannels$: Observable<string[]>;

  @Select(ChannelState.currentChannel)
  currentChannel$: Observable<string>;

  @Select(MessageState.currentChannelMessages)
  messages$: Observable<{ sender: string; message: string; date: Date; action?: boolean }[]>;

  @Select(AuthState.username)
  username$: Observable<string>;

  @Select(ChannelState.multiplayer)
  multiplayer$: Observable<boolean>;

  @Select(ChannelState.users)
  users$: Observable<string[]>;

  @Select(SettingsState.usersVisible)
  usersVisible$: Observable<boolean>;

  @Select(MultiplayerState.lobby)
  lobby$: Observable<MpLobby>;

  @ViewChild('input', { static: true })
  input;

  constructor(public store: Store) { }

  ngOnInit(): void { }

  onSetChannel(channelName: string) {
    this.store.dispatch(new SetChannel({ channelName }));
  }

  onJoinChannelClick() {
    this.store.dispatch(new OpenChannelDialog());
  }

  onSendMessage(message: string) {
    this.store.dispatch(new SendMessage({ message, date: new Date() }));
  }

  onLeaveChannel(channelName: string) {
    this.store.dispatch(new LeaveChannel({ channelName }));
  }

  onLogout() {
    this.store.dispatch(new Logout());
  }

  onUsers() {
    this.store.dispatch(new ToggleUsersPanel());
  }

  onSettings() {
    this.store.dispatch(new Navigate(['/settings']));
  }

  onOpenProfile(username: string) {
    this.store.dispatch(new OpenExternalUrl(`https://osu.ppy.sh/u/${username}`));
  }

  onRefresh() {
    this.store.dispatch(new SendMessage({ message: '!mp settings', date: new Date() }));
  }

  onStart() {
    this.store.dispatch(new SendMessage({ message: '!mp start 10', date: new Date() }));
  }

  onAbort() {
    this.store.dispatch(new SendMessage({ message: '!mp abort', date: new Date() }));
  }

  onRearrangeChannel(previousIndex: number, currentIndex: number) {
    this.store.dispatch(new RearrangeChannel({ previousIndex, currentIndex }));
  }
}
