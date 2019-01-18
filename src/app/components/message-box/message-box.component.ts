import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import * as moment from 'moment';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit, OnChanges {
  @Input()
  messages: { sender: string; message: string; date: Date; action?: boolean }[];

  @Output()
  openProfile = new EventEmitter<string>();

  viewPortItems: {
    sender: string;
    message: string;
    date: Date;
    action?: boolean;
  }[];

  @ViewChild(VirtualScrollComponent)
  private virtualScroll: VirtualScrollComponent;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    // Dont run if the viewport hasn't been initialized
    if (!this.viewPortItems || !this.messages) {
      return;
    }

    // If we just changed channel, scroll to bottom
    if (this.messages.indexOf(this.viewPortItems[0]) === -1) {
      this.scrollToBottom();
    }

    // If we're at the bottom, scroll to bottom
    if (
      this.viewPortItems[this.viewPortItems.length - 1] === this.messages[this.messages.length - 2]
    ) {
      this.scrollToBottom();
    }
  }

  parseDate(date: Date): string {
    const tempDate = moment(date);
    return ('0' + tempDate.hours()).slice(-2) + ':' + ('0' + tempDate.minutes()).slice(-2);
  }

  scrollToBottom() {
    this.virtualScroll.scrollToIndex(this.messages.length - 1, true, 0, 0);
  }

  clickUser(username: string) {
    this.openProfile.emit(username);
  }
}
