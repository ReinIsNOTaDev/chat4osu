import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MaterialModule } from '../../../../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { HotkeysComponent } from './hotkeys.component';
import { of } from 'rxjs';

describe('HotkeysComponent', () => {
  let spectator: Spectator<HotkeysComponent>;
  const createComponent = createComponentFactory({
    component: HotkeysComponent,
    imports: [
      NgxsModule.forRoot(),
      MaterialModule,
      RouterTestingModule.withRoutes([])
    ],
    declarations: [],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();

    Object.defineProperty(spectator.component, 'hotkeys$', { writable: true });
    spectator.component.hotkeys$ = of([]);
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
