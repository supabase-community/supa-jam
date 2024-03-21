import { WebClient } from "npm:@slack/web-api@7.0.2";

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? "";
const botClient = new WebClient(slackBotToken);

// Pulls the users, creates matches, and inserts it into the database
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database, TablesInsert } from "../_shared/database.types.ts";
const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (_req) => {
  // TODO: refactor to be trigger by cronjob from db
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
  const memberInsert = userList.reduce(function (result, user) {
    const { id, team_id, name, real_name, profile } = user;
    const email = profile?.email;
    if (id) result.push({ id, team_id, name, real_name, email });
    return result;
  }, [] as TablesInsert<"members">[]);
  const { error } = await supabase.from("members").upsert(memberInsert);
  if (error) console.log(error.message);

  console.log({ userList, total: userList.length });
  return Response.json({ total: userList.length });
});
