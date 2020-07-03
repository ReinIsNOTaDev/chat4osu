import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { ChatComponent } from './pages/chat/chat.component';
import { AuthState } from './store/states/auth.state';
import { ChannelState } from './store/states/channel.state';
import { MessageState } from './store/states/message.state';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { InputBarComponent } from './components/input-bar/input-bar.component';
import { ToastState } from './store/states/toast.state';
import { SettingsState } from './store/states/settings.state';
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { ParsePipe } from './providers/parse.pipe';
import { UserBarComponent } from './components/user-bar/user-bar.component';
import { MultiplayerState } from './store/states/multiplayer.state';
import { MpUserBarComponent } from './components/mp-user-bar/mp-user-bar.component';
import { AppConfig } from '../environments/environment';
import { RolePipe } from './providers/role.pipe';
import { MaterialModule } from './material.module';
import { JoinChannelComponent } from './components/join-channel/join-channel.component';
import { ChangelogComponent } from './components/changelog/changelog.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    TabBarComponent,
    MessageBoxComponent,
    InputBarComponent,
    ControlBarComponent,
    UserBarComponent,
    MpUserBarComponent,
    LoginComponent,
    ChatComponent,
    ParsePipe,
    RolePipe,
    JoinChannelComponent,
    ChangelogComponent
  ],
  imports: [
    NgxsModule.forRoot([
      SettingsState,
      AuthState,
      ChannelState,
      MessageState,
      ToastState,
      MultiplayerState
    ], { developmentMode: !AppConfig.production }),
    NgxsRouterPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({ disabled: AppConfig.production }),
    BrowserModule,
    BrowserAnimationsModule,
    VirtualScrollerModule,
    MaterialModule,
    FormsModule,
    ContextMenuModule,
    ReactiveFormsModule,
    NgxsFormPluginModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    DropdownModule,
    ProgressSpinnerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
