import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChannelState } from '../../store/states/channel.state';
import { MessageState } from '../../store/states/message.state';
import { AuthState } from '../../store/states/auth.state';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Select(ChannelState.channels)
  channels$: Observable<string[]>;

  @Select(MessageState.currentChannelMessages)
  messages$: Observable<{ sender: string; message: string }[]>;

  @Select(AuthState.username)
  username$: Observable<string>;

  constructor(public store: Store) {}

  ngOnInit(): void {}
}
