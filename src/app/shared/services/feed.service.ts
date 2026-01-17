import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth.service';
import { OrganizationService } from './organization.service';

export type FeedItemStatus = 'draft' | 'review' | 'approved' | 'sent';
export type FeedItemType = 'article' | 'link';

export interface FeedItem {
    id?: string;
    created_at?: string;
    updated_at?: string;
    title: string;
    content?: string;
    url?: string;
    type: FeedItemType;
    status: FeedItemStatus;
    author_id?: string;
    sent_at?: string;

    // joined
    author?: { name: string };
}

@Injectable({ providedIn: 'root' })
export class FeedService {
    private supabase = inject(SupabaseService);
    private auth = inject(AuthService);
    private org = inject(OrganizationService);

    /** Get published items for everyone */
    async getFeedItems() {
        const orgId = this.org.currentOrgId();

        let query = this.supabase.client
            .from('feed_items')
            .select('*, author:members(name)')
            .in('status', ['approved', 'sent'])
            .order('created_at', { ascending: false });

        if (orgId) {
            query = query.eq('organization_id', orgId);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        return data as FeedItem[];
    }

    /** Get items created by current user */
    async getMyItems() {
        const memberId = this.auth.currentMember()?.id;
        if (!memberId) return [];

        const { data, error } = await this.supabase.client
            .from('feed_items')
            .select('*, author:members(name)')
            .eq('author_id', memberId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as FeedItem[];
    }

    /** Get items waiting for review (Admins only) */
    async getReviewItems() {
        const { data, error } = await this.supabase.client
            .from('feed_items')
            .select('*, author:members(name)')
            .eq('status', 'review')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as FeedItem[];
    }

    /** Get un-sent approved items (for newsletter generation) */
    async getNewsletterQueue() {
        const { data, error } = await this.supabase.client
            .from('feed_items')
            .select('*, author:members(name)')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as FeedItem[];
    }

    /** Get already sent items (History) */
    async getSentItems() {
        const { data, error } = await this.supabase.client
            .from('feed_items')
            .select('*, author:members(name)')
            .eq('status', 'sent')
            .order('sent_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as FeedItem[];
    }

    async createItem(item: Partial<FeedItem>) {
        const memberId = this.auth.currentMember()?.id;
        if (!memberId) throw new Error('Not member');

        // Remove joined fields if any
        const { author, ...cleanItem } = item as any;

        const { data, error } = await this.supabase.client
            .from('feed_items')
            .insert({ ...cleanItem, author_id: memberId })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async updateItem(id: string, updates: Partial<FeedItem>) {
        const { author, ...cleanUpdates } = updates as any;

        const { data, error } = await this.supabase.client
            .from('feed_items')
            .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw new Error(error.message);
        return data;
    }

    async deleteItem(id: string) {
        const { error } = await this.supabase.client
            .from('feed_items')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    }

    // Newsletter Config
    async getNewsletterConfig() {
        const { data, error } = await this.supabase.client
            .from('newsletter_config')
            .select('*')
            .single();
        if (error) throw new Error(error.message);
        return data as NewsletterConfig;
    }

    async updateNewsletterConfig(config: Partial<NewsletterConfig>) {
        const { data, error } = await this.supabase.client
            .from('newsletter_config')
            .update(config)
            .eq('id', 1)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    }

    async triggerNewsletter() {
        // Force trigger (manual send)
        const { data, error } = await this.supabase.client.functions.invoke('send-newsletter', {
            body: { force: true }
        });
        if (error) throw new Error(error.message);
        return data;
    }

    async sendTestEmail(email: string) {
        const { data, error } = await this.supabase.client.functions.invoke('send-newsletter', {
            body: { test_email: email }
        });
        if (error) throw new Error(error.message);
        return data;
    }
}

export interface NewsletterConfig {
    id: number;
    frequency: 'weekly' | 'monthly' | 'manual';
    day_of_week: number;
    time_of_day: string;
    last_sent_at?: string;
    active: boolean;
    // SMTP Settings
    smtp_host?: string;
    smtp_port?: number;
    smtp_user?: string;
    smtp_pass?: string;
    smtp_from?: string;
    smtp_secure?: boolean;
    // Email Design
    logo_url?: string;
    footer_text?: string;
    primary_color?: string;
}
