/**
 * Production environment configuration
 * Values are replaced during build by Netlify environment variables
 */
export const environment = {
    production: true,
    supabase: {
        url: 'https://dniozpfdldgtvpaehuux.supabase.co',
        anonKey: 'sb_publishable_rJ2hoyQj0TIsPwZyw2edyw_p4yD8CeG',
    },
};
