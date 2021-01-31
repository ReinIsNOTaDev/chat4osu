import { State, Action, StateContext, Selector } from '@ngxs/store';
import { AddToast, ClearToasts } from '../actions/toast.actions';
import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

export interface ToastStateModel {
  lastToast: MatSnackBarRef<any>;
}

@State<ToastStateModel>({
  name: 'toast',
  defaults: {
    lastToast: undefined
  }
})
@Injectable()
export class ToastState {
  @Selector()
  static lastToast(state: ToastStateModel) {
    return state.lastToast;
  }

  constructor(private snackBar: MatSnackBar, private ngZone: NgZone) {}

  @Action(AddToast)
  addToast(ctx: StateContext<ToastStateModel>, action: AddToast) {
    this.ngZone.run(() => {
      setTimeout(() => {
        this.snackBar.open(action.payload.detail, 'OK', {
          duration: action.payload.sticky ? null : action.payload.life || 6000,
          horizontalPosition: 'right',
          panelClass: action.payload.severity
        });
      }, 0);
    });
  }

  @Action(ClearToasts)
  clearToast() {
    // this.snackBar.dismiss();
  }
}
