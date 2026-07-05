import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: [':host { display: block; }']
})
export class App {
  private translateService = inject(TranslateService);
  private document = inject(DOCUMENT);

  constructor() {
    const savedLang = localStorage.getItem('lang') || 'ar';
    this.translateService.addLangs(['ar', 'en']);
    this.translateService.setDefaultLang('ar');
    this.translateService.use(savedLang);
    this.document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = savedLang;
  }
}
