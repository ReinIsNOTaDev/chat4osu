import { State, Action, StateContext, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { SendMessage } from '../actions/message.actions';
import { produce } from 'immer';
import { CycleNextHistory, CyclePreviousHistory } from '../actions/history.actions';
import { SetMessage } from '../actions/channel.actions';

export interface HistoryStateModel {
  history: string[];
  currentIndex: number;
}

@State<HistoryStateModel>({
  name: 'history',
  defaults: {
    history: [],
    currentIndex: -1
  }
})
@Injectable()
export class HistoryState {
  constructor(private store: Store) {}

  @Action(SendMessage)
  addToHistory(ctx: StateContext<HistoryStateModel>, action: SendMessage) {
    const newState = produce(ctx.getState(), draft => {
      draft.history.unshift(action.payload.message);
      draft.currentIndex = -1;
    });

    ctx.setState(newState);
  }

  @Action(CyclePreviousHistory)
  cyclePreviousHistory(ctx: StateContext<HistoryStateModel>) {
    const newState = produce(ctx.getState(), draft => {
      let nextIndex = draft.currentIndex + 1;
      if (nextIndex >= draft.history.length) {
        nextIndex = draft.history.length - 1;
      }

      draft.currentIndex = nextIndex;

      this.store.dispatch(new SetMessage(draft.history[nextIndex]));
    });

    ctx.setState(newState);
  }

  @Action(CycleNextHistory)
  cycleNextHistory(ctx: StateContext<HistoryStateModel>) {
    const newState = produce(ctx.getState(), draft => {
      let nextIndex = draft.currentIndex - 1;
      if (nextIndex <= -1) {
        nextIndex = -1;
      }

      draft.currentIndex = nextIndex;

      // Set message to empty if at the start of history
      if (nextIndex === -1) {
        this.store.dispatch(new SetMessage(''));
      } else {
        this.store.dispatch(new SetMessage(draft.history[nextIndex]));
      }

    });

    ctx.setState(newState);
  }
}
