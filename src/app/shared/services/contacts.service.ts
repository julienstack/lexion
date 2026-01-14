import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase';
import { ContactPerson } from '../models/contact-person.model';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for managing contact persons via Supabase
 * Includes realtime subscriptions for live updates
 */
@Injectable({
    providedIn: 'root',
})
export class ContactsService implements OnDestroy {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'contacts';
    private realtimeChannel: RealtimeChannel | null = null;

    private _contacts = signal<ContactPerson[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    /** Contacts list (readonly signal) */
    readonly contacts = this._contacts.asReadonly();

    /** Loading state (readonly signal) */
    readonly loading = this._loading.asReadonly();

    /** Error message (readonly signal) */
    readonly error = this._error.asReadonly();

    /**
     * Fetch all contacts from Supabase
     */
    async fetchContacts(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            this._error.set(error.message);
            console.error('Error fetching contacts:', error);
        } else {
            this._contacts.set(data ?? []);
        }

        this._loading.set(false);
        this.subscribeToRealtime();
    }

    private subscribeToRealtime() {
        if (this.realtimeChannel) return;

        this.realtimeChannel = this.supabase.subscribeToTable(
            this.TABLE_NAME,
            (payload: any) => {
                this.handleRealtimeUpdate(payload);
            }
        );
    }

    private handleRealtimeUpdate(payload: any) {
        const eventType = payload.eventType;
        const newRecord = payload.new as ContactPerson;
        const oldRecord = payload.old as ContactPerson;

        switch (eventType) {
            case 'INSERT':
                this._contacts.update(contacts => {
                    const sorted = [...contacts, newRecord]
                        .sort((a, b) => a.name.localeCompare(b.name));
                    return sorted;
                });
                break;
            case 'UPDATE':
                this._contacts.update(contacts =>
                    contacts.map(c => (c.id === newRecord.id ? newRecord : c))
                );
                break;
            case 'DELETE':
                this._contacts.update(contacts =>
                    contacts.filter(c => c.id !== oldRecord.id)
                );
                break;
        }
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
    }

    /**
     * Add a new contact
     */
    async addContact(contact: Omit<ContactPerson, 'id' | 'created_at' | 'updated_at'>) {
        console.log('Adding contact:', contact);
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(contact)
            .select()
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(error.message);
        }

        console.log('Contact added:', data);
        return data;
    }

    /**
     * Update an existing contact
     */
    async updateContact(id: string, updates: Partial<ContactPerson>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Delete a contact
     */
    async deleteContact(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    }
}
