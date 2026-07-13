// Capture a 1200x630 OG image of the spotlight hero + a tutor-badge QA shot.
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import pg from "pg";

const db = new pg.Pool({ host: "127.0.0.1", port: 5432, user: "postgres", database: "actone_e2e" });
const U = "44444444-4444-4444-4444-444444444444";

const browser = await chromium.launch({ args: ["--no-sandbox", "--no-proxy-server"], executablePath: process.env.E2E_CHROMIUM ?? "/opt/pw-browsers/chromium" });

// 1) OG image — guest landing hero at 1200x630
{
  const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 } })).newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "header{display:none!important} [aria-label='카카오채널 문의']{display:none!important}" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/home/user/Actone/apps/web/app/opengraph-image.jpg", type: "jpeg", quality: 82 });
}

// 2) tutor badge shot — flip fixture user to tutor, capture my page
{
  await db.query("update profiles set member_level='tutor' where id=$1", [U]);
  const cookies = JSON.parse(execSync(`node mint-cookies.mjs ${U} design@example.com`, { cwd: "/home/user/Actone/e2e" }).toString());
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/me", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "/home/user/Actone/docs/design-screenshots/tutor-badge-1440.png" });
  await db.query("update profiles set member_level='regular_member' where id=$1", [U]);
}

await browser.close();
await db.end();
console.log("done");
