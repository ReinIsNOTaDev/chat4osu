import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { AppConfig } from './environments/environment';

if (AppConfig.production) {
  enableProdMode();
}

console.log('Starting Angular bootstrap...');
platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false
  })
  .then(() => console.log('Angular bootstrap successful!'))
  .catch(err => {
    console.error('Angular bootstrap failed!');
    console.error('Error:', err);
    console.error('Error message:', err?.message);
    console.error('Error stack:', err?.stack);
  });
