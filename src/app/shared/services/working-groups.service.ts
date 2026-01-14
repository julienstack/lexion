import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase';
import { WorkingGroup } from '../models/working-group.model';
import { CalendarEvent } from '../models/calendar-event.model';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for managing working groups via Supabase
 * Includes realtime subscriptions for live updates
 */
@Injectable({
    providedIn: 'root',
})
export class WorkingGroupsService implements OnDestroy {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'working_groups';
    private realtimeChannel: RealtimeChannel | null = null;
    private memberRealtimeChannel: RealtimeChannel | null = null;

    private _workingGroups = signal<WorkingGroup[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);
    private _myMemberships = signal<Set<string>>(new Set());
    private _agEvents = signal<Map<string, CalendarEvent[]>>(new Map());

    readonly workingGroups = this._workingGroups.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly myMemberships = this._myMemberships.asReadonly();
    readonly agEvents = this._agEvents.asReadonly();

    async fetchWorkingGroups(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        // Fetch working groups with actual member count via join
        const { data: groups, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            this._error.set(error.message);
            console.error('Error fetching working groups:', error);
            this._loading.set(false);
            return;
        }

        // Fetch actual member counts for each group
        const { data: memberCounts } = await this.supabase
            .from('working_group_members')
            .select('working_group_id');

        // Build count map
        const countMap = new Map<string, number>();
        if (memberCounts) {
            for (const m of memberCounts) {
                const gid = m.working_group_id;
                countMap.set(gid, (countMap.get(gid) || 0) + 1);
            }
        }

        // Fetch upcoming events for all AGs
        const today = new Date().toISOString().split('T')[0];
        const { data: events } = await this.supabase
            .from('events')
            .select('*')
            .not('working_group_id', 'is', null)
            .gte('date', today)
            .order('date', { ascending: true })
            .order('start_time', { ascending: true });

        // Build events map
        const eventsMap = new Map<string, CalendarEvent[]>();
        if (events) {
            for (const evt of events) {
                const gid = evt.working_group_id;
                if (!eventsMap.has(gid)) {
                    eventsMap.set(gid, []);
                }
                eventsMap.get(gid)!.push(evt);
            }
        }
        this._agEvents.set(eventsMap);

        // Update groups with actual counts
        const enrichedGroups = (groups ?? []).map(g => ({
            ...g,
            members_count: countMap.get(g.id) || 0
        }));

        this._workingGroups.set(enrichedGroups);
        this._loading.set(false);
        this.subscribeToRealtime();
    }

    private subscribeToRealtime() {
        if (!this.realtimeChannel) {
            this.realtimeChannel = this.supabase.subscribeToTable(
                this.TABLE_NAME,
                (payload: any) => {
                    this.handleRealtimeUpdate(payload);
                }
            );
        }

        if (!this.memberRealtimeChannel) {
            this.memberRealtimeChannel = this.supabase.subscribeToTable(
                'working_group_members',
                (payload: any) => {
                    this.handleMemberRealtimeUpdate(payload);
                }
            );
        }
    }

    private handleRealtimeUpdate(payload: any) {
        const eventType = payload.eventType;
        const newRecord = payload.new as WorkingGroup;
        const oldRecord = payload.old as WorkingGroup;

        switch (eventType) {
            case 'INSERT':
                this._workingGroups.update(groups => {
                    const sorted = [...groups, { ...newRecord, members_count: 0 }]
                        .sort((a, b) => a.name.localeCompare(b.name));
                    return sorted;
                });
                break;
            case 'UPDATE':
                this._workingGroups.update(groups =>
                    groups.map(g => (g.id === newRecord.id ? { ...newRecord, members_count: g.members_count } : g))
                );
                break;
            case 'DELETE':
                this._workingGroups.update(groups =>
                    groups.filter(g => g.id !== oldRecord.id)
                );
                break;
        }
    }

    private handleMemberRealtimeUpdate(payload: any) {
        const eventType = payload.eventType;
        const record = payload.new || payload.old;
        const groupId = record?.working_group_id;

        if (!groupId) return;

        switch (eventType) {
            case 'INSERT':
                this._workingGroups.update(groups =>
                    groups.map(g => g.id === groupId
                        ? { ...g, members_count: (g.members_count || 0) + 1 }
                        : g)
                );
                break;
            case 'DELETE':
                this._workingGroups.update(groups =>
                    groups.map(g => g.id === groupId
                        ? { ...g, members_count: Math.max(0, (g.members_count || 0) - 1) }
                        : g)
                );
                break;
        }
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
        if (this.memberRealtimeChannel) {
            this.supabase.unsubscribe(this.memberRealtimeChannel);
        }
    }

    async fetchMyMemberships(memberId: string) {
        if (!memberId) {
            this._myMemberships.set(new Set());
            return;
        }
        const { data, error } = await this.supabase
            .from('working_group_members')
            .select('working_group_id')
            .eq('member_id', memberId);

        if (error) {
            console.error('Error fetching memberships', error);
            return;
        }

        if (data) {
            this._myMemberships.set(new Set(data.map((d: any) => d.working_group_id)));
        }
    }

    async addWorkingGroup(
        wg: Omit<WorkingGroup, 'id' | 'created_at' | 'updated_at'>
    ) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(wg)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async updateWorkingGroup(id: string, updates: Partial<WorkingGroup>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async deleteWorkingGroup(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    async joinGroup(groupId: string, memberId: string) {
        const { error } = await this.supabase
            .from('working_group_members')
            .insert({ working_group_id: groupId, member_id: memberId });

        if (error) throw error;

        this._myMemberships.update(s => {
            const newSet = new Set(s);
            newSet.add(groupId);
            return newSet;
        });
    }

    async leaveGroup(groupId: string, memberId: string) {
        const { error } = await this.supabase
            .from('working_group_members')
            .delete()
            .eq('working_group_id', groupId)
            .eq('member_id', memberId);

        if (error) throw error;

        this._myMemberships.update(s => {
            const newSet = new Set(s);
            newSet.delete(groupId);
            return newSet;
        });
    }
}
