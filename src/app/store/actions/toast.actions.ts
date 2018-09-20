import { Message } from 'primeng/api';

export class AddToast {
  static readonly type = '[Toast] AddToast';
  constructor(public payload: Message) {}
}
