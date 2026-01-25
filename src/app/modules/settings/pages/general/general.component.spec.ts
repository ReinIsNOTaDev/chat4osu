import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { GeneralComponent } from './general.component';
import { MaterialModule } from '../../../../material.module';
import { FormsModule } from '@angular/forms';

describe('GeneralComponent', () => {
  let spectator: Spectator<GeneralComponent>;
  const createComponent = createComponentFactory({
    component: GeneralComponent,
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

