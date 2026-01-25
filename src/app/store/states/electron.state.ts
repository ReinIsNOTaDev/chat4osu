import { State, Action, StateContext, Selector, NgxsOnInit } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { OpenDevTools, OpenExternalUrl, CheckForUpdates } from '../actions/electron.actions';

export interface ElectronStateModel {
  isElectron: boolean;
  version: string;
}

@State<ElectronStateModel>({
  name: 'electron',
  defaults: {
    isElectron: false,
    version: '0.0.0'
  }
})
@Injectable()
export class ElectronState implements NgxsOnInit {
  @Selector()
  static isElectron(state: ElectronStateModel) {
    return state.isElectron;
  }

  @Selector()
  static version(state: ElectronStateModel) {
    return state.version;
  }

  constructor(private electron: ElectronService) { }

  ngxsOnInit(ctx?: StateContext<ElectronStateModel>): any {
    ctx.patchState({
      isElectron: this.electron.isElectron(),
      version: "1.0.0" // this.electron.remote.app.getVersion()
    });
  }

  @Action(OpenDevTools)
  openDevTools() {
    this.electron.openDevTools();
  }

  @Action(OpenExternalUrl)
  openExternalUrl(ctx: StateContext<ElectronStateModel>, action: OpenExternalUrl) {
    this.electron.openLinkInBrowser(action.payload);
  }

  @Action(CheckForUpdates)
  checkForUpdates() {
    this.electron.update();
  }
}
