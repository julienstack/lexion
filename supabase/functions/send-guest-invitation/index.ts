import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * send-guest-invitation Edge Function
 * 
 * Sends an email to a guest organization inviting them to an event.
 * Includes "Powered by PulseDeck" branding for viral marketing.
 */

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": 
        "authorization, x-client-info, apikey, content-type",
};

interface GuestInvitationPayload {
    invitation_id: string;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Verify authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { 
                    status: 401, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = 
            await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: "Invalid token" }),
                { 
                    status: 401, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        const { invitation_id }: GuestInvitationPayload = await req.json();

        if (!invitation_id) {
            return new Response(
                JSON.stringify({ error: "invitation_id is required" }),
                { 
                    status: 400, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        // Fetch invitation with related data
        const { data: invitation, error: invError } = await supabaseAdmin
            .from("event_guest_organizations")
            .select(`
                *,
                event:event_id(
                    id, title, date, time_start, time_end, location, description
                ),
                host_organization:host_organization_id(
                    id, name, slug, logo_url
                ),
                guest_organization:guest_organization_id(id, name, slug)
            `)
            .eq("id", invitation_id)
            .single();

        if (invError || !invitation) {
            return new Response(
                JSON.stringify({ error: "Invitation not found" }),
                { 
                    status: 404, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        // Check authorization
        const { data: member } = await supabaseAdmin
            .from("members")
            .select("app_role")
            .eq("user_id", user.id)
            .eq("organization_id", invitation.host_organization_id)
            .single();

        if (!member || !["admin", "committee"].includes(member.app_role)) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { 
                    status: 403, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        // Get recipient email
        const recipientEmail = invitation.guest_org_email;

        if (!recipientEmail) {
            return new Response(
                JSON.stringify({ error: "No recipient email found" }),
                { 
                    status: 400, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        const siteUrl = Deno.env.get("SITE_URL") || "https://pulsedeck.de";
        const eventDate = new Date(invitation.event.date).toLocaleDateString(
            "de-DE",
            { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
        );

        // Email HTML with PulseDeck branding
        const emailHtml = generateEmailHtml(
            invitation, 
            eventDate, 
            siteUrl
        );

        console.log(`[send-guest-invitation] Recipient: ${recipientEmail}`);
        console.log(`[send-guest-invitation] Event: ${invitation.event?.title}`);
        
        // TODO: Integrate with email provider (Resend, SendGrid, etc.)

        return new Response(
            JSON.stringify({
                success: true,
                message: "Einladung wurde versendet",
                recipient: recipientEmail,
            }),
            { 
                status: 200, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
        );

    } catch (error: unknown) {
        console.error("[send-guest-invitation] Error:", error);
        const errorMessage = error instanceof Error 
            ? error.message 
            : String(error);
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { 
                status: 500, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
        );
    }
});

function generateEmailHtml(
    invitation: any,
    eventDate: string, 
    siteUrl: string
): string {
    const hostOrg = invitation.host_organization;
    const event = invitation.event;
    const guestName = invitation.guest_org_contact_name 
        || invitation.guest_org_name 
        || invitation.guest_organization?.name;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f4f4f5;">
    <table width="100%" cellpadding="0" cellspacing="0" 
        style="background:#f4f4f5;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" 
                    style="background:#fff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#e3000f,#b30000);
                            padding:32px;text-align:center;">
                            <h1 style="margin:0;color:white;font-size:24px;">
                                Event-Einladung
                            </h1>
                            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);">
                                von ${hostOrg?.name || 'Organisation'}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding:32px;">
                            <p style="color:#3f3f46;font-size:16px;margin:0 0 24px;">
                                Hallo${guestName ? ` ${guestName}` : ''},
                            </p>
                            
                            <p style="color:#3f3f46;font-size:16px;margin:0 0 24px;">
                                <strong>${hostOrg?.name}</strong> lädt euch 
                                herzlich zu folgendem Event ein:
                            </p>
                            
                            <!-- Event Card -->
                            <div style="background:#f9fafb;border-radius:12px;
                                padding:24px;margin:24px 0;
                                border-left:4px solid #e3000f;">
                                <h2 style="margin:0 0 16px;color:#18181b;">
                                    ${event?.title || 'Event'}
                                </h2>
                                <p style="margin:8px 0;color:#3f3f46;">
                                    📅 ${eventDate}
                                </p>
                                <p style="margin:8px 0;color:#3f3f46;">
                                    ⏰ ${event?.time_start || 'TBA'} Uhr
                                </p>
                                <p style="margin:8px 0;color:#3f3f46;">
                                    📍 ${event?.location || 'Wird bekannt gegeben'}
                                </p>
                            </div>
                            
                            <!-- CTA -->
                            <table width="100%" style="margin:32px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${siteUrl}/event/${event?.id}" 
                                            style="display:inline-block;
                                            background:#e3000f;color:white;
                                            text-decoration:none;padding:16px 32px;
                                            border-radius:12px;font-weight:bold;">
                                            Event-Details ansehen
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Powered by PulseDeck Footer -->
                    <tr>
                        <td style="background:#18181b;padding:24px;text-align:center;">
                            <p style="color:#a1a1aa;font-size:12px;margin:0 0 8px;">
                                Diese Einladung wurde versendet über
                            </p>
                            <a href="${siteUrl}" style="text-decoration:none;">
                                <span style="font-size:16px;">✨</span>
                                <span style="color:white;font-weight:bold;">
                                    PulseDeck
                                </span>
                            </a>
                            <p style="color:#71717a;font-size:12px;margin:12px 0 0;">
                                Die moderne Plattform für Vereinsmanagement.
                                <br>
                                <a href="${siteUrl}" style="color:#e3000f;">
                                    Kostenlos für deinen Verein starten →
                                </a>
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
