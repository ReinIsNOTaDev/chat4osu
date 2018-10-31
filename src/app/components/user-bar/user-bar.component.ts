import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-bar',
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss']
})
export class UserBarComponent implements OnInit {
  @Input()
  users: string[];

  viewPortItems: string[];

  constructor() {}

  ngOnInit(): void {}
}
