import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MaterialModule } from '../../material.module';
import { SettingsComponent } from './settings.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SettingsComponent', () => {
  let spectator: Spectator<SettingsComponent>;
  const createComponent = createComponentFactory({
    component: SettingsComponent,
    imports: [
      NgxsModule.forRoot(),
      MaterialModule,
      RouterTestingModule.withRoutes([])
    ],
    declarations: []
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

