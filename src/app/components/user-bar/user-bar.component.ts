import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-user-bar',
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss']
})
export class UserBarComponent implements OnInit {
  @Input()
  users: string[];

  constructor() {}

  ngOnInit(): void {}
}
