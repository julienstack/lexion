import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { WorkingGroup } from '../models/working-group.model';
import { CalendarEvent } from '../models/calendar-event.model';

/**
 * Service for managing working groups via Supabase
 */
@Injectable({
    providedIn: 'root',
})
export class WorkingGroupsService {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'working_groups';

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
        this._workingGroups.update((groups) => [...groups, data]);
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
        this._workingGroups.update((groups) =>
            groups.map((g) => (g.id === id ? data : g))
        );
        return data;
    }

    async deleteWorkingGroup(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        this._workingGroups.update((groups) =>
            groups.filter((g) => g.id !== id)
        );
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

        // Optimistically update count
        this._workingGroups.update(groups =>
            groups.map(g => g.id === groupId ? { ...g, members_count: (g.members_count || 0) + 1 } : g)
        );
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

        // Optimistically update count
        this._workingGroups.update(groups =>
            groups.map(g => g.id === groupId ? { ...g, members_count: Math.max(0, (g.members_count || 0) - 1) } : g)
        );
    }
}
