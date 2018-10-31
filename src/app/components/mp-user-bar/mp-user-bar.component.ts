import { Component, OnInit, Input } from '@angular/core';
import { MpLobby, MpUser } from '../../store/states/multiplayer.state';

@Component({
  selector: 'app-mp-user-bar',
  templateUrl: './mp-user-bar.component.html',
  styleUrls: ['./mp-user-bar.component.scss']
})
export class MpUserBarComponent implements OnInit {
  @Input()
  mpLobby: MpLobby;

  viewPortItems: MpUser[];

  constructor() {}

  ngOnInit(): void {}
}
