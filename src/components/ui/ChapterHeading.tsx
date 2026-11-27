import { cn } from "@/lib/utils";

type ChapterVariant = "split" | "stack" | "overlay" | "ledger";
type ChapterTone = "ink" | "cream";

type ChapterHeadingProps = {
  index: string;
  title: string;
  intro?: string;
  kicker?: string;
  variant?: ChapterVariant;
  tone?: ChapterTone;
  className?: string;
  id?: string;
};

/** A shared editorial chapter marker with composition-specific variants. */
export function ChapterHeading({
  index,
  title,
  intro,
  kicker,
  variant = "split",
  tone = "ink",
  className,
  id,
}: ChapterHeadingProps) {
  return (
    <div
      className={cn(
        "chapter",
        `chapter-${variant}`,
        tone === "cream" && "chapter-cream",
        className,
      )}
    >
      <span className="chapter-index" aria-hidden="true">{index}</span>
      <div className="chapter-body">
        {kicker ? <p className="eyebrow chapter-kicker">{kicker}</p> : null}
        <h2 id={id} className="chapter-title">{title}</h2>
        {intro ? <p className="chapter-intro">{intro}</p> : null}
      </div>
    </div>
  );
}

/** A restrained numeral rail for sections that keep their existing content layout. */
export function ChapterMark({
  index,
  className,
}: {
  index: string;
  className?: string;
}) {
  return (
    <div className={cn("chapter-mark", className)} aria-hidden="true">
      <span className="chapter-mark-index">{index}</span>
      <span className="chapter-mark-rule" />
    </div>
  );
}
