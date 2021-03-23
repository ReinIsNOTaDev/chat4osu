import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings.routing';
import { GeneralComponent } from './pages/general/general.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { MaterialModule } from '../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotkeysComponent } from './pages/hotkeys/hotkeys.component';
import { CreateHotkeyComponent } from './pages/hotkeys/create-hotkey/create-hotkey.component';

@NgModule({
  declarations: [
    SettingsComponent,
    GeneralComponent,
    NotificationsComponent,
    HotkeysComponent,
    CreateHotkeyComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule {
}
