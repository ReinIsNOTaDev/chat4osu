import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-input-bar',
  templateUrl: './input-bar.component.html',
  styleUrls: ['./input-bar.component.scss']
})
export class InputBarComponent implements OnInit {
  @Input()
  mpMode = false;

  @Output()
  send: EventEmitter<string> = new EventEmitter();

  message = '';
  mpCommands = [
    { label: 'MP', value: null },
    { label: 'settings', value: '!mp settings' },
    { label: 'invite', value: '!mp invite <username>' },
    { label: 'lock', value: '!mp lock' },
    { label: 'unlock', value: '!mp unlock' },
    { label: 'size', value: '!mp size <size>' },
    {
      label: 'set',
      value:
        '!mp set <teammode (0: Head2Head, 2: TeamVS)> [<scoremode (0: ScoreV1, 3: ScoreV2)>] [<size>]'
    },
    { label: 'move', value: '!mp move <username> <slot>' },
    { label: 'host', value: '!mp host <username>' },
    { label: 'clearhost', value: '!mp clearhost' },
    { label: 'start', value: '!mp start <time>' },
    { label: 'abort', value: '!mp abort' },
    { label: 'team', value: '!mp team <username> <color>' },
    { label: 'map', value: '!mp map <mapid>' },
    { label: 'mods', value: '!mp mods <mod>' },
    { label: 'timer', value: '!mp timer <time>' },
    { label: 'aborttimer', value: '!mp aborttimer' },
    { label: 'kick', value: '!mp kick <username>' },
    { label: 'password', value: '!mp password <password>' },
    { label: 'addref', value: '!mp addref <username>' },
    { label: 'removeref', value: '!mp removeref <username>' },
    { label: 'listrefs', value: '!mp listrefs' },
    { label: 'close', value: '!mp close' },
    { label: 'help', value: '!mp help' }
  ];
  selectedItem = null;

  constructor() {}

  ngOnInit(): void {}

  onSubmit() {
    if (this.message.trim() !== '') {
      this.send.emit(this.message);
      this.message = '';
    }
  }

  onMpChange(event) {
    this.message = event.value;
  }
}
