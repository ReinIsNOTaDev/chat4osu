import { LoginComponent } from './pages/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'chat',
    component: ChatComponent,
    data: { animation: 'ChatPage' }
  },
  {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
