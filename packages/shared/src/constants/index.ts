export const MEMBER_LEVELS = ["new_member", "regular_member", "tutor"] as const;
export type MemberLevel = (typeof MEMBER_LEVELS)[number];

export const MEMBER_LEVEL_LABELS: Record<MemberLevel, string> = {
  new_member: "신규회원",
  regular_member: "정회원",
  tutor: "튜터",
};

/** board access-level gate labels (categories.read/write/comment_level) */
export const BOARD_LEVEL_LABELS: Record<string, string> = {
  guest: "누구나(비회원 포함)",
  new_member: "신규회원 이상",
  regular_member: "정회원 이상",
  tutor: "튜터 이상",
  admin: "관리자만",
};

export const ROLES = ["member", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  member: "일반회원",
  admin: "관리자",
};

// ---------------------------------------------------------------------------
// admin RBAC (must match supabase/migrations/0004_admin_superadmin.sql)
// ---------------------------------------------------------------------------
export const ADMIN_PERMISSIONS = [
  "dashboard.view",
  "members.view",
  "members.manage",
  "members.level",
  "members.suspend",
  "members.pii",
  "members.export",
  "community.view",
  "community.manage",
  "reports.manage",
  "audition.manage",
  "meetup.view",
  "meetup.manage",
  "meetup.pii",
  "resource.manage",
  "notification.send",
  "site.manage",
  "seo.manage",
  "marketing.manage",
  "data.manage",
  "automation.manage",
  "system.admins",
  "system.roles",
  "system.logs",
  "system.external",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  "dashboard.view": "대시보드 조회",
  "members.view": "회원 조회",
  "members.manage": "회원 정보 수정",
  "members.level": "회원 등급 변경",
  "members.suspend": "회원 정지/해제",
  "members.pii": "회원 개인정보 조회",
  "members.export": "회원 CSV 다운로드",
  "community.view": "게시판/게시글 조회",
  "community.manage": "게시판/게시글/댓글 관리",
  "reports.manage": "신고 처리",
  "audition.manage": "오디션 게시판 관리",
  "meetup.view": "모임 조회",
  "meetup.manage": "모임/신청자 관리",
  "meetup.pii": "신청자 개인정보 조회",
  "resource.manage": "자료실 승인/반려",
  "notification.send": "알림/메시지 발송",
  "site.manage": "사이트 CMS/디자인",
  "seo.manage": "SEO 설정",
  "marketing.manage": "마케팅/픽셀/분석",
  "data.manage": "데이터/구글시트/내보내기",
  "automation.manage": "자동화 규칙",
  "system.admins": "관리자 계정 관리",
  "system.roles": "역할/권한 관리",
  "system.logs": "관리자 활동 로그",
  "system.external": "외부 코드 관리",
};

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  super_admin: "최고관리자",
  member_admin: "회원 관리자",
  community_admin: "커뮤니티 관리자",
  audition_admin: "오디션 게시판 관리자",
  meetup_admin: "오프라인 모임 관리자",
  resource_admin: "자료 관리자",
  marketing_admin: "마케팅 관리자",
  viewer: "데이터 조회 전용",
};

export const ADMIN_ACTIVITY_ACTION_LABELS: Record<string, string> = {
  "member.level_change": "회원 등급 변경",
  "member.suspend": "회원 정지",
  "member.unsuspend": "회원 정지 해제",
  "post.status_change": "게시글 상태 변경",
  "post.pin": "게시글 고정 변경",
  "comment.status_change": "댓글 상태 변경",
  "report.resolve": "신고 처리",
  "submission.review": "자료 제보 처리",
  "notice.save": "공지 작성/수정",
  "category.update": "카테고리 수정",
  "admin.toggle_active": "관리자 활성/비활성",
  "admin.add": "관리자 등록",
  "admin.role_change": "관리자 역할 변경",
  "settings.update": "설정 변경",
};

export const ACTOR_STATUS_OPTIONS = [
  "배우 지망생",
  "활동 중인 배우",
  "연극 배우",
  "독립영화 배우",
  "휴식 중",
  "다시 시작 준비 중",
  "기타",
] as const;

export const ACTIVITY_FIELD_OPTIONS = [
  "연극",
  "독립영화",
  "단편영화",
  "웹드라마",
  "광고",
  "숏폼",
  "아직 없음",
  "기타",
] as const;

export const EXPECTATION_OPTIONS = [
  "오프라인 모임",
  "오디션 정보",
  "현장 후기",
  "배우 고민 공유",
  "스터디",
  "자료실",
] as const;

export const REPORT_REASONS = [
  "욕설 / 비하",
  "허위 정보",
  "개인정보 노출",
  "실명 저격",
  "명예훼손 우려",
  "홍보 / 스팸",
  "기타",
] as const;

export const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  resolved: "처리 완료",
  dismissed: "기각",
};

export const POST_STATUS_LABELS: Record<string, string> = {
  published: "게시됨",
  hidden: "숨김",
  deleted: "삭제됨",
};

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  pending: "검토 대기",
  approved: "승인",
  rejected: "반려",
};

// canonical category slugs (must match supabase/seed.sql)
export const CATEGORY_SLUGS = {
  offlineMeetups: "offline-meetups",
  actorSurvival: "actor-survival",
  auditionInfo: "audition-info",
  study: "study",
  fieldReviews: "field-reviews",
  freeBoard: "free-board",
  resources: "resources",
  notices: "notices",
} as const;

export const ADMIN_ONLY_CATEGORY_SLUGS: string[] = [
  CATEGORY_SLUGS.resources,
  CATEGORY_SLUGS.notices,
];

export const OPERATOR_AUTHOR_NAME = "액트원 운영진";

export const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "comments", label: "댓글 많은 순" },
  { value: "bookmarks", label: "북마크 많은 순" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const MAX_POST_IMAGES = 5;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const FIELD_REVIEW_WARNING =
  "실명 저격, 확인되지 않은 폭로, 명예훼손 우려가 있는 표현은 관리자에 의해 숨김 처리될 수 있습니다. 경험 공유는 가능하지만, 개인 공격은 금지됩니다.";

export const MEETUP_LINK_RESTRICTED_MESSAGE =
  "오프라인 모임 신청 링크는 정회원부터 확인할 수 있습니다.";

export const MEETUP_LINK_SUSPENDED_MESSAGE =
  "현재 계정 상태에서는 오프라인 모임 신청 링크를 확인할 수 없습니다.";

export const RESOURCE_SUBMITTED_MESSAGE =
  "자료 제보가 접수되었습니다. 관리자가 확인 후 자료실 게시 여부를 결정합니다.";

export const REPORT_SUBMITTED_MESSAGE =
  "신고가 접수되었습니다. 관리자가 확인 후 조치하겠습니다.";

export const ADMIN_ACCESS_DENIED_MESSAGE = "접근 권한이 없습니다.\n관리자에게 문의해주세요.";

// rotates by day-of-year on community home
export const TODAY_QUESTIONS = [
  "요즘 연기하면서 가장 크게 느끼는 감정은 무엇인가요?",
  "최근에 본 작품 중 '이 역할 해보고 싶다' 싶었던 캐릭터가 있나요?",
  "오디션 전 긴장을 푸는 나만의 루틴이 있나요?",
  "배우를 시작하고 처음으로 '잘했다'고 느꼈던 순간은 언제인가요?",
  "연기가 늘고 있다는 걸 스스로 어떻게 확인하시나요?",
  "포기하고 싶었던 순간, 다시 붙잡게 해준 건 무엇이었나요?",
  "함께 연습할 동료가 있다면 어떤 연습을 가장 해보고 싶나요?",
] as const;
