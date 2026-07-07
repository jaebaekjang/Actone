// Produce the exact @supabase/ssr auth cookies for a user, for injection
// into a Playwright browser context. Usage: node mint-cookies.mjs <sub> <email>
import { createServerClient } from "@supabase/ssr";

const [sub, email = ""] = process.argv.slice(2);
const { anon_key } = await (await fetch("http://127.0.0.1:54321/e2e/anon")).json();
const session = await (
  await fetch(`http://127.0.0.1:54321/e2e/mint?sub=${sub}&email=${encodeURIComponent(email)}`)
).json();

const jar = new Map();
const client = createServerClient("http://localhost:54321", anon_key, {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (cs) => cs.forEach(({ name, value }) => jar.set(name, value)),
  },
});

const { error } = await client.auth.setSession({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
});
if (error) {
  console.error("setSession failed:", error);
  process.exit(1);
}

console.log(
  JSON.stringify(
    [...jar].map(([name, value]) => ({
      name,
      value,
      domain: "localhost",
      path: "/",
    })),
  ),
);
