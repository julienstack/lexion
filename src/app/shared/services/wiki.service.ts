import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { WikiDoc } from '../models/wiki-doc.model';

/**
 * Service for managing wiki documents via Supabase
 */
@Injectable({
    providedIn: 'root',
})
export class WikiService {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'wiki_docs';

    private _docs = signal<WikiDoc[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    readonly docs = this._docs.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async fetchDocs(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .order('last_updated', { ascending: false });

        if (error) {
            this._error.set(error.message);
            console.error('Error fetching wiki docs:', error);
        } else {
            this._docs.set(data ?? []);
        }

        this._loading.set(false);
    }

    async addDoc(doc: Omit<WikiDoc, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(doc)
            .select()
            .single();

        if (error) throw new Error(error.message);
        this._docs.update((docs) => [data, ...docs]);
        return data;
    }

    async updateDoc(id: string, updates: Partial<WikiDoc>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        this._docs.update((docs) => docs.map((d) => (d.id === id ? data : d)));
        return data;
    }

    async deleteDoc(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        this._docs.update((docs) => docs.filter((d) => d.id !== id));
    }
}
