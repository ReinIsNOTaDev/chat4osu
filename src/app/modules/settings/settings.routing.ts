import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { GeneralComponent } from './pages/general/general.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { HotkeysComponent } from './pages/hotkeys/hotkeys.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    data: { animation: 'SettingsPage' },
    children: [{
      path: '',
      component: GeneralComponent
    }, {
      path: 'notifications',
      component: NotificationsComponent
    }, {
      path: 'hotkeys',
      component: HotkeysComponent
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {
}
