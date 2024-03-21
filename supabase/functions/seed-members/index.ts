import { WebClient } from "npm:@slack/web-api@7.0.2";

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? "";
const botClient = new WebClient(slackBotToken);

// Pulls the users, creates matches, and inserts it into the database
import { createClient } from "npm:@supabase/supabase-js@2";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (_req) => {
  const userListResponse = await botClient.users.list({});

  if (!userListResponse.ok) {
    return new Response("Failed to fetch users", {
      headers: { "Content-Type": "application/json" },
    });
  }

  let userList = userListResponse.members!;
  // filter bots
  userList = userList.filter((user) => !user.is_bot);
  // filter deleted users
  userList = userList.filter((user) => !user.deleted);
  // filter guests / single channel users
  userList = userList.filter((user) =>
    !user.is_restricted && !user.is_ultra_restricted
  );
  // TODO: filter unsubscribed users.
  userList = userList.map((user) => {
    const { id, team_id, name, real_name, profile } = user;
    const email = profile?.email;
    return { id, team_id, name, real_name, email };
  });
  const { error } = await supabase.from("members").upsert(userList);
  if (error) console.log(error.message);

  console.log({ userList, total: userList.length });
  return Response.json({ userList, total: userList.length });
});
