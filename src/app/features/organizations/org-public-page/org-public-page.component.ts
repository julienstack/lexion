import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';

// Services
import { SupabaseService } from '../../../shared/services/supabase';
import { Organization } from '../../../shared/services/organization.service';

interface PublicEvent {
    id: string;
    title: string;
    date: string;
    time_start?: string;
    time_end?: string;
    location?: string;
    description?: string;
}

interface PublicWikiArticle {
    id: string;
    title: string;
    content: string;
    category?: string;
}

interface PublicFeedItem {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

interface WorkingGroup {
    id: string;
    name: string;
    description?: string;
}

type LoginStep = 'email' | 'password' | 'invitation-sent' | 'not-found';

@Component({
    selector: 'app-org-public-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        CardModule,
        ProgressSpinnerModule,
        InputTextModule,
        PasswordModule,
        MessageModule,
        DialogModule,
    ],
    template: `
        <div class="min-h-screen bg-[var(--color-bg)]">
            
            <!-- Loading State -->
            @if (loading()) {
            <div class="min-h-screen flex items-center justify-center">
                <p-progressSpinner strokeWidth="4" />
            </div>
            }

            <!-- Not Found -->
            @if (!loading() && !org()) {
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <i class="pi pi-search text-6xl text-[var(--color-text-muted)] mb-4"></i>
                    <h1 class="text-2xl font-bold text-[var(--color-text)] mb-2">Organisation nicht gefunden</h1>
                    <p class="text-[var(--color-text-muted)] mb-6">Die gesuchte Organisation existiert nicht.</p>
                    <a routerLink="/" class="text-linke hover:underline">Zur Startseite</a>
                </div>
            </div>
            }

            <!-- Organization Page -->
            @if (!loading() && org()) {
            
            <!-- Header -->
            <header class="sticky top-0 z-50 backdrop-blur-lg bg-[var(--color-bg)]/90 border-b border-[var(--color-border)]">
                <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        @if (org()!.logo_url) {
                        <img [src]="org()!.logo_url" alt="" class="w-10 h-10 rounded-lg object-contain" />
                        } @else {
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                            [style.background]="primaryColor + '20'">
                            <i class="pi pi-building text-xl" [style.color]="primaryColor"></i>
                        </div>
                        }
                        <span class="font-bold text-lg text-[var(--color-text)]">{{ org()!.name }}</span>
                    </div>
                    <button (click)="showLoginDialog = true"
                        class="px-5 py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                        [style.background]="primaryColor">
                        <i class="pi pi-sign-in mr-2"></i>Anmelden
                    </button>
                </div>
            </header>

            <!-- Hero Section -->
            <section class="relative py-24 px-4 overflow-hidden">
                <div class="absolute inset-0 opacity-5"
                    [style.background]="'radial-gradient(ellipse at center, ' + primaryColor + ' 0%, transparent 70%)'">
                </div>
                <div class="relative max-w-4xl mx-auto text-center">
                    @if (org()!.logo_url) {
                    <img [src]="org()!.logo_url" alt="" class="w-28 h-28 mx-auto mb-8 rounded-2xl object-contain shadow-2xl" />
                    } @else {
                    <div class="w-28 h-28 mx-auto mb-8 rounded-2xl flex items-center justify-center shadow-2xl"
                        [style.background]="primaryColor + '15'">
                        <i class="pi pi-building text-6xl" [style.color]="primaryColor"></i>
                    </div>
                    }
                    <h1 class="text-5xl md:text-6xl font-extrabold text-[var(--color-text)] mb-6">
                        {{ org()!.name }}
                    </h1>
                    
                    <!-- Quick Stats -->
                    <div class="inline-flex justify-center gap-12 mt-8 p-6 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xl">
                        <div class="text-center">
                            <div class="text-3xl font-bold" [style.color]="primaryColor">{{ memberCount() }}</div>
                            <div class="text-sm text-[var(--color-text-muted)] font-medium uppercase tracking-wide">Mitglieder</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-teal">{{ upcomingEvents().length }}</div>
                            <div class="text-sm text-[var(--color-text-muted)] font-medium uppercase tracking-wide">Termine</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-amber-500">{{ workingGroups().length }}</div>
                            <div class="text-sm text-[var(--color-text-muted)] font-medium uppercase tracking-wide">AGs</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- About Section (if description exists) -->
            @if (org()!.description) {
            <section class="py-16 px-4 bg-[var(--color-surface)]">
                <div class="max-w-4xl mx-auto">
                    <h2 class="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center" [style.background]="primaryColor + '15'">
                            <i class="pi pi-info-circle" [style.color]="primaryColor"></i>
                        </div>
                        Über uns
                    </h2>
                    <p class="text-lg text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
                        {{ org()!.description }}
                    </p>
                </div>
            </section>
            }

            <!-- Upcoming Events -->
            @if (upcomingEvents().length > 0) {
            <section class="py-16 px-4">
                <div class="max-w-6xl mx-auto">
                    <h2 class="text-2xl font-bold text-[var(--color-text)] mb-8 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                            <i class="pi pi-calendar text-teal"></i>
                        </div>
                        Nächste Termine
                    </h2>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        @for (event of upcomingEvents(); track event.id) {
                        <div class="bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border)] p-6 hover:border-teal/30 transition-colors h-full flex flex-col">
                            <div class="flex gap-4 mb-4">
                                <div class="w-14 h-14 rounded-xl bg-teal/10 flex flex-col items-center justify-center flex-shrink-0">
                                    <span class="text-xs text-teal font-bold uppercase">{{ formatMonth(event.date) }}</span>
                                    <span class="text-xl font-bold text-teal">{{ formatDay(event.date) }}</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-bold text-[var(--color-text)] text-lg leading-tight mb-1">{{ event.title }}</h3>
                                    <div class="text-sm text-[var(--color-text-muted)] flex flex-wrap gap-2">
                                        @if (event.time_start) {
                                        <span class="flex items-center"><i class="pi pi-clock text-xs mr-1 opacity-70"></i>{{ event.time_start }}</span>
                                        }
                                        @if (event.location) {
                                        <span class="flex items-center"><i class="pi pi-map-marker text-xs mr-1 opacity-70"></i>{{ event.location }}</span>
                                        }
                                    </div>
                                </div>
                            </div>
                            @if (event.description) {
                            <p class="text-sm text-[var(--color-text-muted)] line-clamp-3 mt-auto">{{ event.description }}</p>
                            }
                        </div>
                        }
                    </div>
                </div>
            </section>
            }

            <!-- Working Groups -->
            @if (workingGroups().length > 0) {
            <section class="py-16 px-4 bg-[var(--color-surface)]">
                <div class="max-w-6xl mx-auto">
                    <h2 class="text-2xl font-bold text-[var(--color-text)] mb-8 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-violet/10 flex items-center justify-center">
                            <i class="pi pi-sitemap text-violet"></i>
                        </div>
                        Unsere Arbeitsgruppen
                    </h2>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        @for (wg of workingGroups(); track wg.id) {
                        <div class="bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border)] p-6 hover:border-violet/30 transition-colors h-full">
                            <h3 class="font-bold text-[var(--color-text)] text-lg mb-2">{{ wg.name }}</h3>
                            @if (wg.description) {
                            <p class="text-sm text-[var(--color-text-muted)] line-clamp-3">{{ wg.description }}</p>
                            }
                        </div>
                        }
                    </div>
                </div>
            </section>
            }

            <!-- News/Feed -->
            @if (feedItems().length > 0) {
            <section class="py-16 px-4">
                <div class="max-w-4xl mx-auto">
                    <h2 class="text-2xl font-bold text-[var(--color-text)] mb-8 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <i class="pi pi-megaphone text-cyan-500"></i>
                        </div>
                        Aktuelles
                    </h2>
                    <div class="space-y-6">
                        @for (item of feedItems(); track item.id) {
                        <div class="bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-shadow">
                            <div class="flex items-center gap-2 mb-3 text-xs text-[var(--color-text-muted)]">
                                <span class="px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">{{ formatDate(item.created_at) }}</span>
                            </div>
                            <h3 class="font-bold text-[var(--color-text)] text-xl mb-3">{{ item.title }}</h3>
                            <div class="text-[var(--color-text-muted)] prose prose-invert max-w-none text-sm leading-relaxed" [innerHTML]="item.content"></div>
                        </div>
                        }
                    </div>
                </div>
            </section>
            }

            <!-- Wiki Articles -->
            @if (wikiArticles().length > 0) {
            <section class="py-16 px-4 bg-[var(--color-surface)]">
                <div class="max-w-6xl mx-auto">
                    <h2 class="text-2xl font-bold text-[var(--color-text)] mb-8 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <i class="pi pi-book text-amber-500"></i>
                        </div>
                        Öffentliches Wissen
                    </h2>
                    <div class="grid md:grid-cols-2 gap-6">
                        @for (article of wikiArticles(); track article.id) {
                        <div class="bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border)] p-6 hover:border-amber-500/30 transition-colors cursor-pointer group">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <i class="pi pi-file text-amber-500 text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-[var(--color-text)] mb-2 group-hover:text-amber-500 transition-colors">{{ article.title }}</h3>
                                    @if (article.category) {
                                    <span class="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-medium">{{ article.category }}</span>
                                    }
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </section>
            }

            <!-- CTA Section -->
            <section class="py-24 px-4 relative overflow-hidden">
                <div class="absolute inset-0 opacity-10"
                    [style.background]="'radial-gradient(circle at center, ' + primaryColor + ' 0%, transparent 70%)'">
                </div>
                <div class="max-w-2xl mx-auto text-center relative z-10">
                    <h2 class="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-6">
                        Mach mit bei {{ org()!.name }}
                    </h2>
                    
                    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button (click)="showLoginDialog = true"
                            class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
                            [style.background]="primaryColor"
                            [style.box-shadow]="'0 10px 30px -10px ' + primaryColor + '50'">
                            <i class="pi pi-sign-in"></i>
                            Mitglieder Login
                        </button>
                    </div>
                    
                    <p class="mt-8 text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                        Der Zugang ist für registrierte Mitglieder. Wenn du Mitglied werden möchtest, kontaktiere uns bitte direkt.
                    </p>
                </div>
            </section>

            <!-- Footer -->
            <footer class="border-t border-[var(--color-border)] py-12 px-4 bg-[var(--color-surface-card)]">
                <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div class="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                        @if (org()!.logo_url) {
                        <img [src]="org()!.logo_url" alt="" class="w-8 h-8 rounded-lg object-contain" />
                        }
                        <span class="font-semibold text-[var(--color-text)]">{{ org()!.name }}</span>
                    </div>
                    <div class="text-sm text-[var(--color-text-muted)] flex gap-6">
                        <a href="#" class="hover:text-[var(--color-text)] transition-colors">Impressum</a>
                        <a href="#" class="hover:text-[var(--color-text)] transition-colors">Datenschutz</a>
                        <span class="opacity-50">|</span>
                        <span>Powered by <a routerLink="/" class="font-bold hover:text-linke transition-colors">Lexion</a></span>
                    </div>
                </div>
            </footer>

            }

            <!-- Login Dialog -->
            <p-dialog [(visible)]="showLoginDialog" [modal]="true" [closable]="true" [draggable]="false"
                [style]="{width: '100%', maxWidth: '420px'}" 
                [showHeader]="false" 
                [dismissableMask]="true"
                styleClass="login-dialog-wrapper"
                [contentStyle]="{'padding': '0', 'border-radius': '1.5rem', 'background': 'var(--color-surface-card)'}">
                
                <div class="relative p-8 bg-[var(--color-surface-card)] rounded-3xl border border-[var(--color-border)] shadow-2xl overflow-hidden">
                    
                    <!-- Background Glow -->
                     <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 opacity-10 blur-3xl"
                        [style.background]="'radial-gradient(circle at top, ' + primaryColor + ' 0%, transparent 70%)'">
                    </div>

                    <!-- Close Button -->
                    <button (click)="closeLoginDialog()" 
                        class="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text)] transition-all z-10">
                        <i class="pi pi-times"></i>
                    </button>

                    <!-- Header -->
                    <div class="text-center mb-8 relative z-10">
                        <div class="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform"
                            [style.background]="primaryColor + '15'">
                            <i class="pi pi-sign-in text-3xl" [style.color]="primaryColor"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-[var(--color-text)] mb-1">Anmelden</h2>
                        <p class="text-sm text-[var(--color-text-muted)]">bei {{ org()?.name }}</p>
                    </div>

                    <!-- Step: Email -->
                    @if (loginStep() === 'email') {
                    <div class="space-y-6 relative z-10">
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-[var(--color-text)] pl-1">E-Mail Adresse</label>
                            <div class="relative">
                                <i class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"></i>
                                <input pInputText [(ngModel)]="loginEmail" type="email" 
                                    class="w-full !pl-11 !py-3.5 !rounded-xl bg-[var(--color-bg)] border-[var(--color-border)] focus:border-[var(--color-primary)] transition-all hover:border-[var(--color-text-muted)]" 
                                    placeholder="name@beispiel.de" 
                                    (keyup.enter)="checkEmail()"
                                    [attr.disabled]="loginLoading() ? true : null" />
                            </div>
                        </div>
                        
                        @if (loginError()) {
                        <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fadein">
                            <i class="pi pi-exclamation-circle text-red-500 mt-0.5"></i>
                            <p class="text-sm text-red-500 leading-snug">{{ loginError() }}</p>
                        </div>
                        }

                        <button (click)="checkEmail()" [disabled]="!loginEmail || loginLoading()"
                            class="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg active:scale-[0.98]"
                            [style.background]="primaryColor">
                            @if (loginLoading()) {
                            <i class="pi pi-spin pi-spinner mr-2"></i>
                            }
                            Weiter
                        </button>
                    </div>
                    }

                    <!-- Step: Password -->
                    @if (loginStep() === 'password') {
                    <div class="space-y-6 relative z-10">
                        <div class="text-center p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                            <p class="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">Konto</p>
                            <p class="text-[var(--color-text)] font-medium truncate px-2">{{ loginEmail }}</p>
                        </div>
                        
                        <div class="space-y-2">
                            <div class="flex justify-between items-center px-1">
                                <label class="block text-sm font-medium text-[var(--color-text)]">Passwort</label>
                                <button (click)="requestPasswordReset()" class="text-xs hover:underline transition-colors font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                                    Vergessen?
                                </button>
                            </div>
                            <p-password [(ngModel)]="loginPassword" [feedback]="false" [toggleMask]="true"
                                styleClass="w-full" 
                                inputStyleClass="w-full !py-3.5 !rounded-xl bg-[var(--color-bg)] border-[var(--color-border)] focus:border-[var(--color-primary)]"
                                placeholder="••••••••"
                                (keyup.enter)="doLogin()" />
                        </div>

                        @if (loginError()) {
                        <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fadein">
                            <i class="pi pi-exclamation-circle text-red-500 mt-0.5"></i>
                            <p class="text-sm text-red-500 leading-snug">{{ loginError() }}</p>
                        </div>
                        }

                        <button (click)="doLogin()" [disabled]="!loginPassword || loginLoading()"
                            class="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 shadow-lg active:scale-[0.98]"
                            [style.background]="primaryColor">
                            @if (loginLoading()) {
                            <i class="pi pi-spin pi-spinner mr-2"></i>
                            }
                            Anmelden
                        </button>

                        <button (click)="loginStep.set('email')" class="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center gap-2 py-2 transition-colors">
                            <i class="pi pi-arrow-left text-xs"></i> Andere E-Mail verwenden
                        </button>
                    </div>
                    }

                    <!-- Step: Invitation Sent -->
                    @if (loginStep() === 'invitation-sent') {
                    <div class="text-center space-y-6 py-4 relative z-10 animate-fadein">
                        <div class="w-20 h-20 mx-auto rounded-full bg-teal/10 flex items-center justify-center ring-4 ring-teal/5">
                            <i class="pi pi-send text-3xl text-teal animate-pulse"></i>
                        </div>
                        <div class="space-y-2">
                            <h3 class="text-xl font-bold text-[var(--color-text)]">E-Mail unterwegs!</h3>
                            <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">
                                Wir haben dir einen Link an<br>
                                <strong class="text-[var(--color-text)]">{{ loginEmail }}</strong><br>
                                gesendet.
                            </p>
                        </div>
                        <div class="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-overlay)] p-4 rounded-xl border border-[var(--color-border)]">
                            Über den Link in der E-Mail kannst du dich direkt einloggen und dein Passwort festlegen.
                        </div>
                        <button (click)="closeLoginDialog()" 
                            class="w-full py-3.5 rounded-xl font-bold text-white hover:scale-[1.02] transition-all shadow-lg"
                            [style.background]="primaryColor">
                            Alles klar
                        </button>
                    </div>
                    }

                    <!-- Step: Not Found -->
                    @if (loginStep() === 'not-found') {
                    <div class="text-center space-y-6 py-4 relative z-10 animate-fadein">
                        <div class="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center ring-4 ring-amber-500/5">
                            <i class="pi pi-user-minus text-3xl text-amber-500"></i>
                        </div>
                        
                        <div class="space-y-2">
                            <h3 class="text-xl font-bold text-[var(--color-text)]">Unbekannte E-Mail</h3>
                            <p class="text-sm text-[var(--color-text-muted)] max-w-xs mx-auto">
                                Wir konnten kein Mitglied mit der Adresse <strong class="text-[var(--color-text)]">{{ loginEmail }}</strong> finden.
                            </p>
                        </div>

                        <button (click)="loginStep.set('email')"
                            class="w-full py-3.5 rounded-xl font-bold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-overlay)] transition-all">
                            Eingabe korrigieren
                        </button>

                        <p class="text-xs text-[var(--color-text-muted)]">
                            Wenn du Mitglied bist und dich nicht anmelden kannst, wende dich bitte an den Vorstand.
                        </p>
                    </div>
                    }
                </div>
            </p-dialog>

        </div>
    `,
})
export class OrgPublicPageComponent implements OnInit {
    private supabase = inject(SupabaseService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    slug = signal<string>('');
    org = signal<Organization | null>(null);
    loading = signal(true);

    memberCount = signal(0);
    upcomingEvents = signal<PublicEvent[]>([]);
    wikiArticles = signal<PublicWikiArticle[]>([]);
    feedItems = signal<PublicFeedItem[]>([]);
    workingGroups = signal<WorkingGroup[]>([]);

    // Login dialog
    showLoginDialog = false;
    loginStep = signal<LoginStep>('email');
    loginEmail = '';
    loginPassword = '';
    loginLoading = signal(false);
    loginError = signal<string | null>(null);
    private foundMember: any = null;

    currentYear = new Date().getFullYear();

    get primaryColor(): string {
        return this.org()?.primary_color || '#e3000f';
    }

    async ngOnInit(): Promise<void> {
        const slug = this.route.snapshot.paramMap.get('slug');
        if (!slug) {
            this.loading.set(false);
            return;
        }

        this.slug.set(slug);
        await this.loadOrganization(slug);
    }

    async loadOrganization(slug: string): Promise<void> {
        this.loading.set(true);

        const { data: org } = await this.supabase.client
            .from('organizations')
            .select('*')
            .eq('slug', slug)
            .single();

        if (!org) {
            this.loading.set(false);
            return;
        }

        this.org.set(org as Organization);

        // Load all public data in parallel
        await Promise.all([
            this.loadMemberCount(org.id),
            this.loadUpcomingEvents(org.id),
            this.loadWikiArticles(org.id),
            this.loadFeedItems(org.id),
            this.loadWorkingGroups(org.id),
        ]);

        this.loading.set(false);
    }

    private async loadMemberCount(orgId: string): Promise<void> {
        const { count } = await this.supabase.client
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId);

        this.memberCount.set(count ?? 0);
    }

