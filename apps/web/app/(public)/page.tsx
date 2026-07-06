import { ActOneHero } from "@/components/landing/act-one-hero";
import { StatsBand } from "@/components/landing/stats-band";
import { WaitingRoomPreview } from "@/components/landing/waiting-room-preview";
import { FindMyRoom } from "@/components/landing/find-my-room";
import { ShareCategories } from "@/components/landing/share-categories";
import { WhoItIsFor } from "@/components/landing/who-it-is-for";
import { ActOneManifesto } from "@/components/landing/manifesto";
import { SafetyPreview } from "@/components/landing/safety-preview";
import { SocialChannels } from "@/components/landing/social-channels";
import { FinalCta } from "@/components/landing/final-cta";
import { ScrollFx } from "@/components/landing/scroll-fx";

export default function LandingPage() {
  return (
    <div>
      <ScrollFx />
      <ActOneHero />
      <StatsBand />
      <WaitingRoomPreview />
      <FindMyRoom />
      <ShareCategories />
      <WhoItIsFor />
      <ActOneManifesto />
      <SafetyPreview />
      <SocialChannels />
      <FinalCta />
    </div>
  );
}
