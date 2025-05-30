import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <div class="main-content">
        <app-header *ngIf="isLoggedIn"></app-header>
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      width: 100%;
    }
    
    .main-content {
      flex: 1;
      overflow-y: auto;
      background-color: var(--neutral-50);
    }
    
    main {
      padding: var(--space-5);
    }
  `],
  imports: [RouterOutlet, NgIf, HeaderComponent],
  standalone: true
})
export class AppComponent {
  isLoggedIn = false;

  constructor(private router: Router, private authService: AuthService) {
    this.authService.isAuthenticated().subscribe(authenticated => {
      this.isLoggedIn = authenticated;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }
}