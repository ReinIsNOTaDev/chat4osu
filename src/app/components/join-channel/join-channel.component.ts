import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-join-channel',
  templateUrl: './join-channel.component.html',
  styleUrls: ['./join-channel.component.scss']
})
export class JoinChannelComponent implements OnInit {
  channel: string;

  constructor(public ref: MatDialogRef<JoinChannelComponent>) { }

  ngOnInit(): void { }

  joinChannel() {
    this.ref.close(this.channel.trim().replace(' ', '_'));
  }
}
