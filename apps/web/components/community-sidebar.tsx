import Link from "next/link";
import { CATEGORY_SLUGS, type Category, type PostWithRelations } from "@actone/shared";
import { CategoryIndex } from "./category-index";

function RailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** 커뮤니티 홈 데스크톱 우측 레일. */
export function CommunitySidebar({
  categories,
  popular,
  todayQuestion,
}: {
  categories: Category[];
  popular: PostWithRelations[];
  todayQuestion: string;
}) {
  return (
    <div className="space-y-10">
      <RailSection title="오늘의 질문">
        <p className="text-[15px] font-medium leading-[1.7] text-foreground">
          {todayQuestion}
        </p>
        <Link
          href={`/write?category=${CATEGORY_SLUGS.freeBoard}`}
          className="mt-2.5 inline-block text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent-soft"
        >
          이 질문에 답해보기
        </Link>
      </RailSection>

      {popular.length > 0 ? (
        <RailSection title="지금 인기 글">
          <ol className="border-t">
            {popular.map((post, i) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="flex gap-3 border-b py-2.5 transition-colors duration-150 hover:text-accent-soft"
                >
                  <span className="tnum w-5 shrink-0 pt-px text-xs text-muted/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="line-clamp-2 text-sm leading-snug text-foreground">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </RailSection>
      ) : null}

      <RailSection title="게시판">
        <CategoryIndex categories={categories} />
      </RailSection>

      <RailSection title="회원 등급">
        <dl className="space-y-2.5 text-[13px] leading-relaxed text-muted">
          <div>
            <dt className="inline font-medium text-foreground">신규회원</dt>
            <dd className="inline"> — 온보딩을 마치면 시작되는 기본 등급</dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">정회원</dt>
            <dd className="inline"> — 오프라인 모임 신청 링크 열람 가능</dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">튜터</dt>
            <dd className="inline"> — 운영진이 직접 인증한 신뢰 회원</dd>
          </div>
        </dl>
      </RailSection>
    </div>
  );
}
