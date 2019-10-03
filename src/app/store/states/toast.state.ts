import { State, Action, StateContext, Selector } from '@ngxs/store';
import { MessageService, Message } from 'primeng/api';
import {AddToast, ClearToasts} from '../actions/toast.actions';
import produce from 'immer';

export interface ToastStateModel {
  lastToast: Message;
}

@State<ToastStateModel>({
  name: 'toast',
  defaults: {
    lastToast: undefined
  }
})
export class ToastState {
  @Selector()
  static lastToast(state: ToastStateModel) {
    return state.lastToast;
  }

  constructor(public messageService: MessageService) {}

  @Action(AddToast)
  addToast(ctx: StateContext<ToastStateModel>, action: AddToast) {
    this.messageService.add(action.payload);
    ctx.setState(
      produce(ctx.getState(), draft => {
        draft.lastToast = action.payload;
      })
    );
  }

  @Action(ClearToasts)
  clearToast(ctx: StateContext<ToastStateModel>, action: ClearToasts) {
    this.messageService.clear(action.payload);
  }
}
