import { ILLUSTRATIONS, type IllustrationName } from "@/components/brand/Illustrations";

// Shared compact page header: cream band, orange top rule, serif heading,
// a small illustration and optional key facts. Content starts right below,
// so the header says what the page is without taking the screen.

export interface HeroFact {
  label: string;
  value: React.ReactNode;
}

export default function PageHero({
  illustration,
  art,
  children,
  facts,
  narrow = false,
}: {
  illustration?: IllustrationName;
  /** A specific illustration component (e.g. a journal or policy theme). */
  art?: (p: { className?: string }) => React.ReactNode;
  children: React.ReactNode;
  facts?: HeroFact[];
  narrow?: boolean;
}) {
  const Art = art ?? (illustration ? ILLUSTRATIONS[illustration] : null);
  return (
    <section className="relative border-b border-border bg-ep-cream">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-ep-orange" />
      <div className="container mx-auto flex items-center gap-6 px-4 py-5 sm:py-6">
        {Art && (
          <div className="hidden w-[132px] shrink-0 sm:block lg:w-[150px]" aria-hidden>
            <Art className="h-auto w-full" />
          </div>
        )}
        <div
          className={`min-w-0 flex-1 ${narrow ? "max-w-4xl" : ""} [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:text-ep-brown sm:[&_h1]:text-[1.75rem] [&_h1]:mb-1.5 [&_h1+p]:max-w-3xl [&_h1+p]:text-sm [&_h1+p]:leading-relaxed [&_h1+p]:text-foreground/75`}
        >
          {children}
          {facts && facts.length > 0 && (
            <dl className="mt-3 flex flex-wrap gap-2 text-xs">
              {facts.map((f) => (
                <div key={f.label} className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="font-medium text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
