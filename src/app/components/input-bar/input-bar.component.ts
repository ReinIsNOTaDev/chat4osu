import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-input-bar',
  templateUrl: './input-bar.component.html',
  styleUrls: ['./input-bar.component.scss']
})
export class InputBarComponent implements OnInit {
  @Output()
  send: EventEmitter<string> = new EventEmitter();

  messageForm = this.formBuilder.group({
    message: ''
  });

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void { }

  onSubmit() {
    const message = this.messageForm.get('message').value;
    if (message.trim() !== '') {
      this.send.emit(message);
    }
  }
}
