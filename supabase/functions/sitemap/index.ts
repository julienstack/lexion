
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STATIC_ROUTES = [
    '',
    '/login',
    '/registrieren',
    '/erstellen',
    '/organisationen',
    '/impressum',
    '/datenschutz',
    '/docs'
];

const BASE_URL = 'https://pulsedeck.de';

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        // Fetch Organizations
        const { data: organizations, error } = await supabaseClient
            .from('organizations')
            .select('slug, updated_at');

        if (error) {
            throw error;
        }

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
        if (organizations && organizations.length > 0) {
            organizations.forEach((org: any) => {
                const lastMod = org.updated_at ? new Date(org.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                xml += '  <url>\n';
                xml += `    <loc>${BASE_URL}/${org.slug}</loc>\n`;
                xml += `    <lastmod>${lastMod}</lastmod>\n`;
                xml += '    <changefreq>weekly</changefreq>\n';
                xml += '    <priority>1.0</priority>\n';
                xml += '  </url>\n';
            });
        }

        xml += '</urlset>';

        return new Response(xml, {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/xml",
                "Cache-Control": "public, max-age=3600" // Cache for 1 hour
            }
        });

    } catch (error) {
        console.error("Error generating sitemap:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
