import { Injectable } from '@angular/core';
import * as irc from 'irc-upd';
import * as eventToPromise from 'event-to-promise';
import { Store } from '@ngxs/store';
import { LoginSuccess, LoginFailed } from '../store/actions/auth.actions';
import {
  ReceiveMessage,
  SendMessageSuccess
} from '../store/actions/message.actions';
import {
  JoinChannelSuccess,
  JoinChannel,
  SetChannel,
  SetChannelUsers
} from '../store/actions/channel.actions';
import { ElectronService } from './electron.service';
import { MessageService } from 'primeng/api';
import { AddToast } from '../store/actions/toast.actions';
import {
  AddUser,
  RemoveUser,
  MoveUser,
  SetTeam,
  SetRoomName,
  SetTeamMode,
  SetWinCondition,
  SetMods,
  SetFreeMod,
  SetBeatmap
} from '../store/actions/multiplayer.actions';

@Injectable()
export class IrcService {
  irc: typeof irc;
  client: typeof irc.Client;

  mpRegexes = {
    roomName: {
      pattern: /^Room name: (.+), History: https:\/\/osu\.ppy\.sh\/mp\/(\d+)$/,
      command: (channelName, matches) => {
        this.store.dispatch(
          new SetRoomName({
            channel: channelName,
            name: matches[1]
          })
        );
      }
    },
    teamModeWinConditions: {
      pattern: /^Team mode: (\w+), Win condition: (\w+)$/,
      command: (channelName, matches) => {
        this.store.dispatch([
          new SetTeamMode({
            channel: channelName,
            mode: matches[1]
          }),
          new SetWinCondition({
            channel: channelName,
            condition: matches[2]
          })
        ]);
      }
    },
    activeMods: {
      pattern: /^Active mods: (.+)$/,
      command: (channel, matches) => {
        const mods: string[] = matches[1].split(', ');
        const freemod = mods.indexOf('Freemod');
        if (freemod !== -1) {
          mods.splice(freemod, 1);
          this.store.dispatch(new SetFreeMod({ channel, freemod: true }));
        } else {
          this.store.dispatch(new SetFreeMod({ channel, freemod: false }));
        }

        this.store.dispatch(
          new SetMods({
            channel,
            mods
          })
        );
      }
    },
    playerJoined: {
      pattern: /^(.+) joined in slot (\d+)( for team (red|blue))?\.$/,
      command: (channelName, matches) => {
        this.store.dispatch(
          new AddUser({
            channelName,
            user: matches[1].trim(),
            slot: parseInt(matches[2], 10),
            team: matches[4]
          })
        );
      }
    },
    playerChangedBeatmap: {
      pattern: /^Beatmap changed to: (.+) \(https:\/\/osu\.ppy\.sh\/b\/(\d+)\)$/,
      command: (channel, matches) => {
        this.store.dispatch(
          new SetBeatmap({
            channel,
            id: matches[2]
          })
        );
      }
    },
    refereeChangedBeatmap: {
      pattern: /^Changed beatmap to https:\/\/osu\.ppy\.sh\/b\/(\d+) (.+)$/,
      command: (channel, matches) => {
        this.store.dispatch(
          new SetBeatmap({
            channel,
            id: matches[1]
          })
        );
      }
    },
    beatmapFromSettings: {
      pattern: /^Beatmap: https:\/\/osu\.ppy\.sh\/b\/(\d+) (.+)$/,
      command: (channel, matches) => {
        this.store.dispatch(
          new SetBeatmap({
            channel,
            id: matches[1]
          })
        );
      }
    },
    set: {
      pattern: /^Changed match settings to ((\d+) slots, )?(HeadToHead|TagCoop|TeamVs|TagTeamVs)(, (Score|Accuracy|Combo|ScoreV2))?$/,
      command: (channel, matches) => {
        this.store.dispatch(
          new SetTeamMode({
            channel,
            mode: matches[3]
          })
        );

        if (matches[5]) {
          this.store.dispatch(
            new SetWinCondition({
              channel,
              condition: matches[5]
            })
          );
        }
      }
    },
    changeMods: {
      pattern: /^(Enabled (.+)|Disabled all mods), (disabled|enabled) FreeMod$/,
      command: (channel, matches) => {
        const mods = [];
        if (matches[2]) {
          mods.push(...matches[2].split(', '));
        }

        this.store.dispatch([
          new SetMods({
            channel,
            mods
          }),
          new SetFreeMod({ channel, freemod: matches[3] === 'enabled' })
        ]);
      }
    },
    playerLeft: {
      pattern: /^(.+) left the game\.$/,
      command: (channelName, matches) => {
        this.store.dispatch(
          new RemoveUser({ channelName, user: matches[1].trim() })
        );
      }
    },
    playerMoved: {
      pattern: /^(.+) moved to slot (\d+)$/,
      command: (channelName, matches) => {
        this.store.dispatch(
          new MoveUser({
            channelName,
            user: matches[1].trim(),
            slot: parseInt(matches[2], 10)
          })
        );
      }
    },
    playerChangedTeam: {
      pattern: /^(.+) changed to (Blue|Red)$/,
      command: (channelName, matches) => {
        this.store.dispatch(
          new SetTeam({
            channel: channelName,
            username: matches[1].trim(),
            team: matches[2].toLowerCase()
          })
        );
      }
    },
    playersConnected: {
      pattern: /^Slot (\d+)  ?(Not Ready|Ready) https:\/\/osu\.ppy\.sh\/u\/(\d+) (.+?)( \[(Host \/ )?Team (Blue|Red) ?(\/ (.+?))?\])?$/,
      command: (channelName, matches) => {
        this.store.dispatch(
          new AddUser({
            channelName,
            slot: parseInt(matches[1], 10),
            user: matches[4].trim(),
            team: matches[7] ? matches[7].toLowerCase() : undefined
          })
        );
      }
    }
  };

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
      const blacklisted = [
        'JOIN',
        'PART',
        'QUIT',
        '353',
        'PRIVMSG',
        'MODE',
        '332',
        '333',
        '375',
        '372',
        '376',
        '318',
        '312',
        '319',
        '366',
        '324',
        '329'
      ];
      if (blacklisted.indexOf(message.rawCommand) !== -1) {
        return;
      }

