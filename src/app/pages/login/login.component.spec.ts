import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { AuthState } from '../../store/states/auth.state';
import { IrcService } from '../../providers/irc.service';
import { Router } from '@angular/router';
import { StorageService } from '../../providers/storage.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let ircService: any;
  let router: any;
  let storageService: any;

  beforeEach(async(() => {
    ircService = jasmine.createSpyObj('IrcService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    storageService = jasmine.createSpyObj('StorageService', [
      'get',
      'set',
      'delete'
    ]);

    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [NgxsModule.forRoot([AuthState])],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: IrcService, useValue: ircService },
        { provide: Router, useValue: router },
        { provide: StorageService, useValue: storageService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
