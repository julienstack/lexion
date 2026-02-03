const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://dniozpfdldgtvpaehuux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuaW96cGZkbGRndHZwYWVodXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTcwNjAsImV4cCI6MjA4Mzg5MzA2MH0.HxsRDnHAuDdyLP-ZnU_LSJDGXdPcQGBKccM3sMSw33c';

const BASE_URL = 'https://pulsedeck.de'; // Replace with actual domain if known, or make it configurable
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

// Static Routes
const STATIC_ROUTES = [
    '/',
    '/login',
    '/registrieren',
    '/erstellen',
    '/organisationen',
    '/impressum',
    '/datenschutz',
    '/docs'
];

async function generateSitemap() {
    console.log('Starting sitemap generation...');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        // Fetch Organizations
        console.log('Fetching organizations...');
        const { data: organizations, error } = await supabase
            .from('organizations')
            .select('slug, updated_at');

        if (error) {
            console.error('Error fetching organizations:', error);
            process.exit(1);
        }

        console.log(`Found ${organizations.length} organizations.`);

        // Generate XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add Static Routes
        STATIC_ROUTES.forEach(route => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}${route}</loc>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Add Dynamic Organization Routes
        organizations.forEach(org => {
            const lastMod = org.updated_at ? new Date(org.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/${org.slug}</loc>\n`;
            xml += `    <lastmod>${lastMod}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>1.0</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        // Write to file
        fs.writeFileSync(SITEMAP_PATH, xml);
        console.log(`Sitemap generated successfully at ${SITEMAP_PATH}`);

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

generateSitemap();
