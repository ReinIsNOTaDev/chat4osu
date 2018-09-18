import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit {
  @Input()
  messages: { sender: string; message: string; date: Date }[];

  viewPortItems: { sender: string; message: string; date: Date }[];

  constructor() {}

  ngOnInit(): void {}

  parseDate(date: Date): string {
    const tempDate = moment(date);
    return tempDate.hours() + ':' + tempDate.minutes();
  }
}
