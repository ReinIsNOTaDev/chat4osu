import { Message } from 'primeng/api';

export class AddToast {
  static readonly type = '[Toast] AddToast';
  constructor(public payload: Message) {}
}

export class ClearToasts {
  static readonly type = '[Toast] ClearToasts';
  constructor(public payload: string) {}
}
