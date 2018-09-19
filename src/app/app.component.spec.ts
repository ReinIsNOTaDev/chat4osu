import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { ElectronService } from './providers/electron.service';
import { NgxsModule } from '@ngxs/store';
import { StorageService } from './providers/storage.service';

describe('AppComponent', () => {
  let _storageService: any;

  beforeEach(async(() => {
    _storageService = jasmine.createSpyObj('StorageService', [
      'get',
      'set',
      'delete'
    ]);

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        ElectronService,
        { provide: StorageService, useValue: _storageService }
      ],
      imports: [
        RouterTestingModule,
        NgxsModule.forRoot([]),
        TranslateModule.forRoot()
      ]
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
