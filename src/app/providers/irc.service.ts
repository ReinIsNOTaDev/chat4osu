import { Injectable } from '@angular/core';
import * as irc from 'irc-upd';
import * as eventToPromise from 'event-to-promise';
import { Store } from '@ngxs/store';
import { LoginSuccess, LoginFailed } from '../store/actions/auth.actions';
import { ReceiveMessage } from '../store/actions/message.actions';
import {
  JoinChannelSuccess,
  JoinChannel,
  SetChannel
} from '../store/actions/channel.actions';
import { ElectronService } from './electron.service';

@Injectable()
export class IrcService {
  irc: typeof irc;
  client: typeof irc.Client;

  constructor(public store: Store, electron: ElectronService) {
    if (electron.isElectron()) {
      this.irc = window.require('irc-upd');
    }
  }

  async connect(username: string, password: string): Promise<any> {
    this.client = new this.irc.Client('irc.ppy.sh', username, {
      password: password,
      autoConnect: true,
      autoRejoin: false,
      retryCount: 0
    });

    this.client.addListener('error', error => {
      switch (error.command) {
        case 'err_passwdmismatch': {
          this.store.dispatch(new LoginFailed(error));
        }
      }
    });

    this.client.addListener('message#', (nick, to, text) => {
      this.store.dispatch(
        new ReceiveMessage({
          channelName: to,
          sender: nick,
          message: text,
          date: new Date()
        })
      );
    });

    this.client.addListener('pm', (nick, text) => {
      this.store.dispatch(
        new ReceiveMessage({
          channelName: nick,
          sender: nick,
          message: text,
          date: new Date()
        })
      );
    });

    this.client.connect(
      0,
      () =>
        this.store.dispatch([
          new LoginSuccess({ username, password }),
          new JoinChannel({ channelName: '#osu' }),
          new SetChannel({ channelName: '#osu' })
        ])
    );
  }

  joinChannel(channelName: string) {
    if (channelName.charAt(0) === '#') {
      this.client.join(channelName, () => {
        this.store.dispatch(new JoinChannelSuccess({ channelName }));
      });
    } else {
      this.store.dispatch(new JoinChannelSuccess({ channelName }));
    }
  }

  sendMessage(channelName: string, message: string) {
    this.client.say(channelName, message);
  }
}
