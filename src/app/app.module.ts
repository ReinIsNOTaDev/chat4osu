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

import { ElectronService } from './providers/electron.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { ChatComponent } from './pages/chat/chat.component';
import { AuthState } from './store/states/auth.state';
import { ChannelState } from './store/states/channel.state';
import { MessageState } from './store/states/message.state';
import { IrcService } from './providers/irc.service';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { InputBarComponent } from './components/input-bar/input-bar.component';
import { StorageService } from './providers/storage.service';
import { ToastState } from './store/states/toast.state';
import { SettingsState } from './store/states/settings.state';
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { ParsePipe } from './providers/parse.pipe';
import { UserBarComponent } from './components/user-bar/user-bar.component';
import { MultiplayerState } from './store/states/multiplayer.state';
import { MpUserBarComponent } from './components/mp-user-bar/mp-user-bar.component';
import { AppConfig } from '../environments/environment';
import { DragDropModule } from '@angular/cdk/drag-drop';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,

    // Components
    TabBarComponent,
    MessageBoxComponent,
    InputBarComponent,
    ControlBarComponent,
    UserBarComponent,
    MpUserBarComponent,

    // Pages
    LoginComponent,
    ChatComponent,

    // Pipes
    ParsePipe
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
    DragDropModule,
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
  providers: [MessageService, StorageService, ElectronService, IrcService],
  bootstrap: [AppComponent]
})
export class AppModule { }
