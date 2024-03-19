import { WebClient } from "npm:@slack/web-api";

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? "";
const botClient = new WebClient(slackBotToken);

// Pulls the users, creates matches, and inserts it into the database
import { createClient } from "npm:@supabase/supabase-js@2";

interface Match {
  users: string[];
}

// Pulls the users, creates matches, and inserts it into the database
Deno.serve(async (req) => {
  const userListResponse = await botClient.users.list({});

  if (!userListResponse.ok) {
    return new Response("Failed to fetch users", {
      headers: { "Content-Type": "application/json" },
    });
  }

  const userList = userListResponse.members!;

  // TODO: match the users

  const shuffledUserList = userList
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  const matches: Match[] = [];

  for (const slackUser of shuffledUserList) {
    const isEmptyMatch = matches[matches.length - 1].users.length == 0;
    if (isEmptyMatch) {
      matches[matches.length - 1].users.push(slackUser.id!);
    } else {
      matches.push({ users: [slackUser.id!] });
    }
  }

  // TODO: insert the maches into the database
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  supabase.from("matches").insert(matches);

  return Response.json({ members: userList, total: userList.length });
});
