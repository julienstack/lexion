import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase';
import { CalendarEvent } from '../models/calendar-event.model';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for managing calendar events via Supabase
 * Includes realtime subscriptions for live updates
 */
@Injectable({
    providedIn: 'root',
})
export class EventsService implements OnDestroy {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'events';
    private realtimeChannel: RealtimeChannel | null = null;

    private _events = signal<CalendarEvent[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    readonly events = this._events.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async fetchEvents(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            this._error.set(error.message);
            console.error('Error fetching events:', error);
        } else {
            this._events.set(data ?? []);
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
        const newRecord = payload.new as CalendarEvent;
        const oldRecord = payload.old as CalendarEvent;

        switch (eventType) {
            case 'INSERT':
                this._events.update(events => {
                    const sorted = [...events, newRecord].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                    return sorted;
                });
                break;
            case 'UPDATE':
                this._events.update(events =>
                    events.map(e => (e.id === newRecord.id ? newRecord : e))
                );
                break;
            case 'DELETE':
                this._events.update(events =>
                    events.filter(e => e.id !== oldRecord.id)
                );
                break;
        }
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
    }

    async addEvent(
        event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>
    ) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(event)
            .select()
            .single();

        if (error) throw new Error(error.message);
        // Realtime will handle the update
        return data;
    }

    async updateEvent(id: string, updates: Partial<CalendarEvent>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        // Realtime will handle the update
        return data;
    }

    async deleteEvent(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        // Realtime will handle the update
    }
}
