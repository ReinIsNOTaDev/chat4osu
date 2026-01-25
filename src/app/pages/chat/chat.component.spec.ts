import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MaterialModule } from '../../material.module';
import { MockComponent } from 'ng-mocks';
import { ControlBarComponent } from '../../components/control-bar/control-bar.component';
import { TabBarComponent } from '../../components/tab-bar/tab-bar.component';
import { MessageBoxComponent } from '../../components/message-box/message-box.component';
import { InputBarComponent } from '../../components/input-bar/input-bar.component';
import { UserBarComponent } from '../../components/user-bar/user-bar.component';
import { MpUserBarComponent } from '../../components/mp-user-bar/mp-user-bar.component';

describe('ChatComponent', () => {
  let spectator: Spectator<ChatComponent>;
  const createComponent = createComponentFactory({
    component: ChatComponent,
    imports: [
      NgxsModule.forRoot(),
      MaterialModule
    ],
    declarations: [
      MockComponent(ControlBarComponent),
      MockComponent(TabBarComponent),
      MockComponent(MessageBoxComponent),
      MockComponent(InputBarComponent),
      MockComponent(UserBarComponent),
      MockComponent(MpUserBarComponent)
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

