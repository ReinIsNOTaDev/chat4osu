import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss']
})
export class ControlBarComponent implements OnInit {
  @Input() showUsers: boolean;
  @Output() logout: EventEmitter<any> = new EventEmitter();
  @Output() users: EventEmitter<any> = new EventEmitter();
  @Output() settings: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onLogoutClicked() {
    this.logout.emit();
  }

  onUsersClicked() {
    this.users.emit();
  }

  onSettingsClicked() {
    this.settings.emit();
  }
}
