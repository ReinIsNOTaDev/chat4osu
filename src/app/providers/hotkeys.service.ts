import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import hotkeys from 'hotkeys-js';
import { ChannelState } from '../store/states/channel.state';
import {
  CycleToNextChannel,
  CycleToPreviousChannel,
  LeaveChannel,
  OpenChannelDialog
} from '../store/actions/channel.actions';
import { SendMessage } from '../store/actions/message.actions';

export class Hotkey {
  constructor(public key: string, public ctrl = false, public alt = false, public shift = false) { }

  toString() {
    let shortcutString = '';

    if (this.ctrl) {
      shortcutString += 'Ctrl+';
    }

    if (this.alt) {
      shortcutString += 'Alt+';
    }

    if (this.shift) {
      shortcutString += 'Shift+';
    }

    const formattedKey = this.key.length === 1 ? this.key.toUpperCase() : this.key;

    return shortcutString += formattedKey;
  }
}

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  constructor(private store: Store) { }

  changeScope(scope: string) {
    hotkeys.setScope(scope);
  }

  registerHotkeys() {
    // So that hotkeys work even if input box is focused
    hotkeys.filter = () => {
      return true;
    };

    // CTRL + W: Close tab
    hotkeys('Ctrl+w', 'app', () => {
      const currentChannel = this.store.selectSnapshot(ChannelState.currentChannel);

      if (currentChannel && currentChannel !== '') {
        this.store.dispatch(new LeaveChannel({ channelName: currentChannel }));
      }
    });

    // CTRL + N: Open new channel
    hotkeys('Ctrl+N', 'app', () => {
      this.store.dispatch(new OpenChannelDialog());
    });

    // CTRL + Tab or CTRL + Right: Cycle to next tab
    hotkeys('Ctrl+Tab,Ctrl+Right', 'app', () => {
      this.store.dispatch(new CycleToNextChannel());
    });

    // CTRL + Shift + Tab or CTRL + Left: Cycle to previous tab
    hotkeys('Ctrl+Shift+Tab,Ctrl+Left', 'app', () => {
      this.store.dispatch(new CycleToPreviousChannel());
    });

    hotkeys.setScope('app');
  }

  recordHotkey(): Promise<Hotkey> {
    hotkeys.setScope('record');

    return new Promise((resolve, reject) => {
      hotkeys('*', { keyup: true, keydown: false, scope: 'record' }, event => {
        event.preventDefault();
        hotkeys.setScope('settings');

        const hotkey = new Hotkey(event.key, event.ctrlKey, event.altKey, event.shiftKey);
        resolve(hotkey);
      });

      setTimeout(() => reject('No hotkey detected.'), 15000);
    });
  }

  addCustomHotkey(hotkeyString: string, command: string) {
    hotkeys(hotkeyString, 'app', () => {
      this.store.dispatch(new SendMessage({ message: command, date: new Date() }));
    });
  }

  reset() {
    hotkeys.unbind();
  }
}
