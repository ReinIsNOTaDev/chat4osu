import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent implements OnInit {
  @Input()
  channels: string[];

  @Output()
  setChannel: EventEmitter<string> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onSetChannel(channel: string) {
    this.setChannel.emit(channel);
  }
}
