import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHotkeyComponent } from './create-hotkey.component';

describe('CreateHotkeyComponent', () => {
  let component: CreateHotkeyComponent;
  let fixture: ComponentFixture<CreateHotkeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateHotkeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHotkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
