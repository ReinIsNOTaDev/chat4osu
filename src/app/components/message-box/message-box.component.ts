import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import moment from 'moment';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  standalone: false,
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit, OnChanges {
  @Input()
  messages: { sender: string; message: string; date: Date; action?: boolean }[];

  @Input()
  currentChannel: string;

  @Input()
  myUsername: string;

  @Output()
  openProfile = new EventEmitter<string>();

  @ViewChild('scroll', { static: true })
  private virtualScroll: CdkVirtualScrollViewport;

  constructor() { }

  private previousMessagesLength = 0;

  ngOnInit(): void {
    // Scroll to bottom once messages loaded (for example when navigating from settings page)
    setTimeout(() => {
      if (!this.messages) {
        return;
      }

      this.scrollToBottom();
    }, 100);
  }

  ngOnChanges(): void {
    if (!this.messages) {
      return;
    }

    // If messages changed, scroll to bottom
    if (this.messages.length !== this.previousMessagesLength) {
      this.previousMessagesLength = this.messages.length;
      this.scrollToBottom();
    }
  }

  parseDate(date: Date): string {
    const tempDate = moment(date);
    return `${('0' + tempDate.hours()).slice(-2)}:${('0' + tempDate.minutes()).slice(-2)}:${('0' + tempDate.seconds()).slice(-2)}`;
  }

  scrollToBottom() {
    if (this.virtualScroll && this.messages) {
      setTimeout(() => {
        this.virtualScroll.scrollToIndex(this.messages.length - 1, 'smooth');
      }, 0);
    }
  }

  clickUser(username: string) {
    this.openProfile.emit(username);
  }

  includesCaseInsensitive(textToCheck: string, value: string) {
    return textToCheck.toUpperCase().includes(value.toUpperCase());
  }
}
