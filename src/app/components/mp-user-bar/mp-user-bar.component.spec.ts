import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MpUserBarComponent } from './mp-user-bar.component';
import { NgxsModule } from '@ngxs/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MpUserBarComponent', () => {
  let component: MpUserBarComponent;
  let fixture: ComponentFixture<MpUserBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MpUserBarComponent],
      imports: [NgxsModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MpUserBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
