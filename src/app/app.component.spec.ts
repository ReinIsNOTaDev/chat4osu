import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { ElectronService } from './providers/electron.service';
import { NgxsModule } from '@ngxs/store';
import { StorageService } from './providers/storage.service';
import { ToastState } from './store/states/toast.state';
import { MessageService } from 'primeng/api';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let _storageService: any;
  let _messageService: any;

  beforeEach(async(() => {
    _storageService = {
      get: () => {},
      set: () => {},
      delete: () => {}
    };
    _messageService = { add: () => {} };

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        ElectronService,
        { provide: StorageService, useValue: _storageService },
        { provide: MessageService, useValue: _messageService }
      ],
      imports: [
        RouterTestingModule,
        NgxsModule.forRoot([ToastState]),
        TranslateModule.forRoot()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});

class TranslateServiceStub {
  setDefaultLang(lang: string): void {}
}
