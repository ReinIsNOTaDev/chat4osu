import { Pipe, PipeTransform } from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {AuthState} from '../store/states/auth.state';
import {ChannelState} from '../store/states/channel.state';
import {MpLobby, MultiplayerState} from '../store/states/multiplayer.state';

@Pipe({ name: 'role' })
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
      const lobby: MpLobby = this.store.selectSnapshot(MultiplayerState.lobby);
      for (const player of lobby.players) {
        if (player.username.toLowerCase().replace(' ', '_') === value.toLowerCase().replace(' ', '_')) {
          if (player.team) {
            return `team-${player.team}`;
          } else {
            return 'normal';
          }
        }
      }
      return 'self';
    }

    const self = this.store.selectSnapshot(AuthState.username);
    if (self.toLowerCase() === value.toLowerCase()) {
      return 'self';
    }

    if (value.toLowerCase() === 'hallowatcher') {
      return 'author';
    }

    if (value.toLowerCase() === 'peppy') {
      return 'peppy';
    }

    const operators = this.store.selectSnapshot(ChannelState.operators);
    if (operators.indexOf(value) !== -1) {
      return 'operator';
    }

    return 'normal';
  }
}
