import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <!-- Subtle Background Gradient -->
      <div class="fixed inset-0 z-0 opacity-40">
         <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-linke/10 blur-[150px]"></div>
         <div class="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-linke-dark/10 blur-[150px]"></div>
      </div>

      <div class="relative z-10 w-full max-w-sm">
        <!-- Card -->
        <div class="bg-[var(--color-surface-raised)] backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl">
          
          <!-- Logo & Header -->
          <div class="text-center mb-6">
            <div class="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-linke to-linke-dark flex items-center justify-center shadow-lg shadow-linke/20">
              <i class="pi pi-users text-white text-2xl"></i>
            </div>
            <h1 class="text-2xl font-bold text-[var(--color-text)] mb-1">Lexion</h1>
            <p class="text-[var(--color-text-muted)] text-sm">Melde dich an, um fortzufahren</p>
          </div>

          @if (error()) {
            <p-message severity="error" [text]="error()" styleClass="w-full mb-4 block text-sm"></p-message>
          }

          <form (submit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">E-Mail</label>
              <input pInputText type="email" [(ngModel)]="email" name="email" 
                class="w-full !bg-[var(--color-surface)] !border-[var(--color-border)] focus:!border-linke !text-[var(--color-text)] !py-2.5 !text-sm !rounded-lg placeholder-[var(--color-text-muted)]" 
                placeholder="dein@email.com" required>
            </div>

            <div>
              <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Passwort</label>
              <p-password [(ngModel)]="password" name="password" [feedback]="false" [toggleMask]="true" 
                styleClass="w-full" 
                inputStyleClass="w-full !bg-[var(--color-surface)] !border-[var(--color-border)] focus:!border-linke !text-[var(--color-text)] !py-2.5 !text-sm !rounded-lg placeholder-[var(--color-text-muted)]" 
                placeholder="••••••••" required></p-password>
            </div>

            <p-button type="submit" label="Anmelden" [loading]="loading()" 
              styleClass="w-full !mt-5" severity="danger" [raised]="true"></p-button>
          </form>

          <div class="mt-5 pt-4 border-t border-[var(--color-border)] text-center">
            <p class="text-xs text-[var(--color-text-muted)] mb-3">Noch kein Zugang? Bitte wende dich an den Vorstand.</p>
            <a routerLink="/" class="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-linke transition-colors">
              <i class="pi pi-arrow-left text-[10px]"></i>
              Zurück zur Startseite
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async onLogin() {
    if (!this.email || !this.password) return;

    this.loading.set(true);
    this.error.set('');

    try {
      const { error } = await this.auth.signIn(this.email, this.password);
      if (error) {
        if (error.message.includes('Invalid login')) {
          this.error.set('E-Mail oder Passwort falsch.');
        } else {
          this.error.set(error.message);
        }
      } else {
        // Nach Login zur Organisations-Auswahl
        this.router.navigate(['/organisationen']);
      }
    } catch (e) {
      this.error.set('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      this.loading.set(false);
    }
  }
}