    private async loadUpcomingEvents(orgId: string): Promise<void> {
        const today = new Date().toISOString().split('T')[0];

        const { data } = await this.supabase.client
            .from('events')
            .select('id, title, date, time_start, time_end, location, description')
            .eq('organization_id', orgId)
            .eq('visibility', 'public')
            .gte('date', today)
            .order('date', { ascending: true })
            .limit(6);

        this.upcomingEvents.set((data as PublicEvent[]) || []);
    }

    private async loadWikiArticles(orgId: string): Promise<void> {
        const { data } = await this.supabase.client
            .from('wiki_articles')
            .select('id, title, content, category')
            .eq('organization_id', orgId)
            .eq('visibility', 'public')
            .order('title', { ascending: true })
            .limit(6);

        this.wikiArticles.set((data as PublicWikiArticle[]) || []);
    }

    private async loadFeedItems(orgId: string): Promise<void> {
        const { data } = await this.supabase.client
            .from('feed_items')
            .select('id, title, content, created_at')
            .eq('organization_id', orgId)
            .eq('visibility', 'public')
            .in('status', ['approved', 'sent'])
            .order('created_at', { ascending: false })
            .limit(3);

        this.feedItems.set((data as PublicFeedItem[]) || []);
    }

    private async loadWorkingGroups(orgId: string): Promise<void> {
        const { data } = await this.supabase.client
            .from('working_groups')
            .select('id, name, description')
            .eq('organization_id', orgId)
            .order('name', { ascending: true });

        this.workingGroups.set((data as WorkingGroup[]) || []);
    }

