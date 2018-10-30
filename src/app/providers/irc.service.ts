import { Injectable } from '@angular/core';
import * as irc from 'irc-upd';
import * as eventToPromise from 'event-to-promise';
import { Store } from '@ngxs/store';
import { LoginSuccess, LoginFailed } from '../store/actions/auth.actions';
import { ReceiveMessage } from '../store/actions/message.actions';
import {
  JoinChannelSuccess,
  JoinChannel,
  SetChannel,
  SetChannelUsers
} from '../store/actions/channel.actions';
import { ElectronService } from './electron.service';
import { MessageService } from 'primeng/api';
import { AddToast } from '../store/actions/toast.actions';

@Injectable()
export class IrcService {
  irc: typeof irc;
  client: typeof irc.Client;

  constructor(
    public store: Store,
    electron: ElectronService,
    private messageService: MessageService
  ) {
    if (electron.isElectron()) {
      this.irc = window.require('irc-upd');
    }
  }

  async connect(username: string, password: string): Promise<any> {
    this.client = new this.irc.Client('irc.ppy.sh', username, {
      password: password,
      autoConnect: false,
      retryCount: 0,
      autoRejoin: false,
      debug: false
    });

    this.client.addListener('error', error => {
      this.store.dispatch(
        new AddToast({
          key: 'toast',
          severity: 'error',
          summary: 'Error',
          detail: error.command
        })
      );
      console.error('error', error);
      switch (error.command) {
        case 'err_passwdmismatch': {
          this.store.dispatch(new LoginFailed(error));
        }
      }
    });

    this.client.addListener('netError', error => {
      this.store.dispatch(
        new AddToast({
          severity: 'error',
          summary: 'Network error',
          detail: error.command
        })
      );
      console.error('netError', error);
    });

    this.client.addListener('unhandled', message => {
      this.store.dispatch(
        new AddToast({
          severity: 'warn',
          summary: 'Unhandled message',
          detail:
            'An unhandled message was sent from the server. Check the console for more information.'
        })
      );
      console.log('unhandled', message);
    });

    this.client.addListener('raw', message => {
      const blacklisted = ['JOIN', 'PART', 'QUIT', '353'];
      if (blacklisted.indexOf(message.rawCommand) !== -1) {
        return;
      }

      console.log('raw', message.rawCommand);
      console.log('args', message.args);
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

    this.client.addListener('join', (channel, nick) => {
      if (nick === this.client.nick) {
        this.store.dispatch(
          new JoinChannelSuccess({
            channelName: channel
          })
        );
      }
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

    this.client.addListener('whois', info => {
      console.log('whois', info);
    });

    this.client.addListener('names', (channel, nicks) => {
      const users = Object.keys(nicks).sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) {
          return -1;
        }

        if (a.toLowerCase() > b.toLowerCase()) {
          return 1;
        }

        return 0;
      });
      this.store.dispatch(
        new SetChannelUsers({
          channelName: channel,
          users
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

  joinChannel(channelName: string, setToActive = false) {
    if (channelName.charAt(0) === '#') {
      this.client.join(channelName, () => {
        if (setToActive) {
          this.store.dispatch(new SetChannel({ channelName }));
        }
      });
    } else {
      this.store.dispatch(new JoinChannelSuccess({ channelName }));
      if (setToActive) {
        this.store.dispatch(new SetChannel({ channelName }));
      }
    }
  }

  partChannel(channelName: string) {
    if (channelName.charAt(0) === '#') {
      this.client.part(channelName);
    }
  }

  sendMessage(channelName: string, message: string) {
    const cleanMsg = message.trim();
    if (cleanMsg.charAt(0) === '/') {
      this.handleCommand(cleanMsg);
    } else {
      this.client.say(channelName, message);
    }
  }

  getUsers(channelName: string) {
    console.log(channelName);
    this.client.send('NAMES', channelName);
  }

  handleCommand(msg: string) {
    const msgParts = msg.split(' ');
    switch (msgParts[0]) {
      case '/join': {
        this.joinChannel(msgParts[1]);
        break;
      }

      case '/j': {
        this.joinChannel(msgParts[1]);
        break;
      }
    }
  }

  logout() {
    this.client.removeAllListeners();
    this.client.disconnect();
  }
}
