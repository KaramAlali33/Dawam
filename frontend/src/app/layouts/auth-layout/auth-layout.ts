import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      background: var(--bg-color);
      background-image:
        radial-gradient(circle at 20% 80%, rgba(0, 140, 140, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(88, 200, 77, 0.06) 0%, transparent 50%);
    }
  `]
})
export class AuthLayoutComponent {}
