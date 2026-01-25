import { Component, OnInit } from '@angular/core';
import { Hotkey, HotkeysService } from '../../../../../providers/hotkeys.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-create-hotkey',
  templateUrl: './create-hotkey.component.html',
  styleUrls: ['./create-hotkey.component.scss']
})
export class CreateHotkeyComponent implements OnInit {
  awaitingHotkey = true;
  hotkey: Hotkey;
  command = '';

  constructor(private hotkeysService: HotkeysService, public ref: MatDialogRef<CreateHotkeyComponent>) { }

  ngOnInit(): void {
    this.recordHotkey();
  }

  async recordHotkey() {
    this.awaitingHotkey = true;
    try {
      this.hotkey = await this.hotkeysService.recordHotkey();
      this.awaitingHotkey = false;
    } catch {
      this.ref.close();
    }
  }

  hotkeyStringToArray(hotkeyString: string) {
    return hotkeyString.split('+');
  }

  save() {
    this.ref.close({ hotkey: this.hotkey, command: this.command });
  }
}
