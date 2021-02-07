import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MaterialModule } from '../../../../../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateHotkeyComponent } from './create-hotkey.component';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

describe('CreateHotkeyComponent', () => {
  let spectator: Spectator<CreateHotkeyComponent>;
  const createComponent = createComponentFactory({
    component: CreateHotkeyComponent,
    imports: [
      FormsModule,
      NgxsModule.forRoot(),
      MaterialModule,
      RouterTestingModule.withRoutes([])
    ],
    declarations: [],
    providers: [{
      provide: MatDialogRef,
      useValue: { close: () => {} }
    }],
    detectChanges: false
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
