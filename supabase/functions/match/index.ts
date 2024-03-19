// Pulls the users, creates matches, and inserts it into the database

interface SlackMember {
  id: string;
  name: string;
  real_name: string;
}

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return new Response("Not Get request", {
      headers: { "Content-Type": "application/json" },
    });
  }

  const userListResponse = await fetch("https://slack.com/api/users.list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${Deno.env.get("SLACK_BOT_TOKEN")}`,
    },
  });

  if (!userListResponse.ok) {
    return new Response("Failed to fetch users", {
      headers: { "Content-Type": "application/json" },
    });
  }

  const userList: SlackMember[] = (await userListResponse.json()).members;

  // TODO: match the users

  // TODO: insert the maches into the database

  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
});
