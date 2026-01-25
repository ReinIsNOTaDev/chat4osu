import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateHotkeyComponent } from './create-hotkey/create-hotkey.component';
import { Select, Store } from '@ngxs/store';
import { CreateHotkey, DeleteHotkey } from '../../../../store/actions/settings.actions';
import { SettingsState } from '../../../../store/states/settings.state';
import { Observable } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-hotkeys',
  templateUrl: './hotkeys.component.html',
  styleUrls: ['./hotkeys.component.scss']
})
export class HotkeysComponent implements OnInit {
  @Select(SettingsState.hotkeys)
  hotkeys$: Observable<{ hotkeyString: string; command: string; }[]>;

  constructor(private dialog: MatDialog, private store: Store) { }

  ngOnInit(): void { }

  openCreateHotkeyDialog() {
    const dialogRef = this.dialog.open(CreateHotkeyComponent, {
      width: '500px',
      panelClass: 'no-padding'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.store.dispatch(new CreateHotkey({ hotkey: result.hotkey, command: result.command }));
    });
  }

  hotkeyStringToArray(hotkeyString: string) {
    return hotkeyString.split('+');
  }

  private removeHotkey(hotkeyString: string) {
    this.store.dispatch(new DeleteHotkey(hotkeyString));
  }
}
