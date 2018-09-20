import { Component, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChannelState } from '../../store/states/channel.state';
import { MessageState } from '../../store/states/message.state';
import { AuthState } from '../../store/states/auth.state';
import { SetChannel, JoinChannel } from '../../store/actions/channel.actions';
import { ConfirmationService } from 'primeng/api';
import { SendMessage } from '../../store/actions/message.actions';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Select(ChannelState.channels)
  channels$: Observable<string[]>;

  @Select(ChannelState.currentChannel)
  currentChannel$: Observable<string>;

  @Select(MessageState.currentChannelMessages)
  messages$: Observable<{ sender: string; message: string }[]>;

  @Select(AuthState.username)
  username$: Observable<string>;

  joinChannelVisible = false;
  joinChannelValue = '';

  @ViewChild('input') input;

  constructor(public store: Store) {}

  ngOnInit(): void {}

  onSetChannel(channelName: string) {
    this.store.dispatch(new SetChannel({ channelName }));
  }

  onJoinChannelClick() {
    this.joinChannelVisible = true;
  }

  joinChannel() {
    this.joinChannelVisible = false;

    this.store
      .dispatch([
        new JoinChannel({ channelName: this.joinChannelValue }),
        new SetChannel({ channelName: this.joinChannelValue })
      ])
      .subscribe(() => {
        this.joinChannelValue = '';
      });
  }

  onSendMessage(message: string) {
    this.store.dispatch(new SendMessage({ message, date: new Date() }));
  }

  focusInput() {
    this.input.nativeElement.focus();
  }
}
