import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { OrganizationService } from './organization.service';

/**
 * Status of a guest organization invitation
 */
export type GuestInvitationStatus = 'pending' | 'accepted' | 'declined';

/**
 * Guest organization invitation for an event
 */
export interface EventGuestOrganization {
    id: string;
    event_id: string;
    host_organization_id: string;
    guest_organization_id?: string;
    guest_org_name?: string;
    guest_org_email?: string;
    guest_org_contact_name?: string;
    status: GuestInvitationStatus;
    invited_by?: string;
    invited_at: string;
    responded_at?: string;
    // Joined data
    guest_organization?: {
        id: string;
        name: string;
        slug: string;
        logo_url?: string;
    };
    host_organization?: {
        id: string;
        name: string;
        slug: string;
        logo_url?: string;
    };
    event?: {
        id: string;
        title: string;
        date: string;
    };
}

/**
 * DTO for creating a guest invitation
 */
export interface CreateGuestInvitationDto {
    event_id: string;
    guest_organization_id?: string;
    guest_org_name?: string;
    guest_org_email?: string;
    guest_org_contact_name?: string;
}

/**
 * Service for managing guest organization invitations to events.
 * Enables the "Viral Loop" - when orgs see how cleanly events are planned,
 * they want PulseDeck too!
 */
@Injectable({ providedIn: 'root' })
export class GuestOrganizationService {
    private supabase = inject(SupabaseService);
    private orgService = inject(OrganizationService);

    loading = signal(false);
    error = signal<string | null>(null);

    /**
     * Get all guest invitations for an event
     */
    async getEventGuests(eventId: string): Promise<EventGuestOrganization[]> {
        const { data, error } = await this.supabase.client
            .from('event_guest_organizations')
            .select(`
                *,
                guest_organization:guest_organization_id(id, name, slug, logo_url),
                host_organization:host_organization_id(id, name, slug, logo_url),
                event:event_id(id, title, date)
            `)
            .eq('event_id', eventId)
            .order('invited_at', { ascending: false });

        if (error) {
            console.error('Error loading event guests:', error);
            return [];
        }

        return (data || []) as EventGuestOrganization[];
    }

    /**
     * Get accepted guest organizations for an event (for public display)
     */
    async getAcceptedGuests(eventId: string): Promise<EventGuestOrganization[]> {
        const { data, error } = await this.supabase.client
            .from('event_guest_organizations')
            .select(`
                *,
                guest_organization:guest_organization_id(id, name, slug, logo_url)
            `)
            .eq('event_id', eventId)
            .eq('status', 'accepted');

        if (error) {
            console.error('Error loading accepted guests:', error);
            return [];
        }

        return (data || []) as EventGuestOrganization[];
    }

    /**
     * Get pending invitations for the current organization
     * (Events where this org has been invited as a guest)
     */
    async getPendingInvitations(): Promise<EventGuestOrganization[]> {
        const orgId = this.orgService.currentOrgId();
        if (!orgId) return [];

        const { data, error } = await this.supabase.client
            .from('event_guest_organizations')
            .select(`
                *,
                host_organization:host_organization_id(id, name, slug, logo_url),
                event:event_id(id, title, date, location, description)
            `)
            .eq('guest_organization_id', orgId)
            .eq('status', 'pending')
            .order('invited_at', { ascending: false });

        if (error) {
            console.error('Error loading pending invitations:', error);
            return [];
        }

        return (data || []) as EventGuestOrganization[];
    }

    /**
     * Invite a guest organization to an event
     */
    async inviteGuest(dto: CreateGuestInvitationDto): Promise<boolean> {
        this.loading.set(true);
        this.error.set(null);

        const orgId = this.orgService.currentOrgId();
        if (!orgId) {
            this.error.set('Keine Organisation ausgewählt');
            this.loading.set(false);
            return false;
        }

        // Get current member ID for audit
        const { data: member } = await this.supabase.client
            .from('members')
            .select('id')
            .eq('organization_id', orgId)
            .eq('user_id', (await this.supabase.client.auth.getUser()).data.user?.id)
            .single();

        const { error } = await this.supabase.client
            .from('event_guest_organizations')
            .insert({
                event_id: dto.event_id,
                host_organization_id: orgId,
                guest_organization_id: dto.guest_organization_id,
                guest_org_name: dto.guest_org_name,
                guest_org_email: dto.guest_org_email,
                guest_org_contact_name: dto.guest_org_contact_name,
                invited_by: member?.id,
                status: 'pending',
            });

        this.loading.set(false);

        if (error) {
            if (error.code === '23505') {
                this.error.set('Diese Organisation wurde bereits eingeladen');
            } else {
                this.error.set('Einladung konnte nicht gesendet werden');
            }
            console.error('Error inviting guest:', error);
            return false;
        }

        return true;
    }

    /**
     * Respond to an invitation (accept or decline)
     */
    async respondToInvitation(
        invitationId: string,
        response: 'accepted' | 'declined'
    ): Promise<boolean> {
        this.loading.set(true);
        this.error.set(null);

        const { error } = await this.supabase.client
            .from('event_guest_organizations')
            .update({
                status: response,
                responded_at: new Date().toISOString(),
            })
            .eq('id', invitationId);

        this.loading.set(false);

        if (error) {
            this.error.set('Antwort konnte nicht gespeichert werden');
            console.error('Error responding to invitation:', error);
            return false;
        }

        return true;
    }

    /**
     * Remove a guest invitation
     */
    async removeInvitation(invitationId: string): Promise<boolean> {
        this.loading.set(true);

        const { error } = await this.supabase.client
            .from('event_guest_organizations')
            .delete()
            .eq('id', invitationId);

        this.loading.set(false);

        if (error) {
            console.error('Error removing invitation:', error);
            return false;
        }

        return true;
    }

    /**
     * Search for organizations to invite (autocomplete)
     */
    async searchOrganizations(query: string): Promise<Array<{
        id: string;
        name: string;
        slug: string;
        logo_url?: string;
    }>> {
        if (!query || query.length < 2) return [];

        const currentOrgId = this.orgService.currentOrgId();

        const { data, error } = await this.supabase.client
            .from('organizations')
            .select('id, name, slug, logo_url')
            .ilike('name', `%${query}%`)
            .neq('id', currentOrgId || '')
            .limit(10);

        if (error) {
            console.error('Error searching organizations:', error);
            return [];
        }

        return data || [];
    }
}
