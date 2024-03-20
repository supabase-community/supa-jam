import { createClient } from "npm:@supabase/supabase-js@2";

// Unsubscribes a user from the donut bot
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      "Unauthorized",
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // TODO: check the shape of the incoming request from slack
  const { user } = await req.json();

  const slackId = user.id;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("members").update({
    is_subscribed: false,
  }).eq("slack_id", slackId);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    "ok",
    { headers: { "Content-Type": "application/json" } },
  );
});
