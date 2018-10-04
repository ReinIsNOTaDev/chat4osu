import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-input-bar',
  templateUrl: './input-bar.component.html',
  styleUrls: ['./input-bar.component.scss']
})
export class InputBarComponent implements OnInit {
  @Output()
  send: EventEmitter<string> = new EventEmitter();

  message = '';

  constructor() {}

  ngOnInit(): void {}

  onSubmit() {
    if (this.message.trim() !== '') {
      this.send.emit(this.message);
      this.message = '';
    }
  }
}
