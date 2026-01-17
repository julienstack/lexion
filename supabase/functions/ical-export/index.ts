// iCal Export Edge Function
// Generates .ics file for calendar subscription
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Format a date/time to iCal format (YYYYMMDDTHHMMSS)
 */
function formatICalDate(date: string, time?: string): string {
    const d = new Date(date);
    if (time) {
        const [hours, minutes] = time.split(':');
        d.setHours(parseInt(hours), parseInt(minutes), 0);
    }
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape special characters for iCal text fields
 */
function escapeICalText(text: string): string {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

/**
 * Generate iCal content from events
 */
function generateICalContent(events: any[], calendarName: string = 'Lexion'): string {
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lexion//Vereinsverwaltung//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${calendarName}
X-WR-TIMEZONE:Europe/Berlin
`;

    for (const event of events) {
        const uid = `${event.id}@lexion.dev`;
        const dtStart = formatICalDate(event.date, event.start_time);
        const dtEnd = event.end_time
            ? formatICalDate(event.date, event.end_time)
            : formatICalDate(event.date, event.start_time); // Fallback: same as start

        const summary = escapeICalText(event.title);
        const description = escapeICalText(event.description || '');
        const location = escapeICalText(event.location || '');

        ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${summary}
`;

        if (description) {
            ical += `DESCRIPTION:${description}\n`;
        }
        if (location) {
            ical += `LOCATION:${location}\n`;
        }
        if (event.ag_name) {
            ical += `CATEGORIES:${escapeICalText(event.ag_name)}\n`;
        }

        ical += `END:VEVENT\n`;
    }

    ical += `END:VCALENDAR`;

    return ical;
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization") ?? "" },
                },
            }
        );

        // Parse query params
        const url = new URL(req.url);
        const agId = url.searchParams.get('ag'); // Optional: filter by AG
        const download = url.searchParams.get('download') !== 'false';

        // Build query
        let query = supabaseClient
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        // Filter by AG if specified
        if (agId) {
            query = query.eq('working_group_id', agId);
        }

        // Only future events (or last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

        const { data: events, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        // Get calendar name
        let calendarName = 'Lexion Kalender';
        if (agId) {
            const { data: ag } = await supabaseClient
                .from('working_groups')
                .select('name')
                .eq('id', agId)
                .single();
            if (ag) {
                calendarName = `Lexion - ${ag.name}`;
            }
        }

        // Generate iCal content
        const icalContent = generateICalContent(events || [], calendarName);

        // Return as .ics file
        const headers = {
            ...corsHeaders,
            "Content-Type": "text/calendar; charset=utf-8",
        };

        if (download) {
            headers["Content-Disposition"] = `attachment; filename="${calendarName.replace(/\s+/g, '_')}.ics"`;
        }

        return new Response(icalContent, { headers });

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    }
});
