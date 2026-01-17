import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../../shared/services/auth.service';
import { MembersService } from '../../../shared/services/members.service';
import { OnboardingService } from '../../../shared/services/onboarding.service';
import { Member } from '../../../shared/models/member.model';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        DatePickerModule,
        ToastModule,
        AvatarModule,
        DividerModule,
    ],
    providers: [MessageService],
    templateUrl: './profile.html',
    styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
    auth = inject(AuthService);
    membersService = inject(MembersService);
    messageService = inject(MessageService);
    onboardingService = inject(OnboardingService);
    router = inject(Router);

    saving = signal(false);
    birthdayDate: Date | null = null;

    // Form fields
    formData: Partial<Member> = {};

    ngOnInit(): void {
        const member = this.auth.currentMember();
        if (!member) {
            this.router.navigate(['/dashboard']);
            return;
        }

        // Copy member data to form
        this.formData = { ...member };

        // Parse birthday to Date object
        if (member.birthday) {
            this.birthdayDate = this.parseGermanDate(member.birthday);
        }
    }

    /**
     * Parse German date format (dd.mm.yyyy)
     */
    private parseGermanDate(dateStr: string): Date | null {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            let year = parseInt(parts[2], 10);
            if (year < 100) {
                year += 1900;
                if (year < 1950) year += 100;
            }
            return new Date(
                year,
                parseInt(parts[1], 10) - 1,
                parseInt(parts[0], 10)
            );
        }
        return null;
    }

    /**
     * Format Date to German format (dd.mm.yyyy)
     */
    private formatToGermanDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    async saveProfile(): Promise<void> {
        const member = this.auth.currentMember();
        if (!member?.id) return;

        this.saving.set(true);

        try {
            // Convert birthday
            if (this.birthdayDate) {
                this.formData.birthday = this.formatToGermanDate(
                    this.birthdayDate
                );
            }

            // Update member
            await this.membersService.updateMember(member.id, {
                street: this.formData.street,
                zip_code: this.formData.zip_code,
                city: this.formData.city,
                phone: this.formData.phone,
                birthday: this.formData.birthday,
            });

            // Refresh current member in auth service
            this.auth.currentMember.set({
                ...member,
                street: this.formData.street,
                zip_code: this.formData.zip_code,
                city: this.formData.city,
                phone: this.formData.phone,
                birthday: this.formData.birthday,
            });

            // Refresh onboarding progress
            await this.onboardingService.fetchProgress();

            this.messageService.add({
                severity: 'success',
                summary: 'Gespeichert',
                detail: 'Dein Profil wurde aktualisiert',
            });
        } catch (e: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Fehler',
                detail: e.message || 'Profil konnte nicht gespeichert werden',
            });
        }

        this.saving.set(false);
    }

    /**
     * Check if profile is complete
     */
    isProfileComplete(): boolean {
        return !!(
            this.formData.street &&
            this.formData.city &&
            this.formData.phone &&
            this.formData.birthday
        );
    }

    /**
     * Get initials from name
     */
    getInitials(): string {
        const name = this.auth.currentMember()?.name || '';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }
}
