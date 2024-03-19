import { WebClient } from "npm:@slack/web-api";

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? "";
const botClient = new WebClient(slackBotToken);

// Pulls the users, creates matches, and inserts it into the database

interface SlackMember {
  id: string;
  name: string;
  real_name: string;
}

Deno.serve(async (req) => {
  const userListResponse = await botClient.users.list({});

  if (!userListResponse.ok) {
    return new Response("Failed to fetch users", {
      headers: { "Content-Type": "application/json" },
    });
  }

  const userList: SlackMember[] = userListResponse.members;

  // TODO: match the users

  // TODO: insert the maches into the database

  return Response.json({ members: userList, total: userList.length });
});
