import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  currentYear = new Date().getFullYear();
  isMenuOpen = signal(false);

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Redirect logged-in users to their organizations
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.router.navigate(['/organisationen']);
      }
    });
  }
}
