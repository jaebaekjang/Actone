/**
 * Decorative stage props for the landing page — pure CSS/inline-SVG, no images.
 * All exports are aria-hidden and pointer-events-none: they never carry content.
 */

/** two bold warm spotlight beams from the top corners; place inside a relative section */
export function StageSpotlights() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="stage-spotlight-left" />
      <div className="stage-spotlight-right" />
    </div>
  );
}

/**
 * Film camera on a tripod, filming the stage. Large, visible silhouette.
 * Points right by default; pass className="scale-x-[-1]" to mirror.
 */
export function StageCamera({
  className,
  glintId = "stage-camera-glint",
}: {
  className?: string;
  glintId?: string;
}) {
  return (
    <svg viewBox="0 0 160 180" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={glintId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#e8b36a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      {/* tripod legs */}
      <line x1="80" y1="120" x2="30" y2="170" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="80" y1="120" x2="130" y2="170" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="80" y1="120" x2="80" y2="175" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      {/* pan-tilt head */}
      <circle cx="80" cy="110" r="12" fill="currentColor" />
      {/* camera body */}
      <rect x="48" y="50" width="64" height="52" rx="6" fill="currentColor" />
      {/* film reel (left) */}
      <circle cx="62" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="10" />
      <circle cx="62" cy="32" r="6" fill="currentColor" />
      {/* film reel (right) */}
      <circle cx="98" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="10" />
      <circle cx="98" cy="32" r="6" fill="currentColor" />
      {/* lens barrel */}
      <rect x="106" y="58" width="38" height="28" rx="4" fill="currentColor" />
      {/* lens element */}
      <circle cx="135" cy="72" r="14" fill="currentColor" />
      {/* lens glint */}
      <circle cx="135" cy="72" r="10" fill={`url(#${glintId})`} />
      {/* recording light */}
      <circle cx="62" cy="104" r="5" fill="#dc2626" opacity="0.8" />
    </svg>
  );
}

/** standing microphone at center stage (curtain-call band) */
export function MicStand({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 112" aria-hidden="true" className={className}>
      {/* mic head grille */}
      <ellipse cx="24" cy="14" rx="13" ry="15" fill="currentColor" />
      {/* grille shine */}
      <ellipse cx="20" cy="8" rx="4" ry="5" fill="rgba(255, 248, 220, 0.6)" />
      {/* neck connector */}
      <rect x="20" y="28" width="8" height="12" fill="currentColor" />
      {/* pole — thick and present */}
      <rect x="21.5" y="40" width="5" height="60" rx="2.5" fill="currentColor" />
      {/* base ring */}
      <ellipse cx="24" cy="104" rx="18" ry="5" fill="currentColor" opacity="0.7" />
      {/* base stand */}
      <ellipse cx="24" cy="108" rx="20" ry="6" fill="currentColor" />
    </svg>
  );
}

/** microphone icon for CTA buttons — small inline SVG */
export function MicrophoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      {/* mic head capsule */}
      <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" />
      {/* neck */}
      <rect x="11" y="12" width="2" height="4" />
      {/* stand base */}
      <path d="M6 17a6 6 0 0 0 12 0" strokeWidth="2" stroke="currentColor" fill="none" />
      <path d="M12 20v2M8 20h8" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}
