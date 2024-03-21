import express from "npm:express@4.18.2";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";

const app = express();
app.use(express.urlencoded({ extended: true })); // support encoded bodies
const port = 3000;

app.post("/unsubscribe", async (req: any, res: any) => {
  const { payload } = req.body;
  const { user } = JSON.parse(payload);
  const slackId = user.id;

  const supabase = createClient<Database>(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("members").update({
    is_subscribed: false,
  }).eq("id", slackId);

  if (error) {
    console.log(error.message);
    return res.send(error.message);
  }

  // TODO: Send unsubscribe confirmation

  res.send(`ok`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
