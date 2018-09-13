import { Injectable } from '@angular/core';
import * as irc from 'irc-upd';
import * as eventToPromise from 'event-to-promise';
import { Store } from '@ngxs/store';
import { LoginSuccess, LoginFailed } from '../store/actions/auth.actions';
import { ReceiveMessage } from '../store/actions/message.actions';
import {
  JoinChannelSuccess,
  JoinChannel
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
    this.irc = new this.irc.Client('irc.ppy.sh', username, {
      password: password,
      autoConnect: true,
      autoRejoin: false,
      retryCount: 0
    });

    this.irc.addListener('error', error => {
      switch (error.command) {
        case 'err_passwdmismatch': {
          this.store.dispatch(new LoginFailed(error));
        }
      }
    });

    this.irc.addListener('message#', (nick, to, text) =>
      this.store.dispatch(
        new ReceiveMessage({ channelName: to, sender: nick, message: text })
      )
    );

    this.irc.addListener('pm', (nick, text) =>
      this.store.dispatch(
        new ReceiveMessage({ channelName: nick, sender: nick, message: text })
      )
    );

    this.irc.connect(
      0,
      () => {
        this.store.dispatch(new LoginSuccess({ username }));
        this.store.dispatch(new JoinChannel({ channelName: '#osu' }));
      }
    );
  }

  joinChannel(channelName: string) {
    this.irc.join(channelName, () => {
      this.store.dispatch(new JoinChannelSuccess({ channelName }));
    });
  }
}
