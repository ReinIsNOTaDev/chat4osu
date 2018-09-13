import { AngularElectronPage } from './app.po';
import { browser, element, by } from 'protractor';

describe('angular-electron App', () => {
  let page: AngularElectronPage;

  beforeEach(() => {
    page = new AngularElectronPage();
  });

  it('should load the login component by default', () => {
    page.navigateTo('/');
    expect(element(by.css('app-login .login-box'))).toBeTruthy();
  });
});
