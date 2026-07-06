export const siteConfig = {
  name: "액트원",
  description:
    "액트원은 오디션 정보, 현장 후기, 오프라인 모임, 스터디, 배우 생존 이야기를 함께 나누는 배우 커뮤니티입니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://actone.kr",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_SITE_URL ?? "https://admin.actone.kr",
  company: {
    name: "브릿로드",
    ceo: "장재백",
    businessNumber: "411-27-22249",
    address: "경기도 화성시 병점구 효행로 1068, 604-F87호(병점동, 리더스프라자)",
    phone: "010-5706-8387",
  },
  // Empty string = link not ready yet → UI shows "준비 중입니다".
  socialLinks: {
    instagram: "https://www.instagram.com/act_one_community",
    kakaoChannel: "",
    threads: "https://www.threads.net/@act_one_community",
    tiktok: "",
    youtube: "https://youtube.com/channel/UCgKEO5aVdEOQH_TzxSXwfwg",
  },
  // display handles shown next to the social labels
  socialHandles: {
    instagram: "act_one_community",
    kakaoChannel: "",
    threads: "act_one_community",
    tiktok: "",
    youtube: "장재백_액트원 · @액트원",
  },
} as const;

export type SocialLinkKey = keyof typeof siteConfig.socialLinks;
