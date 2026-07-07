// Act One end-to-end verification against the local Supabase-compatible stack.
// Drives the real Next.js apps (unmodified) with Playwright.
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import fs from "node:fs";
import pg from "pg";

const SHOTS = process.env.E2E_SHOTS_DIR ?? new URL("./shots/", import.meta.url).pathname;
fs.mkdirSync(SHOTS, { recursive: true });

const db = new pg.Pool({
  host: process.env.E2E_PGADMIN_HOST ?? "127.0.0.1",
  port: Number(process.env.E2E_PGPORT ?? 55432),
  user: process.env.E2E_PGADMIN_USER ?? "postgres",
  database: process.env.E2E_PGDATABASE ?? "actone_e2e",
});
const sql = (q, p) => db.query(q, p);

const U1 = "11111111-1111-1111-1111-111111111111";
const U2 = "22222222-2222-2222-2222-222222222222";

const results = [];
function check(name, cond, extra = "") {
  results.push({ name, ok: !!cond });
  console.log(`${cond ? "PASS" : "FAIL"}: ${name}${extra ? ` — ${extra}` : ""}`);
}
async function expectText(page, text, name, timeout = 30000) {
  try {
    await page.getByText(text, { exact: false }).first().waitFor({ timeout });
    check(name, true);
  } catch {
    check(name, false, `text not found: ${text}`);
  }
}
const mintCookies = (sub, email) =>
  JSON.parse(execSync(`node mint-cookies.mjs ${sub} ${email}`, { cwd: new URL(".", import.meta.url).pathname }).toString());

// Dev-server pages hydrate slowly; interacting pre-hydration loses input state.
async function settle(page) {
  await page.waitForTimeout(2000);
}
async function selectStable(page, selector, option) {
  for (let i = 0; i < 6; i++) {
    await page.selectOption(selector, option);
    await page.waitForTimeout(400);
    const v = await page.locator(selector).evaluate((e) => e.value);
    if (v) return;
  }
  throw new Error(`select ${selector} would not hold a value`);
}

// ---- reset E2E state from any previous run ----
await sql("update profiles set member_level_updated_by = null where member_level_updated_by = any($1::uuid[])", [[U1, U2]]);
await sql("delete from member_level_logs where changed_by = any($1::uuid[]) or user_id = any($1::uuid[])", [[U1, U2]]);
await sql("update resource_submissions set reviewed_by = null where reviewed_by = any($1::uuid[])", [[U1, U2]]);
await sql("delete from comments where author_id = any($1::uuid[])", [[U1, U2]]);
await sql("delete from reports");
await sql("delete from resource_submissions");
await sql("delete from posts where author_id = any($1::uuid[])", [[U1, U2]]);
await sql("delete from auth.users where id = any($1::uuid[])", [[U1, U2]]);
await sql("update offline_meetup_details set application_url = null");
await sql("update posts set status = 'published' where status = 'hidden'");
await sql(
  `insert into auth.users (id, email, raw_user_meta_data)
   values ($1, 'tester@example.com', '{"provider_id":"kakao_test"}'::jsonb)`, [U1]);

async function launch() {
  const opts = { args: ["--no-sandbox", "--no-proxy-server"] };
  try { return await chromium.launch(opts); }
  catch { return await chromium.launch({ ...opts, executablePath: process.env.E2E_CHROMIUM ?? "/opt/pw-browsers/chromium" }); }
}

const browser = await launch();

// ============ 1. GUEST ============
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(90000);

  await page.goto("http://localhost:3000/");
  await expectText(page, "인맥 없이 배우를 시작했다면", "guest: landing hero renders");
  await expectText(page, "브릿로드", "guest: footer business info visible");
  await page.screenshot({ path: `${SHOTS}/01-landing-mobile.png`, fullPage: true });

  await page.goto("http://localhost:3000/community");
  await page.waitForURL("**/login", { timeout: 60000 }).catch(() => {});
  check("guest: /community redirects to /login", page.url().includes("/login"), page.url());

  const emailInputs = await page.locator('input[type="email"], input[type="password"]').count();
  check("login: no email/password inputs", emailInputs === 0);
  await expectText(page, "카카오로 로그인", "login: kakao login button present");
  await page.screenshot({ path: `${SHOTS}/02-login-mobile.png`, fullPage: true });
  await ctx.close();
}

