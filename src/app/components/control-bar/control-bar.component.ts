import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss']
})
export class ControlBarComponent implements OnInit {
  @Output()
  logout: EventEmitter<any> = new EventEmitter();

  @Output()
  users: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onLogoutClicked() {
    this.logout.emit();
  }

  onUsersClicked() {
    this.users.emit();
  }
}
