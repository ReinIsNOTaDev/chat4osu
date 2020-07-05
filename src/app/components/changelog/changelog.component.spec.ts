import { NgxsModule } from '@ngxs/store';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { ChangelogComponent } from './changelog.component';
import { MaterialModule } from '../../material.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ChangelogComponent', () => {
  let spectator: Spectator<ChangelogComponent>;
  const createComponent = createComponentFactory({
    component: ChangelogComponent,
    imports: [
      NgxsModule.forRoot(),
      MaterialModule
    ],
    declarations: [],
    providers: [{ provide: MAT_DIALOG_DATA, useValue: { changes: [] } }]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

