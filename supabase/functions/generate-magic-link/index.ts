// supabase/functions/generate-magic-link/index.ts
// Generates a magic link for admin to copy and share via WhatsApp, etc.
// Uses short expiration for security (30 minutes)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
    email: string;
    memberId: string;
    redirectTo?: string;
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "No authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create admin client for generating link
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Create user client to verify caller is admin
        const supabaseUser = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
        );

        // Verify the user is authenticated
        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get the request body
        const { email, memberId, redirectTo } = await req.json() as RequestBody;

        if (!email || !memberId) {
            return new Response(
                JSON.stringify({ error: "Email and memberId are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Verify caller is admin/committee for this member's organization
        const { data: member } = await supabaseAdmin
            .from("members")
            .select("organization_id")
            .eq("id", memberId)
            .single();

        if (!member) {
            return new Response(
                JSON.stringify({ error: "Member not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if caller has admin/committee role for this org
        const { data: callerMember } = await supabaseAdmin
            .from("members")
            .select("app_role")
            .eq("user_id", user.id)
            .eq("organization_id", member.organization_id)
            .single();

        if (!callerMember || !["admin", "committee"].includes(callerMember.app_role)) {
            return new Response(
                JSON.stringify({ error: "Insufficient permissions" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
            (u) => u.email?.toLowerCase() === normalizedEmail
        );

        // Determine redirect URL
        const siteUrl = Deno.env.get("SITE_URL") || "https://pulsedeck.de";
        const origin = req.headers.get("origin");
        const finalRedirectTo = redirectTo || (origin ? `${origin}/auth/callback` : `${siteUrl}/auth/callback`);

        let magicLink: string;

        if (existingUser) {
            // User exists - generate magic link for sign-in
            const { data, error } = await supabaseAdmin.auth.admin.generateLink({
                type: "magiclink",
                email: normalizedEmail,
                options: {
                    redirectTo: finalRedirectTo,
                }
            });

            if (error) {
                console.error("[generate-magic-link] Error:", error);
                return new Response(
                    JSON.stringify({ error: error.message }),
                    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            magicLink = data.properties.action_link;
        } else {
            // User doesn't exist - generate invite link
            const { data, error } = await supabaseAdmin.auth.admin.generateLink({
                type: "invite",
                email: normalizedEmail,
                options: {
                    redirectTo: finalRedirectTo,
                    data: {
                        invited: true,
                        member_ids: [memberId],
                    }
                }
            });

            if (error) {
                console.error("[generate-magic-link] Error:", error);
                return new Response(
                    JSON.stringify({ error: error.message }),
                    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            magicLink = data.properties.action_link;
        }

        console.log(`[generate-magic-link] Generated link for ${normalizedEmail}`);

        return new Response(
            JSON.stringify({
                success: true,
                link: magicLink,
                expiresIn: "60 Minuten",
                message: existingUser 
                    ? "Login-Link generiert (bestehender Account)"
                    : "Einladungs-Link generiert (neuer Account)"
            }),
            { 
                status: 200, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
        );

    } catch (error) {
        console.error("[generate-magic-link] Unexpected error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
