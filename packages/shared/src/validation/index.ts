import { z } from "zod";
import {
  ACTIVITY_FIELD_OPTIONS,
  ACTOR_STATUS_OPTIONS,
  EXPECTATION_OPTIONS,
  REPORT_REASONS,
} from "../constants";

const optionalUrl = z
  .string()
  .trim()
  .url("올바른 링크 형식이 아닙니다.")
  .or(z.literal(""))
  .optional()
  .transform((v) => (v ? v : null));

export const onboardingSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(20, "닉네임은 20자 이하여야 합니다."),
  actor_status: z.enum(ACTOR_STATUS_OPTIONS, {
    errorMap: () => ({ message: "현재 상태를 선택해주세요." }),
  }),
  activity_field: z.enum(ACTIVITY_FIELD_OPTIONS, {
    errorMap: () => ({ message: "활동 분야를 선택해주세요." }),
  }),
  region: z.string().trim().min(1, "활동 지역을 입력해주세요.").max(30),
  expectation: z
    .array(z.enum(EXPECTATION_OPTIONS))
    .min(1, "기대하는 활동을 1개 이상 선택해주세요."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const profileEditSchema = z.object({
  nickname: z.string().trim().min(2, "닉네임은 2자 이상이어야 합니다.").max(20),
  actor_status: z.enum(ACTOR_STATUS_OPTIONS),
  activity_field: z.enum(ACTIVITY_FIELD_OPTIONS),
  region: z.string().trim().min(1, "활동 지역을 입력해주세요.").max(30),
  bio: z.string().trim().max(300, "소개는 300자 이하여야 합니다.").optional().default(""),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;

export const meetupDetailsSchema = z.object({
  region: z.string().trim().max(30).optional().default(""),
  meetup_date: z.string().trim().optional().default(""),
  meetup_time: z.string().trim().optional().default(""),
  venue: z.string().trim().max(100).optional().default(""),
  capacity: z.coerce.number().int().min(1).max(999).optional().nullable(),
  fee: z.string().trim().max(50).optional().default(""),
  application_url: optionalUrl,
  is_regular_member_only: z.boolean().optional().default(true),
});

export type MeetupDetailsInput = z.infer<typeof meetupDetailsSchema>;

export const postSchema = z.object({
  category_id: z.string().uuid("카테고리를 선택해주세요."),
  title: z.string().trim().min(2, "제목은 2자 이상이어야 합니다.").max(100, "제목은 100자 이하여야 합니다."),
  content: z.string().trim().min(10, "내용은 10자 이상이어야 합니다.").max(20000),
  tags: z.array(z.string().trim().min(1).max(20)).max(5, "태그는 최대 5개까지 입력할 수 있습니다."),
  meetup: meetupDetailsSchema.optional(),
});

export type PostInput = z.infer<typeof postSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "댓글은 2자 이상이어야 합니다.")
    .max(1000, "댓글은 1000자 이하여야 합니다."),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const reportSchema = z.object({
  target_type: z.enum(["post", "comment"]),
  target_id: z.string().uuid(),
  reason: z.enum(REPORT_REASONS, {
    errorMap: () => ({ message: "신고 사유를 선택해주세요." }),
  }),
  detail: z.string().trim().max(500, "상세 내용은 500자 이하여야 합니다.").optional().default(""),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const resourceSubmissionSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요.").max(100),
  content: z.string().trim().min(1, "내용을 입력해주세요.").max(20000),
  source_url: optionalUrl,
  submission_reason: z.string().trim().max(500).optional().default(""),
});

export type ResourceSubmissionInput = z.infer<typeof resourceSubmissionSchema>;

export const regularMemberRuleSchema = z.object({
  enabled: z.boolean(),
  minDaysAfterJoin: z.coerce.number().int().min(0).max(365),
  minPostCount: z.coerce.number().int().min(0).max(1000),
  minCommentCount: z.coerce.number().int().min(0).max(1000),
  maxReceivedReports: z.coerce.number().int().min(0).max(100),
});

export type RegularMemberRuleInput = z.infer<typeof regularMemberRuleSchema>;

export const noticeSchema = z.object({
  title: z.string().trim().min(2, "제목은 2자 이상이어야 합니다.").max(100),
  content: z.string().trim().min(10, "내용은 10자 이상이어야 합니다.").max(20000),
  is_pinned: z.boolean().optional().default(false),
});

export type NoticeInput = z.infer<typeof noticeSchema>;

export const READ_LEVELS = ["guest", "new_member", "regular_member", "tutor"] as const;
export const WRITE_LEVELS = ["new_member", "regular_member", "tutor", "admin"] as const;

export const categoryEditSchema = z.object({
  name: z.string().trim().min(1).max(30),
  description: z.string().trim().max(300).optional().default(""),
  sort_order: z.coerce.number().int().min(0).max(999),
  is_active: z.boolean(),
  icon: z.string().trim().max(8).optional().default(""),
  intro: z.string().trim().max(500).optional().default(""),
  read_level: z.enum(READ_LEVELS),
  write_level: z.enum(WRITE_LEVELS),
  comment_level: z.enum(WRITE_LEVELS),
  requires_approval: z.boolean(),
  is_anonymous: z.boolean(),
  max_images: z.coerce.number().int().min(0).max(10),
  allow_tags: z.boolean(),
});

export type CategoryEditInput = z.infer<typeof categoryEditSchema>;
