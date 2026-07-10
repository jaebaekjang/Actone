// Capture design-QA screenshots of the real apps at 390/768/1440.
// Requires the same local stack as e2e.mjs (gateway :54321, web :3000, admin :3001).
// Output: docs/design-screenshots/<page>-<width>.png
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import fs from "node:fs";
import pg from "pg";

const OUT =
  process.env.SHOTS_DIR ?? new URL("../docs/design-screenshots/", import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const db = new pg.Pool({
  host: process.env.E2E_PGADMIN_HOST ?? "127.0.0.1",
  port: Number(process.env.E2E_PGPORT ?? 5432),
  user: process.env.E2E_PGADMIN_USER ?? "postgres",
  database: process.env.E2E_PGDATABASE ?? "actone_e2e",
});
const sql = (q, p) => db.query(q, p);

const U = "44444444-4444-4444-4444-444444444444";

// ---- fixture state: one regular member who is also an admin ----
// drop leftovers from e2e.mjs runs so screenshots only show seed-tone content
await sql(
  `delete from posts where title in ('오디션 체크리스트 제보','E2E 첫 글입니다','수정된 제목입니다')
   or content like 'E2E%'`,
);
await sql("delete from reports");
await sql("delete from comments where author_id = $1", [U]);
await sql("update profiles set member_level_updated_by=null where member_level_updated_by=$1", [U]);
await sql("delete from member_level_logs where user_id=$1 or changed_by=$1", [U]);
await sql("delete from admin_users where user_id = $1", [U]);
await sql("delete from auth.users where id = $1", [U]);
await sql(
  `insert into auth.users (id, email, raw_user_meta_data)
   values ($1, 'design@example.com', '{"provider_id":"kakao_design"}'::jsonb)`,
  [U],
);
await sql(
  `update profiles set nickname='무대뒤', actor_status='활동 중인 배우', activity_field='독립영화',
     region='서울', bio='독립영화 위주로 활동 중입니다. 대본 리딩 스터디를 좋아합니다.',
     onboarding_completed=true, member_level='regular_member', role='admin' where id=$1`,
  [U],
);
await sql(
  `insert into admin_users (user_id, email, is_active) values ($1,'design@example.com',true)
   on conflict do nothing`,
  [U],
);

// richer meetup details for the seeded meetup post
await sql(
  `update offline_meetup_details set meetup_date=current_date + 14, meetup_time='19:30',
     venue='홍대입구역 인근 스터디룸', application_url='https://apply.example.com/first'`,
);

// a few comments so lists/detail show real counts
const { rows: postRows } = await sql(
  `select id, title from posts where title in
   ('배우를 계속해도 되는지 모르겠을 때','첫 촬영장에서 미리 알았으면 좋았을 것들')`,
);
const survival = postRows.find((r) => r.title.startsWith("배우를"));
for (const c of [
  "저도 작년에 똑같은 고민을 했어요. 결과 없는 시기에 스터디가 많이 버팀목이 됐습니다.",
  "실력의 문제라기보다 기회의 문제인 경우가 훨씬 많다고 생각해요.",
]) {
  await sql(`insert into comments (post_id, author_id, content) values ($1,$2,$3)`, [
    survival.id,
    U,
    c,
  ]);
}

// pending reports for the admin reports screen
await sql(
  `insert into reports (reporter_id, target_type, target_id, reason, detail)
   values ($1,'post',$2,'홍보 / 스팸','같은 내용의 글이 반복 게시되고 있습니다.'),
          ($1,'post',$2,'기타','카테고리에 맞지 않는 글 같습니다.')`,
  [U, survival.id],
);

const cookies = JSON.parse(
  execSync(`node mint-cookies.mjs ${U} design@example.com`, {
    cwd: new URL(".", import.meta.url).pathname,
  }).toString(),
);

const meetupPost = (
  await sql(`select p.id from posts p join categories c on c.id=p.category_id
             where c.slug='offline-meetups' and p.status='published' limit 1`)
).rows[0];

const VIEWPORTS = [
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
  { w: 1440, h: 1000 },
];

const PAGES = [
  { name: "landing", url: "http://localhost:3000/", auth: false, heroShot: true },
  { name: "community-home", url: "http://localhost:3000/community", auth: true },
  { name: "board-meetups", url: "http://localhost:3000/community/offline-meetups", auth: true },
  { name: "post-detail", url: `http://localhost:3000/posts/${survival.id}`, auth: true },
  { name: "post-meetup", url: `http://localhost:3000/posts/${meetupPost.id}`, auth: true },
  { name: "write", url: "http://localhost:3000/write?category=offline-meetups", auth: true },
  { name: "mypage", url: "http://localhost:3000/me", auth: true },
  { name: "admin-members", url: "http://localhost:3001/members", auth: true },
  { name: "admin-reports", url: "http://localhost:3001/reports", auth: true },
];

const browser = await chromium
  .launch({ args: ["--no-sandbox", "--no-proxy-server"] })
  .catch(() =>
    chromium.launch({
      args: ["--no-sandbox", "--no-proxy-server"],
      executablePath: process.env.E2E_CHROMIUM ?? "/opt/pw-browsers/chromium",
    }),
  );

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();
  page.setDefaultNavigationTimeout(90000);
  for (const p of PAGES) {
    await page.goto(p.url, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(1200);
    if (p.heroShot) {
      await page.screenshot({ path: `${OUT}${p.name}-hero-${vp.w}.png` });
    }
    await page.screenshot({ path: `${OUT}${p.name}-${vp.w}.png`, fullPage: true });
    console.log(`shot ${p.name} @ ${vp.w}`);
  }
  await ctx.close();
}

await browser.close();
await db.end();
console.log(`done → ${OUT}`);