      console.log('raw', message.rawCommand);
      console.log('args', message.args);
    });

    this.client.addListener('message#', (nick, to, text) => {
      const mp =
        to
          .trim()
          .toLowerCase()
          .indexOf('#mp_') !== -1;

      if (nick === 'BanchoBot' && mp) {
        this.handleMpMessage(to, text);
      }

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

    this.client.addListener('action', (from, to, text) => {
      if (to === this.client.nick) {
        this.store.dispatch(
          new ReceiveMessage({
            channelName: from,
            sender: from,
            message: text,
            date: new Date(),
            action: true
          })
        );
      } else {
        this.store.dispatch(
          new ReceiveMessage({
            channelName: to,
            sender: from,
            message: text,
            date: new Date(),
            action: true
          })
        );
      }
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

  handleMpMessage(channel: string, text: string) {
    for (const regexName of Object.keys(this.mpRegexes)) {
      const regex = this.mpRegexes[regexName].pattern;
      const result = regex.exec(text);
      if (result) {
        this.mpRegexes[regexName].command(channel, result);
        return;
      }
    }
  }

  sendMessage(channelName: string, message: string) {
    const cleanMsg = message.trim();
    if (cleanMsg.charAt(0) === '/') {
      this.handleCommand(cleanMsg, channelName);
    } else {
      this.client.say(channelName, message);
    }
  }

  sendAction(channelName: string, action: string) {
    this.client.action(channelName, action);
    this.store.dispatch(
      new ReceiveMessage({
        channelName,
        sender: this.client.nick,
        message: action,
        date: new Date(),
        action: true
      })
    );
  }

  getUsers(channelName: string) {
    console.log(channelName);
    this.client.send('NAMES', channelName);
  }

  handleCommand(msg: string, channel?: string) {
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

      case '/me': {
        const message = msg.replace('/me ', '');
        this.sendAction(channel, message);
        break;
      }
    }
  }

  logout() {
    this.client.removeAllListeners();
    this.client.disconnect();
  }
}
