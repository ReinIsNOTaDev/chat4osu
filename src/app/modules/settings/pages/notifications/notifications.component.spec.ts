import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { NotificationsComponent } from './notifications.component';
import { MaterialModule } from '../../../../material.module';

describe('NotificationsComponent', () => {
  let spectator: Spectator<NotificationsComponent>;
  const createComponent = createComponentFactory({
    component: NotificationsComponent,
    imports: [
      NgxsModule.forRoot(),
      MaterialModule
    ],
    declarations: []
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

