import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Member } from '../models/member.model';

/**
 * Service for managing members via Supabase
 */
@Injectable({
    providedIn: 'root',
})
export class MembersService {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'members';

    private _members = signal<Member[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    readonly members = this._members.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async fetchMembers(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            this._error.set(error.message);
            console.error('Error fetching members:', error);
        } else {
            this._members.set(data ?? []);
        }

        this._loading.set(false);
    }

    async addMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(member)
            .select()
            .single();

        if (error) throw new Error(error.message);
        this._members.update((members) => [...members, data]);
        return data;
    }

    async updateMember(id: string, updates: Partial<Member>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        this._members.update((members) =>
            members.map((m) => (m.id === id ? data : m))
        );
        return data;
    }

    async deleteMember(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        this._members.update((members) => members.filter((m) => m.id !== id));
    }

    async deleteMany(ids: string[]) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .in('id', ids);

        if (error) throw new Error(error.message);
        this._members.update((members) =>
            members.filter((m) => !ids.includes(m.id!))
        );
    }
}
