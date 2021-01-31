import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { NotificationsComponent } from './notifications.component';
import { MaterialModule } from '../../../../material.module';
import { FormsModule } from '@angular/forms';

describe('NotificationsComponent', () => {
  let spectator: Spectator<NotificationsComponent>;
  const createComponent = createComponentFactory({
    component: NotificationsComponent,
    imports: [
      NgxsModule.forRoot(),
      FormsModule,
      MaterialModule
    ],
    declarations: []
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