// ============ 2. ONBOARDING (U1, fresh member) ============
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addCookies(mintCookies(U1, "tester@example.com"));
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(90000);

  await page.goto("http://localhost:3000/community");
  await page.waitForURL("**/onboarding", { timeout: 60000 }).catch(() => {});
  check("auth: incomplete onboarding gates /community -> /onboarding", page.url().includes("/onboarding"), page.url());

  await settle(page);
  await page.fill("#nickname", "무명배우A");
  await selectStable(page, "#actor_status", { label: "배우 지망생" });
  await selectStable(page, "#activity_field", { label: "독립영화" });
  await page.fill("#region", "서울");
  await page.getByRole("button", { name: "오프라인 모임" }).click();
  await page.getByRole("button", { name: "스터디" }).click();
  await page.screenshot({ path: `${SHOTS}/03-onboarding-filled.png`, fullPage: true });
  await page.getByRole("button", { name: "액트원 시작하기" }).click();
  await page.waitForURL("**/community", { timeout: 90000 }).catch(() => {});
  check("onboarding: submit redirects to /community", page.url().endsWith("/community"), page.url());

  const prof = (await sql("select nickname, onboarding_completed, member_level from profiles where id=$1", [U1])).rows[0];
  check("onboarding: profile saved (nickname/completed/new_member)",
    prof?.nickname === "무명배우A" && prof.onboarding_completed && prof.member_level === "new_member",
    JSON.stringify(prof));

  // ---- community home ----
  await expectText(page, "액트원 커뮤니티에 오신 것을 환영합니다", "home: pinned notice on top");
  await expectText(page, "오늘의 질문", "home: today's question section");
  await expectText(page, "배우 생존방", "home: category cards render");
  await page.screenshot({ path: `${SHOTS}/04-community-home.png`, fullPage: true });

  // ---- write a post ----
  await page.goto("http://localhost:3000/write");
  await settle(page);
  await selectStable(page, "#category_id", { label: "자유게시판" });
  await page.fill("#title", "E2E 테스트 글입니다");
  await page.fill("#content", "이 글은 엔드투엔드 테스트로 작성되었습니다. 열 자 이상입니다.");
  await page.fill("#tags", "테스트, E2E");
  await page.getByRole("button", { name: "등록하기" }).click();
  await page.waitForURL(/\/posts\/[0-9a-f-]+/, { timeout: 90000 }).catch(() => {});
  check("post: create redirects to detail", /\/posts\/[0-9a-f-]+/.test(page.url()), page.url());
  await expectText(page, "E2E 테스트 글입니다", "post: title rendered");
  await expectText(page, "무명배우A", "post: author nickname shown");
  await expectText(page, "신규회원", "post: member level badge shown");
  const postUrl = page.url();
  const postId = postUrl.split("/posts/")[1];

  // ---- comment ----
  await page.fill('textarea[name="content"]', "첫 번째 E2E 댓글입니다.");
  await page.getByRole("button", { name: "댓글 등록" }).click();
  await expectText(page, "첫 번째 E2E 댓글입니다.", "comment: appears after submit");

  // ---- like + bookmark ----
  await page.getByRole("button", { name: /좋아요 0/ }).click();
  await expectText(page, "좋아요 1", "like: count increments");
  await page.getByRole("button", { name: /북마크 0/ }).click();
  await expectText(page, "북마크 1", "bookmark: count increments");
  await page.screenshot({ path: `${SHOTS}/05-post-detail.png`, fullPage: true });

  const counters = (await sql("select like_count, bookmark_count, comment_count from posts where id=$1", [postId])).rows[0];
  check("db: post counters updated by triggers",
    counters?.like_count === 1 && counters.bookmark_count === 1 && counters.comment_count === 1,
    JSON.stringify(counters));

  // ---- meetup application link gating ----
  await sql("update offline_meetup_details set application_url='https://apply.example.com/first'");
  const meetupPost = (await sql(
    "select p.id from posts p join categories c on c.id=p.category_id where c.slug='offline-meetups' limit 1")).rows[0];
  await page.goto(`http://localhost:3000/posts/${meetupPost.id}`);
  await settle(page);
  await expectText(page, "오프라인 모임 신청 링크는 정회원부터 확인할 수 있습니다",
    "meetup: new_member sees restriction message");
  const linkCount = await page.locator('a[href="https://apply.example.com/first"]').count();
  check("meetup: application URL NOT in DOM for new_member", linkCount === 0);
  await page.screenshot({ path: `${SHOTS}/06-meetup-restricted.png`, fullPage: true });

  await sql("update profiles set member_level='regular_member' where id=$1", [U1]);
  await page.reload();
  await expectText(page, "모임 신청하기", "meetup: regular_member sees application button");
  const href = await page.locator("a", { hasText: "모임 신청하기" }).first().getAttribute("href");
  check("meetup: application URL correct for regular_member", href === "https://apply.example.com/first", String(href));
  await expectText(page, "정회원 전용", "meetup: regular-member-only badge shown");
  await page.screenshot({ path: `${SHOTS}/07-meetup-unlocked.png`, fullPage: true });

  // ---- search ----
  await page.goto("http://localhost:3000/search?q=E2E");
  await expectText(page, "E2E 테스트 글입니다", "search: finds post by keyword");

  // ---- my page ----
  await page.goto("http://localhost:3000/me");
  await expectText(page, "무명배우A", "me: profile card");
  await expectText(page, "정회원", "me: upgraded badge shown");
  await expectText(page, "E2E 테스트 글입니다", "me: my post listed");
  await page.screenshot({ path: `${SHOTS}/08-mypage.png`, fullPage: true });

  // ---- edit ----
  await page.goto(`http://localhost:3000/edit/${postId}`);
  await settle(page);
  await page.fill("#title", "E2E 테스트 글입니다 (수정됨)");
  await page.getByRole("button", { name: "수정하기" }).click();
  await page.waitForURL(`**/posts/${postId}`, { timeout: 90000 }).catch(() => {});
  await expectText(page, "E2E 테스트 글입니다 (수정됨)", "post: edit persists");

  // ---- resource submission ----
  await page.goto("http://localhost:3000/resources/submit");
  await settle(page);
  await page.fill("#title", "오디션 체크리스트 제보");
  await page.fill("#content", "E2E로 제출한 자료 제보입니다.");
  await page.getByRole("button", { name: "자료 제보하기" }).click();
  await expectText(page, "자료 제보가 접수되었습니다", "resources: submission confirmation message");

  // ---- report a seed post ----
  const seedPost = (await sql(
    "select p.id from posts p join categories c on c.id=p.category_id where c.slug='actor-survival' limit 1")).rows[0];
  await page.goto(`http://localhost:3000/posts/${seedPost.id}`);
  await settle(page);
  await settle(page);
  await page.getByRole("button", { name: "신고" }).first().click();
  await page.getByText("홍보 / 스팸").click();
  await page.getByRole("button", { name: "신고하기" }).click();
  await expectText(page, "신고가 접수되었습니다", "report: toast confirmation");

  // ---- soft delete own post ----
  page.on("dialog", (d) => d.accept());
  await page.goto(postUrl);
  await page.getByRole("button", { name: "삭제" }).first().click();
  await page.waitForURL("**/community", { timeout: 90000 }).catch(() => {});
  const st = (await sql("select status from posts where id=$1", [postId])).rows[0];
  check("post: soft delete sets status=deleted", st?.status === "deleted", JSON.stringify(st));
  await ctx.close();
}

