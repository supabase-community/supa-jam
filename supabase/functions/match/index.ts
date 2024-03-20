import { WebClient } from "npm:@slack/web-api@7.0.2";

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? "";
const botClient = new WebClient(slackBotToken);

// Pulls the users, creates matches, and inserts it into the database
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface Match {
  users: string[];
  message_id?: string | null;
}

const sendMessage = async (
  { users, text }: { users: string; text: string },
) => {
  const con = await botClient.conversations.open({
    users,
  });
  if (con.ok && con.channel?.id) {
    const message = botClient.chat.postMessage({
      channel: con.channel.id,
      text,
    });
    return message;
  } else {
    console.log(con.error);
  }
};

// Pulls the users, creates matches, and inserts it into the database
Deno.serve(async (_req) => {
  // Get users from DB
  const { data: userList, error } = await supabase.from("members").select("id")
    .like(
      "email",
      "%@supabase.%",
    ).is("is_subscribed", true);
  if (error) {
    console.log(error.message);
    return Response.json(error);
  }

  // Shuffle
  const shuffledUserList = userList
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value.id ?? "");

  const matches: Match[] = [];

  const chunkSize = 2;

  for (let i = 0; i < shuffledUserList.length; i += chunkSize) {
    const chunk = shuffledUserList.slice(i, i + chunkSize);
    matches.push({ users: chunk });
  }

  // Send message to matches
  const allResults = await Promise.allSettled(
    matches.map(async (match) => {
      if (match.users.length === 2) {
        const message = await sendMessage({
          users: `${match.users[0]},${match.users[1]}`,
          text: `
            :wave: <@${match.users[0]}>, <@${match.users[1]}>
            It can be hard to connect on a distributed team, so SupaJam (not-Donut) intros everyone to meet every week. 
            Now that you're here, schedule a time to meet! :coffee::computer:
      `.trim(),
        });
        match.message_id = message?.channel ?? null;
        return match;
      }
    }),
  );
  // store message ids with matches
  let matchesWithMessages = allResults.map((res) => {
    if (res.status == "fulfilled") {
      return res.value;
    } else return undefined;
  });
  const matchesWithMessagesDefined: Match[] = matchesWithMessages.filter(
    (element) => (element !== undefined),
  );
  // Insert the maches into the database
  const { error: upsertError } = await supabase.from("matches").insert(
    matchesWithMessagesDefined,
  );
  if (upsertError) console.log(upsertError.message);

  return new Response("ok");
});
