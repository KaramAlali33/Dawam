import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="coming-soon">
      <div class="coming-soon-content">
        <span class="coming-icon">🚧</span>
        <h2>{{ 'PAGES.COMING_SOON' | translate }}</h2>
        <p>{{ 'PAGES.UNDER_CONSTRUCTION' | translate }}</p>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }
    .coming-soon-content {
      text-align: center;
      padding: 3rem;
      background: var(--white);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }
    .coming-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }
    h2 {
      font-size: 1.5rem;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }
    p {
      color: var(--text-light);
      font-size: 0.9375rem;
    }
  `]
})
export class ComingSoonComponent {}
