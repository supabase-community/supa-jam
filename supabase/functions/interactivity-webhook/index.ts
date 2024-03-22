import express from "npm:express@4.18.2";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";

import { WebClient } from "npm:@slack/web-api@7.0.2";

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? "";
const botClient = new WebClient(slackBotToken);

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const app = express();
app.use(express.urlencoded({ extended: true })); // support encoded bodies
const port = 3000;

app.post("/interactivity-webhook", async (req: any, res: any) => {
  const { payload } = req.body;
  const { user, type, actions } = JSON.parse(payload);

  if (type === "block_actions") {
    const action = actions[0].action_id;
    let is_subscribed = false;
    const blocks: any[] = [];

    switch (action) {
      case "unsubscribe":
        is_subscribed = false;
        blocks.push({
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text":
              "Sorry to see you go! :sob: When you're ready to rejoin, simply click the button below!",
          },
        });
        blocks.push({
          "type": "actions",
          "elements": [{
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Resubscribe :raised_hands:",
            },
            "value": "subscribe",
            "action_id": "subscribe",
          }],
        });
        break;

      case "subscribe":
        is_subscribed = true;
        blocks.push({
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text":
              "Welcome back :raised_hands: You'll be included in the next match up :thumbsup:",
          },
        });
        break;

      default:
        break;
    }

    try {
      await supabase.from("members").update({
        is_subscribed,
      }).eq("id", user.id).throwOnError();

      const con = await botClient.conversations.open({
        users: user.id,
      });
      if (con.ok && con.channel?.id) {
        await botClient.chat.postMessage({
          channel: con.channel.id,
          blocks,
        });
      } else {
        console.log(con.error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  res.send(`ok`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
