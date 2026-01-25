import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MpLobby } from '../../store/states/multiplayer.state';

@Component({
  standalone: false,
  selector: 'app-mp-user-bar',
  templateUrl: './mp-user-bar.component.html',
  styleUrls: ['./mp-user-bar.component.scss']
})
export class MpUserBarComponent implements OnInit {
  @Input()
  mpLobby: MpLobby;

  @Output()
  refresh = new EventEmitter();

  @Output()
  start = new EventEmitter();

  @Output()
  abort = new EventEmitter();

  constructor() { }

  ngOnInit(): void { }
}
