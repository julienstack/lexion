import { Injectable, computed, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase'; // Adjust path if needed
import { Member } from '../models/member.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private supabase = inject(SupabaseService);
    private router = inject(Router);

    /** Linked Member Profile for the current logged-in user */
    currentMember = signal<Member | null>(null);

    /** Computed Role: 'public' if not logged in or not linked */
    userRole = computed(() => {
        const member = this.currentMember();
        return member?.app_role ?? 'public';
    });

    user = this.supabase.user;
    isLoggedIn = computed(() => !!this.user());

    isAdmin = computed(() => this.userRole() === 'admin');

    // Member or higher (Committee, Admin)
    isMember = computed(() => ['member', 'committee', 'admin'].includes(this.userRole()));

    constructor() {
        // React to Supabase User changes
        effect(() => {
            const user = this.supabase.user();
            if (user) {
                this.fetchMemberProfile(user.id);
            } else {
                this.currentMember.set(null);
            }
        }, { allowSignalWrites: true });
    }

    /** Fetch Member profile linked to Auth User ID */
    private async fetchMemberProfile(userId: string) {
        const { data, error } = await this.supabase.client
            .from('members')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(); // Use maybeSingle to avoid 406 Error if not found

        if (error) {
            console.error('Error fetching member profile:', error);
            return;
        }

        if (data) {
            this.currentMember.set(data as Member);
            console.log('Logged in as Member:', data.name, 'Role:', data.app_role);
        } else {
            console.warn('User logged in, but no linked Member profile found.');
            this.currentMember.set(null);
        }
    }

    // Auth Proxies
    async signIn(email: string, password: string) {
        return this.supabase.signInWithPassword(email, password);
    }

    async signOut() {
        await this.supabase.signOut();
        this.currentMember.set(null);
        this.router.navigate(['/login']);
    }
}
