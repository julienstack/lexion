/**
 * Member interface matching Supabase table structure
 */
export interface Member {
    id?: string;
    name: string;
    role: string;
    department: string;
    status: 'Active' | 'Inactive' | 'Pending';
    email: string;
    join_date: string;
    avatar_url?: string;
    user_id?: string;
    app_role?: 'public' | 'member' | 'committee' | 'admin';
    street?: string;
    zip_code?: string;
    city?: string;
    phone?: string;
    birthday?: string;
    created_at?: string;
    updated_at?: string;
}
