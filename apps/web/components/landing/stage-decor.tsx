/**
 * Decorative stage props for the landing page — pure CSS/inline-SVG, no images.
 * All exports are aria-hidden and pointer-events-none: they never carry content.
 */

/** two warm spotlight beams from the top corners; place inside a relative section */
export function StageSpotlights() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="stage-spotlight-left" />
      <div className="stage-spotlight-right" />
    </div>
  );
}

/**
 * Film-camera silhouette filming the stage: two reels, a body, a lens with a
 * warm glint, and a tripod. Points right by default — mirror with -scale-x-100.
 * Pass a unique glintId when rendering more than one per page.
 */
export function StageCamera({
  className,
  glintId = "stage-camera-glint",
}: {
  className?: string;
  glintId?: string;
}) {
  return (
    <svg viewBox="0 0 150 150" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={glintId} cx="38%" cy="35%" r="72%">
          <stop offset="0%" stopColor="#f8f1dc" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#e8b36a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      {/* film reels */}
      <circle cx="44" cy="26" r="14" fill="none" stroke="currentColor" strokeWidth="9" />
      <circle cx="82" cy="28" r="10" fill="none" stroke="currentColor" strokeWidth="7" />
      {/* body */}
      <rect x="26" y="42" width="66" height="40" rx="7" fill="currentColor" />
      {/* lens cone */}
      <path d="M92 50 L120 42 V82 L92 74 Z" fill="currentColor" />
      {/* lens glint */}
      <circle cx="116" cy="62" r="8" fill={`url(#${glintId})`} />
      {/* tripod */}
      <path
        d="M59 82 L38 138 M59 82 L80 138 M59 82 V136"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** standing microphone waiting at center stage (curtain-call band) */
export function MicStand({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 96" aria-hidden="true" className={className}>
      {/* head + grille shine */}
      <circle cx="24" cy="13" r="11" fill="currentColor" />
      <circle cx="20" cy="9" r="3.5" fill="rgba(248, 241, 220, 0.55)" />
      {/* neck */}
      <path d="M18 23 h12 l-2.5 11 h-7 Z" fill="currentColor" />
      {/* pole */}
      <rect x="22.4" y="34" width="3.2" height="48" fill="currentColor" />
      {/* base */}
      <ellipse cx="24" cy="86" rx="15" ry="4.5" fill="currentColor" />
    </svg>
  );
}
