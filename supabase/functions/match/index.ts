import { WebClient } from "npm:@slack/web-api";

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? "";
const botClient = new WebClient(slackBotToken);

// Pulls the users, creates matches, and inserts it into the database

Deno.serve(async (req) => {
  const users = await botClient.users.list({});

  return Response.json({
    members: users.members,
    total: users.members?.length,
  });
});
