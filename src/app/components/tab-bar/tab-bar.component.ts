import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef
} from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabBarComponent implements OnInit {
  @Input()
  channels: string[];

  @Input()
  unreadChannels: string[];

  @Input()
  currentChannel: string;

  @Output()
  setChannel: EventEmitter<string> = new EventEmitter();

  @Output()
  joinChannelClick: EventEmitter<string> = new EventEmitter();

  @Output()
  leaveChannel: EventEmitter<string> = new EventEmitter();

  @ViewChild('tabContainer', { static: true })
  tabContainer: ElementRef;

  constructor() { }

  ngOnInit(): void { }

  onSetChannel(channel: string) {
    this.setChannel.emit(channel);
  }

  onMiddleClickChannel(event, channel: string) {
    if (event.which !== 2) { return; }
    event.stopPropagation();
    this.leaveChannel.emit(channel);
  }

  onJoinChannelClick() {
    this.joinChannelClick.emit();
  }

  onLeaveChannel(event, channel: string) {
    event.stopPropagation();
    this.leaveChannel.emit(channel);
  }

  onWheel(event) {
    this.tabContainer.nativeElement.scrollLeft =
      this.tabContainer.nativeElement.scrollLeft + event.deltaY / 5;
  }

  isUnread(channelName: string) {
    return this.unreadChannels ? this.unreadChannels.indexOf(channelName) !== -1 : false;
  }
}
