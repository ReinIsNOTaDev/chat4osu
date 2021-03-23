import { Injectable } from '@angular/core';
import * as irc from 'irc-upd';
import moment from 'moment';
import { Store } from '@ngxs/store';
import { LoginSuccess, LoginFailed } from '../store/actions/auth.actions';
import { ClearMessages, ReceiveMessage } from '../store/actions/message.actions';
import {
  JoinChannelSuccess,
  JoinChannel,
  SetChannel,
  SetChannelUsers,
  ChangeChannelName, SetOperators, LeaveChannel
} from '../store/actions/channel.actions';
import { ElectronService } from './electron.service';
import { MessageService } from 'primeng/api';
import {AddToast, ClearToasts} from '../store/actions/toast.actions';
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
import { StorageService } from './storage.service';
import { ChannelState } from '../store/states/channel.state';

@Injectable({ providedIn: 'root' })
export class IrcService {
  irc: typeof irc;
  client: typeof irc.Client;
  networkError = false;
  operators: string[] = [];

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
        this.store.dispatch(new RemoveUser({ channelName, user: matches[1].trim() }));
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
      // tslint:disable-next-line:max-line-length
      pattern: /^Slot (\d+)  ?(Not Ready|Ready) https:\/\/osu\.ppy\.sh\/u\/(\d+) (.+?)( \[(Host \/ )?(Team (Blue|Red) ?)?((\/ )?(.+?))?\])?$/,
      command: (channelName, matches) => {
        this.store.dispatch(
          new AddUser({
            channelName,
            slot: parseInt(matches[1], 10),
            user: matches[4].trim(),
            team: matches[8] ? matches[8].toLowerCase() : undefined
          })
        );
      }
    },
    matchClosed: {
      pattern: /^Closed the match$/,
      command: (channelName, matches) => {
        setTimeout(() => {
          const channels = this.storage.get('channels') || ['#osu'];
          this.storage.set('channels', channels.filter(e => e.toLowerCase() !== channelName.toLowerCase()));
          this.store.dispatch(new ChangeChannelName({ channelName, newName: '(closed) ' + channelName }));
        }, 500);
      }
    },
  };

  constructor(
    public store: Store,
    public electron: ElectronService,
    private messageService: MessageService,
    private storage: StorageService
  ) {
    if (electron.isElectron()) {
      this.irc = window.require('irc-upd');
    }
  }

  async connect(username: string, password: string): Promise<any> {
    this.client = new this.irc.Client('irc.ppy.sh', username, {
      password: password,
      autoConnect: false,
      retryCount: 50000,
      retryDelay: 5000,
      autoRejoin: false,
      debug: false
    });

    this.client.addListener('error', error => {
      // Blacklist weird IRC errors
      const blacklistedErrors = [
        'Cannot read property \'trim\' of undefined',
        'Cannot read property \'key\' of undefined'
      ];

      // Workaround for weird IRC errors
      if (blacklistedErrors.some(e => error.message?.toLowerCase().includes(e.toLowerCase()))) {
        return;
      }

      console.error('error', error);
      switch (error.command) {
        case 'err_passwdmismatch':
          this.store.dispatch(new LoginFailed(error));
          this.logout();
          this.store.dispatch(
            new AddToast({
              severity: 'error',
              detail: 'Login failed! Please try again. Note that your osu! credentials are NOT your IRC credentials.'
            })
          );
          break;

        case 'err_nosuchchannel':
          this.store.dispatch(
            new AddToast({
              severity: 'error',
              detail: 'Invalid channel!'
            })
          );
          break;

        default:
          this.store.dispatch(
            new AddToast({
              key: 'errors',
              severity: 'error',
              detail: error.command
            })
          );
      }
    });

    this.client.addListener('netError', error => {
      if (!this.networkError) {
        this.store.dispatch(
          new AddToast({
            key: 'errors',
            severity: 'error',
            detail: 'A network error has occurred! This could mean your internet connection is failing or Bancho is down. Attempting to reconnect...',
            sticky: true,
            closable: false
          })
        );
        this.networkError = true;
      }

      console.error('netError', error);
    });

    this.client.addListener('unhandled', message => {
      this.store.dispatch(
        new AddToast({
          key: 'errors',
          severity: 'warn',
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

      if (message.rawCommand === 'PING' || message.rawCommand === '001') {
        this.networkError = false;
        this.store.dispatch(new ClearToasts('errors'));
      }

      console.log('raw', message.rawCommand);
      console.log('args', message.args);
    });

    this.client.addListener('message#', (nick: string, to: string, text: string) => {
      this.networkError = false;
      const mp =
        to
          .trim()
          .toLowerCase()
          .indexOf('#mp_') !== -1;

      if (nick === 'BanchoBot' && mp) {
        // Fixes a bug where banchobot will send untrimmed messages
        const trimmedText = text.trim();
        this.handleMpMessage(to, trimmedText);
      }

      this.store.dispatch([
          new ReceiveMessage({
            channelName: to,
            sender: nick,
            message: text,
            date: new Date()
          }),
          new ClearToasts('errors')
        ]
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

      users.every(nick => {
        if (nick.charAt(0) !== '@') {
          return true;
        }

        const newNick = nick.slice(1);
        if (this.operators.indexOf(newNick) !== -1) {
          return true;
        }

        this.operators.push(newNick);
        return true;
      });
      this.store.dispatch(
        new SetOperators({
          operators: [...this.operators]
        })
      );
    });

    this.client.connect(0, () => {
      this.networkError = false;
      const channels = this.storage.get('channels') || ['#osu'];
      const channelJoin = channels.map(name => new JoinChannel({ channelName: name }));
      const initialEvents = [
        new LoginSuccess({ username, password }),
        new ClearToasts('errors'),
        ...channelJoin
      ];

      if (channels && channels.length > 0) {
        initialEvents.push(new SetChannel({ channelName: channels[0] }));
      }

      this.store.dispatch(initialEvents);
    });
  }

  joinChannel(channelName: string, setToActive = false) {
    // Save channel for client reopening
    const channels = this.storage.get('channels') || ['#osu'];
    if (channels.indexOf(channelName) === -1) {
      this.storage.set('channels', [...channels, channelName]);
    }

    if (channelName.charAt(0) === '#') {
      this.client.join(channelName, (() => {
        if (setToActive) {
          this.store.dispatch(new SetChannel({ channelName }));
        }
      }) as any);
    } else {
      this.store.dispatch(new JoinChannelSuccess({ channelName }));
      if (setToActive) {
        this.store.dispatch(new SetChannel({ channelName }));
      }
    }
  }

  partChannel(channelName: string) {
    // Remove channel for client reopening
    const channels = this.storage.get('channels') || ['#osu'];
    this.storage.set('channels', channels.filter(e => e.toLowerCase() !== channelName.toLowerCase()));

    if (channelName.charAt(0) === '#' && channelName.toLowerCase() !== '#highlights') {
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
      case '/debug': {
        if (msgParts[1] === 'action') {
          const message = msg.replace(`${msgParts[0]} ${msgParts[1]} ${msgParts[2]} `, '');
          this.store.dispatch(
            new ReceiveMessage({
              channelName: channel,
              sender: msgParts[2],
              message,
              date: new Date(),
              action: true
            })
          );
        } else if (msgParts[1] === 'message') {
          const message = msg.replace(`${msgParts[0]} ${msgParts[1]} ${msgParts[2]} `, '');
          const mp =
            channel
              .trim()
              .toLowerCase()
              .indexOf('#mp_') !== -1;

          if (msgParts[2] === 'BanchoBot' && mp) {
            // Fixes a bug where banchobot will send untrimmed messages
            const trimmedText = message.trim();
            this.handleMpMessage(channel, trimmedText);
          }

          this.store.dispatch(
            new ReceiveMessage({
              channelName: channel,
              sender: msgParts[2],
              message,
              date: new Date()
            })
          );
        } else if (msgParts[1] === 'channelmessage') {
          const message = msg.replace(`${msgParts[0]} ${msgParts[1]} ${msgParts[2]} ${msgParts[3]} `, '');
          this.store.dispatch(
            new ReceiveMessage({
              channelName: msgParts[2],
              sender: msgParts[3],
              message,
              date: new Date()
            })
          );
        } else {
          this.store.dispatch(
            new ReceiveMessage({
              channelName: channel,
              sender: 'Error',
              message: 'processing your command',
              date: new Date(),
              action: true
            })
          );
        }
        break;
      }

      case '/query':
      case '/chat':
      case '/msg':
      case '/j':
      case '/join': {
        this.store.dispatch(new JoinChannel({ channelName: msgParts[1] }));
        break;
      }

      case '/p':
      case '/part':
      case '/leave': {
        const currentChannel = this.store.selectSnapshot(ChannelState.currentChannel);
        this.store.dispatch(new LeaveChannel({ channelName: currentChannel }));
        break;
      }

      case '/clear': {
        const currentChannel = this.store.selectSnapshot(ChannelState.currentChannel);
        this.store.dispatch(new ClearMessages({ channelName: currentChannel }));
        break;
      }

      case '/me': {
        const message = msg.replace('/me ', '');
        this.sendAction(channel, message);
        break;
      }

      case '/help': {
        const currentChannel = this.store.selectSnapshot(ChannelState.currentChannel);
        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: 'Join channel',
          message: '/join {channel}, /j {channel}, /msg {channel}, /chat {channel}, /query {channel}',
          action: true
        }));

        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: 'Leave channel',
          message: '/leave, /part, /p',
          action: true
        }));

        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: 'Clear channel',
          message: '/clear',
          action: true
        }));

        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: 'Send action',
          message: '/me {msg}',
          action: true
        }));

        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: 'Save logs',
          message: '/savelog, /save, /log',
          action: true
        }));

        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: '',
          message: '-----',
          action: true
        }));

        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: 'MP set cheat sheet',
          message: '!mp set {teammode} [{scoremode} {size}]',
          action: true
        }));

        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: 'teammode',
          message: '0: Head To Head, 1: Tag Coop, 2: Team Vs, 3: Tag Team Vs',
          action: true
        }));

        this.store.dispatch(new ReceiveMessage({
          channelName: currentChannel,
          date: new Date(),
          sender: 'scoremode',
          message: '0: Score, 1: Accuracy, 2: Combo, 3: Score V2',
          action: true
        }));
        break;
      }

      case '/savelog':
      case '/save':
      case '/log': {
        const messages = this.store.selectSnapshot(state => state.message.messages)[channel];
        const lines = messages.map(e => {
          const tempDate = moment(e.date);

          if (e.action) {
            return `[${('0' + tempDate.hours()).slice(-2)}:${('0' + tempDate.minutes()).slice(-2)}:${('0' + tempDate.seconds()).slice(-2)}] ${e.sender} ${e.message}`;
          } else {
            return `[${('0' + tempDate.hours()).slice(-2)}:${('0' + tempDate.minutes()).slice(-2)}:${('0' + tempDate.seconds()).slice(-2)}] ${e.sender}: ${e.message}`;
          }
        });

        this.electron.openSaveDialog({
          title: 'Save chat log...',
          defaultPath: channel,
          filters: [
            { name: 'Text', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        }, path => {
          if (path == null) {
            return;
          }
          this.electron.saveFile(path, lines.join('\r\n'), () => {
            this.store.dispatch(
              new AddToast({
                summary: 'Success',
                detail: `Chat history has been saved at your desired location!`,
                key: 'toast',
                severity: 'success'
              })
            );
          });
        });
        break;
      }

      default:
        this.store.dispatch(
          new ReceiveMessage({
            channelName: channel,
            sender: 'Error',
            message: 'processing your command',
            date: new Date(),
            action: true
          })
        );
        break;
    }
  }

  logout() {
    this.client.removeAllListeners();
    this.client.disconnect();
  }
}
