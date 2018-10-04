import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlBarComponent } from './control-bar.component';
import { NgxsModule } from '@ngxs/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ControlBarComponent', () => {
  let component: ControlBarComponent;
  let fixture: ComponentFixture<ControlBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ControlBarComponent],
      imports: [NgxsModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
