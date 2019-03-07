import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { MenuItem } from 'primeng/api';

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
  currentChannel: string;

  @Output()
  setChannel: EventEmitter<string> = new EventEmitter();

  @Output()
  joinChannelClick: EventEmitter<string> = new EventEmitter();

  @Output()
  leaveChannel: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit(): void { }

  onSetChannel(channel: string) {
    this.setChannel.emit(channel);
  }

  onJoinChannelClick() {
    this.joinChannelClick.emit();
  }

  onLeaveChannel(event, channel: string) {
    event.stopPropagation();
    this.leaveChannel.emit(channel);
  }
}
