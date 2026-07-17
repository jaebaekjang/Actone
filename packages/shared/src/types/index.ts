import type { MemberLevel, Role } from "../constants";

export interface Profile {
  id: string;
  kakao_id: string | null;
  email: string | null;
  nickname: string | null;
  avatar_url: string | null;
  actor_status: string | null;
  activity_field: string | null;
  region: string | null;
  expectation: string[];
  bio: string | null;
  role: Role;
  member_level: MemberLevel;
  is_suspended: boolean;
  onboarding_completed: boolean;
  member_level_updated_at: string | null;
  member_level_updated_by: string | null;
  member_level_note: string | null;
  suspended_until: string | null;
  suspend_reason: string | null;
  warning_count: number;
  last_active_at: string | null;
  marketing_opt_in: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
}

/** subset exposed to other members via the public_profiles view */
export interface PublicProfile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  member_level: MemberLevel;
  is_suspended: boolean;
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string | null;
  is_active: boolean;
  role_key: string;
  last_login_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminRole {
  id: string;
  key: string;
  label: string;
  description: string | null;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPermissionRow {
  id: string;
  key: string;
  label: string;
  category: string;
  sort_order: number;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  summary: string | null;
  before_data: unknown;
  after_data: unknown;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminNote {
  id: string;
  target_type: string;
  target_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  icon: string | null;
  intro: string | null;
  cover_image_url: string | null;
  read_level: "guest" | "new_member" | "regular_member" | "tutor";
  write_level: "new_member" | "regular_member" | "tutor" | "admin";
  comment_level: "new_member" | "regular_member" | "tutor" | "admin";
  requires_approval: boolean;
  is_anonymous: boolean;
  max_images: number;
  allow_tags: boolean;
  created_at: string;
  updated_at: string;
}

export type PostStatus = "published" | "hidden" | "deleted";

export interface Post {
  id: string;
  category_id: string;
  author_id: string | null;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  is_pinned: boolean;
  status: PostStatus;
  view_count: number;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithRelations extends Post {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  author?: PublicProfile | null;
}

/** safe columns from offline_meetup_public view — never contains application_url */
export interface MeetupPublicDetails {
  id: string;
  post_id: string;
  region: string | null;
  meetup_date: string | null;
  meetup_time: string | null;
  venue: string | null;
  capacity: number | null;
  fee: string | null;
  is_regular_member_only: boolean;
  has_application_url: boolean;
}

export interface OfflineMeetupDetails extends Omit<MeetupPublicDetails, "has_application_url"> {
  application_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string | null;
  content: string;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  author?: PublicProfile | null;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  target_type: "post" | "comment";
  target_id: string;
  reason: string;
  detail: string | null;
  status: "pending" | "resolved" | "dismissed";
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ResourceSubmission {
  id: string;
  submitter_id: string | null;
  title: string;
  content: string;
  source_url: string | null;
  submission_reason: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberLevelLog {
  id: string;
  user_id: string;
  previous_level: string | null;
  new_level: string;
  changed_by: string | null;
  change_type: "manual" | "automatic";
  reason: string | null;
  created_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface RegularMemberRule {
  enabled: boolean;
  minDaysAfterJoin: number;
  minPostCount: number;
  minCommentCount: number;
  maxReceivedReports: number;
}

export const DEFAULT_REGULAR_MEMBER_RULE: RegularMemberRule = {
  enabled: false,
  minDaysAfterJoin: 7,
  minPostCount: 1,
  minCommentCount: 3,
  maxReceivedReports: 0,
};