    // Login Flow
    async checkEmail(): Promise<void> {
        if (!this.loginEmail) return;

        this.loginLoading.set(true);
        this.loginError.set(null);

        // Check if member exists in this organization
        const { data: member } = await this.supabase.client
            .from('members')
            .select('id, email, user_id, connection_token')
            .eq('organization_id', this.org()!.id)
            .eq('email', this.loginEmail.toLowerCase())
            .maybeSingle();

        this.loginLoading.set(false);

        if (!member) {
            // Member not found
            this.loginStep.set('not-found');
            return;
        }

        this.foundMember = member;

        if (member.user_id) {
            // Member has account - show password field
            this.loginStep.set('password');
        } else {
            // Member exists but no account - send invitation
            await this.sendInvitation(member);
        }
    }

    private async sendInvitation(member: any): Promise<void> {
        this.loginLoading.set(true);

        try {
            // Call edge function to send invitation
            const { error } = await this.supabase.client.functions.invoke('send-invitation', {
                body: { memberId: member.id }
            });

            if (error) throw error;

            this.loginStep.set('invitation-sent');
        } catch (e) {
            this.loginError.set('Einladung konnte nicht gesendet werden. Bitte kontaktiere den Vorstand.');
        }

        this.loginLoading.set(false);
    }

    async doLogin(): Promise<void> {
        if (!this.loginEmail || !this.loginPassword) return;

        this.loginLoading.set(true);
        this.loginError.set(null);

        const { error } = await this.supabase.client.auth.signInWithPassword({
            email: this.loginEmail,
            password: this.loginPassword,
        });

        this.loginLoading.set(false);

        if (error) {
            if (error.message.includes('Invalid login')) {
                this.loginError.set('Falsches Passwort.');
            } else {
                this.loginError.set(error.message);
            }
            return;
        }

        // Success - navigate to dashboard
        this.showLoginDialog = false;
        this.router.navigate(['/', this.slug(), 'dashboard']);
    }

    async requestPasswordReset(): Promise<void> {
        if (!this.loginEmail) return;

        this.loginLoading.set(true);

        const { error } = await this.supabase.client.auth.resetPasswordForEmail(this.loginEmail, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });

        this.loginLoading.set(false);

        if (!error) {
            this.loginStep.set('invitation-sent');
        }
    }

    closeLoginDialog(): void {
        this.showLoginDialog = false;
        this.loginStep.set('email');
        this.loginEmail = '';
        this.loginPassword = '';
        this.loginError.set(null);
    }

    formatMonth(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
    }

    formatDay(dateStr: string): string {
        const date = new Date(dateStr);
        return date.getDate().toString();
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
    }
}