// ============ 3. ADMIN SITE ============
{
  // second member for level-management test
  await sql(`insert into auth.users (id, email) values ($1, 'member2@example.com') on conflict do nothing`, [U2]);
  await sql(`update profiles set nickname='무명배우B', onboarding_completed=true where id=$1`, [U2]);

  const ctx = await browser.newContext({ viewport: { width: 1360, height: 850 } });
  await ctx.addCookies(mintCookies(U1, "tester@example.com"));
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(90000);

  // non-admin -> denied
  await page.goto("http://localhost:3001/");
  await page.waitForURL("**/denied", { timeout: 60000 }).catch(() => {});
  await expectText(page, "접근 권한이 없습니다", "admin: non-admin sees denied page");
  await expectText(page, "로그아웃", "admin: denied page has logout");
  await page.screenshot({ path: `${SHOTS}/09-admin-denied.png` });

  // grant admin (manual bootstrap per README)
  await sql("update profiles set role='admin' where id=$1", [U1]);
  await sql("insert into admin_users (user_id, email, is_active) values ($1,'tester@example.com',true) on conflict (user_id) do update set is_active=true", [U1]);

  await page.goto("http://localhost:3001/");
  await expectText(page, "대시보드", "admin: dashboard loads for real admin");
  await expectText(page, "전체 회원", "admin: stats cards render");
  await expectText(page, "대기 중 신고", "admin: pending reports stat");
  await page.screenshot({ path: `${SHOTS}/10-admin-dashboard.png`, fullPage: true });

  // members list + manual level change to tutor
  await page.goto("http://localhost:3001/members");
  await expectText(page, "무명배우B", "admin: members list shows member");
  await page.getByRole("link", { name: "무명배우B" }).click();
  await page.waitForURL(/\/members\/[0-9a-f-]+/, { timeout: 90000 }).catch(() => {});
  await settle(page);
  await selectStable(page, "#member_level", "tutor");
  await page.fill("#reason", "E2E 수동 튜터 인증");
  await page.getByRole("button", { name: "등급 변경" }).click();
  await expectText(page, "회원 등급이 변경되었습니다", "admin: manual level change succeeds");
  await expectText(page, "튜터", "admin: tutor badge displayed");
  const log = (await sql(
    "select change_type, new_level, changed_by from member_level_logs where user_id=$1 order by created_at desc limit 1", [U2])).rows[0];
  check("db: level change logged (manual, by admin)",
    log?.change_type === "manual" && log.new_level === "tutor" && log.changed_by === U1, JSON.stringify(log));
  await page.screenshot({ path: `${SHOTS}/11-admin-member-detail.png`, fullPage: true });

  // report management: resolve the report filed earlier
  await page.goto("http://localhost:3001/reports");
  await expectText(page, "홍보 / 스팸", "admin: report appears in list");
  await page.getByText("홍보 / 스팸").first().click();
  await page.waitForURL(/\/reports\/[0-9a-f-]+/, { timeout: 90000 }).catch(() => {});
  await settle(page);
  await page.getByText("신고 인정 (처리 완료)").click();
  await page.getByText("신고 인정 시 대상 콘텐츠 숨김 처리").click();
  await page.fill("#admin_note", "E2E 처리");
  await page.getByRole("button", { name: "처리하기" }).click();
  await expectText(page, "관리자 메모: E2E 처리", "admin: report resolved (status card updated)");
  const rep = (await sql("select status from reports order by created_at desc limit 1")).rows[0];
  const hidden = (await sql(
    "select p.status from posts p join categories c on c.id=p.category_id where c.slug='actor-survival' limit 1")).rows[0];
  check("db: report resolved + target hidden", rep?.status === "resolved" && hidden?.status === "hidden",
    JSON.stringify({ rep, hidden }));

  // resource submission approval -> creates resources post
  await page.goto("http://localhost:3001/submissions");
  await expectText(page, "오디션 체크리스트 제보", "admin: submission in list");
  await page.getByText("오디션 체크리스트 제보").click();
  await page.waitForURL(/\/submissions\/[0-9a-f-]+/, { timeout: 90000 }).catch(() => {});
  await settle(page);
  await page.getByText("승인 (자료실에 게시)").click();
  await page.getByRole("button", { name: "검토 완료" }).click();
  await page.waitForTimeout(2000);
  const approvedBadge = await page.getByText("승인", { exact: true }).count();
  check("admin: submission approved (badge updated)", approvedBadge >= 1);
  const resPost = (await sql(
    "select p.title from posts p join categories c on c.id=p.category_id where c.slug='resources' order by p.created_at desc limit 1")).rows[0];
  check("db: approval created resources post", resPost?.title === "오디션 체크리스트 제보", JSON.stringify(resPost));
  await page.screenshot({ path: `${SHOTS}/12-admin-submission.png`, fullPage: true });

  // member level rule settings page (default OFF)
  await page.goto("http://localhost:3001/settings");
  const enabled = await page.locator('input[name="enabled"]').isChecked();
  check("admin: auto-upgrade rule default OFF in UI", enabled === false);
  await page.screenshot({ path: `${SHOTS}/13-admin-settings.png`, fullPage: true });
  await ctx.close();
}

// ============ 4. resources post shows operator author on web ============
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addCookies(mintCookies(U2, "member2@example.com"));
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(90000);
  const resPost = (await sql(
    "select p.id from posts p join categories c on c.id=p.category_id where c.slug='resources' order by p.created_at desc limit 1")).rows[0];
  await page.goto(`http://localhost:3000/posts/${resPost.id}`);
  await expectText(page, "액트원 운영진", "resources: post displays operator author");
  await page.screenshot({ path: `${SHOTS}/14-resource-post.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
await db.end();

const failed = results.filter((r) => !r.ok);
console.log(`\n==== E2E SUMMARY: ${results.length - failed.length}/${results.length} passed ====`);
if (failed.length) { console.log("FAILED:", failed.map((f) => f.name).join(" | ")); process.exit(1); }
