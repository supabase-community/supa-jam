// Pulls the users, creates matches, and inserts it into the database

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response('Not Get request', {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  })
})
