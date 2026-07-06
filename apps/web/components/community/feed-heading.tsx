/** Community feed section heading — amber eyebrow + bold title, reveals on scroll. */
export function FeedHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div data-reveal>
      <p className="text-xs font-bold tracking-wide text-accent">{eyebrow}</p>
      <h2 className="mt-1.5 text-[1.35rem] font-extrabold leading-tight tracking-tight text-foreground md:text-2xl">
        {title}
      </h2>
      {sub ? <p className="mt-1.5 text-sm text-dim">{sub}</p> : null}
    </div>
  );
}
