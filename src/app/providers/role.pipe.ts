import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngxs/store';

interface MpPlayer {
  username: string;
  team?: string;
}

interface MpLobby {
  players: MpPlayer[];
}

@Pipe({ name: 'role', standalone: false })
export class RolePipe implements PipeTransform {
  constructor(private store: Store) { }

  transform(value: string, channel: string = ''): any {
    if (value.toLowerCase() === 'banchobot') {
      return 'bancho';
    }

    const mp =
      channel
        .trim()
        .toLowerCase()
        .indexOf('#mp_') !== -1;

    if (mp) {
      // Multiplayer logic
      const state: any = this.store.snapshot();
      const currentChannel = state.channel?.currentChannel;
      const lobby: MpLobby = state.multiplayer?.multiplayerLobbies?.[currentChannel];
      if (lobby?.players) {
        for (const player of lobby.players) {
          if (player.username.toLowerCase().replace(' ', '_') === value.toLowerCase().replace(' ', '_')) {
            if (player.team) {
              return `team-${player.team}`;
            } else {
              return 'normal';
            }
          }
        }
      }
      return 'self';
    }

    const state: any = this.store.snapshot();
    const self = state.auth?.username || '';
    if (self.toLowerCase() === value.toLowerCase()) {
      return 'self';
    }

    if (value.toLowerCase() === 'hallowatcher') {
      return 'author';
    }

    if (value.toLowerCase() === 'peppy') {
      return 'peppy';
    }

    const operators = state.channel?.operators || [];
    if (operators.indexOf(value) !== -1) {
      return 'operator';
    }

    return 'normal';
  }
}
