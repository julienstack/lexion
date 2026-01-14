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
    <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950">
      <!-- Background Effects -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[120px]"></div>
         <div class="absolute top-[40%] right-[0%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]"></div>
      </div>

      <div class="relative z-10 w-full max-w-md p-8">
        <div class="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-2">Willkommen</h1>
            <p class="text-gray-400">Melde dich an, um fortzufahren</p>
          </div>

          @if (error()) {
            <p-message severity="error" [text]="error()" styleClass="w-full mb-6 block"></p-message>
          }

          <form (submit)="onLogin()" class="space-y-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">E-Mail</label>
              <input pInputText type="email" [(ngModel)]="email" name="email" class="w-full !bg-gray-800/50 !border-gray-700 focus:!border-pink-500 !text-white" placeholder="dein@email.com" required>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">Passwort</label>
              <p-password [(ngModel)]="password" name="password" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full !bg-gray-800/50 !border-gray-700 focus:!border-pink-500 !text-white" placeholder="••••••••" required></p-password>
            </div>

            <p-button type="submit" label="Anmelden" [loading]="loading()" styleClass="w-full" severity="danger" [raised]="true"></p-button>
          </form>

          <div class="mt-6 text-center text-sm text-gray-500">
            <p>Noch kein Zugang? <br> Bitte wende dich an den Vorstand.</p>
          </div>
          
          <div class="mt-4 text-center">
             <a routerLink="/" class="text-sm text-gray-400 hover:text-pink-400 transition-colors">Zurück zur Startseite</a>
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
                this.router.navigate(['/dashboard']);
            }
        } catch (e) {
            this.error.set('Ein unerwarteter Fehler ist aufgetreten.');
        } finally {
            this.loading.set(false);
        }
    }
}
