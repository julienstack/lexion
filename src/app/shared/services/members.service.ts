import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase';
import { Member } from '../models/member.model';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for managing members via Supabase
 * Includes realtime subscriptions for live updates
 */
@Injectable({
    providedIn: 'root',
})
export class MembersService implements OnDestroy {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'members';
    private realtimeChannel: RealtimeChannel | null = null;

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
        const newRecord = payload.new as Member;
        const oldRecord = payload.old as Member;

        switch (eventType) {
            case 'INSERT':
                this._members.update(members => {
                    const sorted = [...members, newRecord]
                        .sort((a, b) => a.name.localeCompare(b.name));
                    return sorted;
                });
                break;
            case 'UPDATE':
                this._members.update(members =>
                    members.map(m => (m.id === newRecord.id ? newRecord : m))
                );
                break;
            case 'DELETE':
                this._members.update(members =>
                    members.filter(m => m.id !== oldRecord.id)
                );
                break;
        }
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
    }

    async addMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(member)
            .select()
            .single();

        if (error) throw new Error(error.message);
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
        return data;
    }

    async deleteMember(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    async deleteMany(ids: string[]) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .in('id', ids);

        if (error) throw new Error(error.message);
    }
}
