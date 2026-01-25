import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { OpenExternalUrl } from '../../store/actions/electron.actions';

@Component({
  standalone: false,
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit {
  changes = [];

  constructor(
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: { changes: string[] }
    ) { }

  ngOnInit(): void {
    this.changes = this.data.changes;
  }

  openForumLink(event) {
    event.preventDefault();
    this.store.dispatch(new OpenExternalUrl('https://osu.ppy.sh/community/forums/topics/879262'));
  }

  openDiscordInvite(event) {
    event.preventDefault();
    this.store.dispatch(new OpenExternalUrl('https://discord.gg/9pvBk7f'));
  }
}
