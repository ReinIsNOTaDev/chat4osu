import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MaterialModule } from '../../material.module';
import { JoinChannelComponent } from './join-channel.component';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

describe('JoinChannelComponent', () => {
  let spectator: Spectator<JoinChannelComponent>;
  const createComponent = createComponentFactory({
    component: JoinChannelComponent,
    imports: [
      FormsModule,
      NgxsModule.forRoot(),
      MaterialModule
    ],
    declarations: [],
    mocks: [MatDialogRef]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

