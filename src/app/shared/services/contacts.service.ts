import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { ContactPerson } from '../models/contact-person.model';

/**
 * Service for managing contact persons via Supabase
 */
@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'contacts';

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
        this._contacts.update((contacts) => [...contacts, data]);
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

        this._contacts.update((contacts) =>
            contacts.map((c) => (c.id === id ? data : c))
        );
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

        this._contacts.update((contacts) => contacts.filter((c) => c.id !== id));
    }
}
