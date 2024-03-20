import { WebClient } from "npm:@slack/web-api@7.0.2";

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? "";
const botClient = new WebClient(slackBotToken);

// Pulls the users, creates matches, and inserts it into the database
import { createClient } from "npm:@supabase/supabase-js@2";

interface Match {
  users: string[];
}

const sendMessage = async (
  { users, text }: { users: string; text: string },
) => {
  return undefined;
  // Dangerous!
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
Deno.serve(async (req) => {
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
  console.log({ userList, total: userList.length + 1 });
  // filter external users
  // TODO: is_stranger does not seem to exist on Member type?
  // userList = userList.filter((user) => !user.is_stranger);
  // TODO: filter unsubscribed users.
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
  const slackMessages = await Promise.allSettled(
    matches.map((match) => {
      if (match.users.length === 2) {
        return sendMessage({
          users: `${match.users[0]},${match.users[1]}`,
          text: `
            :wave: <@${match.users[0]}>, <@${match.users[1]}>
            It can be hard to connect on a distributed team, so SupaJam (not-Donut) intros everyone to meet every week. 
            Now that you're here, schedule a time to meet! :coffee::computer:
      `.trim(),
        });
      }
    }),
  );
  // TODO: store message ids with matches
  // Insert the maches into the database
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("matches").insert(matches);
  if (error) console.log(error.message);

  return new Response("ok");
});
