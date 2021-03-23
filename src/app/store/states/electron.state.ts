import { State, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { OpenDevTools, OpenExternalUrl } from '../actions/electron.actions';

export interface ElectronStateModel {
  placeholder: any;
}

@State<ElectronStateModel>({
  name: 'electron',
  defaults: {
    placeholder: undefined
  }
})
@Injectable()
export class ElectronState {
  constructor(private electron: ElectronService) {}

  @Action(OpenDevTools)
  openDevTools() {
    this.electron.openDevTools();
  }

  @Action(OpenExternalUrl)
  openExternalUrl(ctx: StateContext<ElectronStateModel>, action: OpenExternalUrl) {
    this.electron.openLinkInBrowser(action.payload);
  }
}
