import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../shared/services/supabase';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-auth-callback',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        MessageModule,
        ProgressSpinnerModule
    ],
    template: `
        <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <!-- Processing State -->
                @if (processing) {
                    <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 text-center">
                        <p-progressSpinner strokeWidth="4" ariaLabel="Verarbeite..." />
                        <p class="text-gray-300 mt-4">{{ statusMessage }}</p>
                    </div>
                }

                <!-- Error State -->
                @if (error) {
                    <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <i class="pi pi-times text-red-500 text-3xl"></i>
                            </div>
                            <h1 class="text-2xl font-bold text-white mb-2">Fehler</h1>
                            <p class="text-gray-400">{{ error }}</p>
                        </div>
                        <p-button 
                            label="Zurück zum Login" 
                            icon="pi pi-arrow-left" 
                            styleClass="w-full"
                            (click)="goToLogin()">
                        </p-button>
                    </div>
                }

                <!-- Set Password State -->
                @if (showPasswordForm) {
                    <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <i class="pi pi-lock text-green-500 text-3xl"></i>
                            </div>
                            <h1 class="text-2xl font-bold text-white mb-2">Willkommen!</h1>
                            <p class="text-gray-400">Bitte lege ein Passwort für deinen Account fest.</p>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Neues Passwort</label>
                                <p-password 
                                    [(ngModel)]="password" 
                                    [toggleMask]="true"
                                    [feedback]="true"
                                    styleClass="w-full"
                                    inputStyleClass="w-full"
                                    placeholder="Mindestens 8 Zeichen">
                                </p-password>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Passwort bestätigen</label>
                                <p-password 
                                    [(ngModel)]="confirmPassword" 
                                    [toggleMask]="true"
                                    [feedback]="false"
                                    styleClass="w-full"
                                    inputStyleClass="w-full"
                                    placeholder="Passwort wiederholen">
                                </p-password>
                            </div>

                            @if (passwordError) {
                                <p-message severity="error" [text]="passwordError" styleClass="w-full"></p-message>
                            }

                            <p-button 
                                label="Passwort setzen" 
                                icon="pi pi-check" 
                                styleClass="w-full mt-4"
                                [loading]="saving"
                                (click)="setPassword()">
                            </p-button>
                        </div>
                    </div>
                }

                <!-- Success State -->
                @if (success) {
                    <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 text-center">
                        <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-check text-green-500 text-3xl"></i>
                        </div>
                        <h1 class="text-2xl font-bold text-white mb-2">Erfolgreich!</h1>
                        <p class="text-gray-400 mb-6">Dein Account wurde eingerichtet. Du wirst jetzt weitergeleitet...</p>
                        <p-progressSpinner strokeWidth="4" ariaLabel="Weiterleitung..." />
                    </div>
                }
            </div>
        </div>
    `,
})
export class AuthCallbackComponent implements OnInit {
    private supabase = inject(SupabaseService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    processing = true;
    showPasswordForm = false;
    success = false;
    error: string | null = null;
    statusMessage = 'Überprüfe Einladung...';

    password = '';
    confirmPassword = '';
    passwordError: string | null = null;
    saving = false;

    async ngOnInit() {
        // Check for hash fragment (Supabase returns tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Also check query params
        const errorCode = this.route.snapshot.queryParams['error'];
        const errorDescription = this.route.snapshot.queryParams['error_description'];

        if (errorCode) {
            this.processing = false;
            this.error = errorDescription || 'Ein Fehler ist aufgetreten';
            return;
        }

        if (accessToken && refreshToken) {
            try {
                this.statusMessage = 'Verifiziere Session...';

                // Set the session
                const { error } = await this.supabase.client.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });

                if (error) {
                    this.processing = false;
                    this.error = error.message;
                    return;
                }

                // Check if this is an invite/recovery (needs password)
                if (type === 'invite' || type === 'recovery' || type === 'signup') {
                    this.processing = false;
                    this.showPasswordForm = true;
                } else {
                    // Regular sign-in, redirect to dashboard
                    this.processing = false;
                    this.success = true;
                    setTimeout(() => {
                        this.router.navigate(['/dashboard']);
                    }, 2000);
                }
            } catch (e) {
                this.processing = false;
                this.error = (e as Error).message;
            }
        } else {
            this.processing = false;
            this.error = 'Kein gültiger Einladungslink. Bitte fordere einen neuen Link an.';
        }
    }

    async setPassword() {
        this.passwordError = null;

        if (this.password.length < 8) {
            this.passwordError = 'Das Passwort muss mindestens 8 Zeichen lang sein.';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.passwordError = 'Die Passwörter stimmen nicht überein.';
            return;
        }

        this.saving = true;

        try {
            const { error } = await this.supabase.client.auth.updateUser({
                password: this.password
            });

            if (error) {
                this.passwordError = error.message;
                this.saving = false;
                return;
            }

            this.showPasswordForm = false;
            this.success = true;

            setTimeout(() => {
                this.router.navigate(['/dashboard']);
            }, 2000);
        } catch (e) {
            this.passwordError = (e as Error).message;
            this.saving = false;
        }
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
