import { Component, effect, inject, signal, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  currentYear = new Date().getFullYear();
  isMenuOpen = signal(false);

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  private auth = inject(AuthService);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);

  ngOnInit() {
    this.analytics.track('page_view', { page: 'landing' });
  }

  trackCTA(name: string) {
    this.analytics.track('cta_click', { button: name });
  }

  constructor() {
    // Redirect logged-in users to their organizations
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.router.navigate(['/organisationen']);
      }
    });
  }
}
