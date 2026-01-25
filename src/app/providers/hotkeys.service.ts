import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import hotkeys from 'hotkeys-js';
import {
  CycleToChannel, CycleToLastChannel,
  CycleToNextChannel,
  CycleToPreviousChannel,
  LeaveChannel,
  OpenChannelDialog
} from '../store/actions/channel.actions';
import { SendMessage } from '../store/actions/message.actions';
import { OpenDevTools } from '../store/actions/electron.actions';
import { CycleNextHistory, CyclePreviousHistory } from '../store/actions/history.actions';

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

    return shortcutString + formattedKey;
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

    // Ctrl + Shift + I: Open DevTools
    hotkeys('Ctrl+Shift+I', 'app', () => {
      this.store.dispatch(new OpenDevTools());
    });

    // Ctrl + W: Close tab
    hotkeys('Ctrl+W', 'app', () => {
      const currentChannel = this.store.selectSnapshot((state: any) => state.channel.currentChannel);

      if (currentChannel && currentChannel !== '') {
        this.store.dispatch(new LeaveChannel({ channelName: currentChannel }));
      }
    });

    // Ctrl + N: Open new channel
    hotkeys('Ctrl+N', 'app', () => {
      this.store.dispatch(new OpenChannelDialog());
    });

    // Ctrl + Tab or CTRL + Right: Cycle to next tab
    hotkeys('Ctrl+Tab,Ctrl+Right', 'app', () => {
      this.store.dispatch(new CycleToNextChannel());
    });

    // Ctrl + Shift + Tab or CTRL + Left: Cycle to previous tab
    hotkeys('Ctrl+Shift+Tab,Ctrl+Left', 'app', () => {
      this.store.dispatch(new CycleToPreviousChannel());
    });

    // Ctrl + 1 - 8: Cycle to tab x
    const tabNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const tabNumber of tabNumbers) {
      hotkeys(`Ctrl+${tabNumber}`, 'app', () => {
        this.store.dispatch(new CycleToChannel({ channelIndex: tabNumber - 1 }));
      });
    }

    // Ctrl + 9: Cycle to last tab
    hotkeys('Ctrl+9', 'app', () => {
      this.store.dispatch(new CycleToLastChannel());
    });

    // Up arrow: Cycle to previous sent message
    hotkeys('Up', 'app', event => {
      const element = event.target as HTMLInputElement;
      if (element.id === 'send-message') {
        event.preventDefault();
        this.store.dispatch(new CyclePreviousHistory());
      }
    });

    // Down arrow: Cycle to next sent message
    hotkeys('Down', 'app', event => {
      const element = event.target as HTMLInputElement;
      if (element.id === 'send-message') {
        event.preventDefault();
        this.store.dispatch(new CycleNextHistory());
      }
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
