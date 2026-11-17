import { ILLUSTRATIONS, type IllustrationName } from "@/components/brand/Illustrations";

// Shared page header used across the site (same treatment as /indexing):
// cream band, orange top rule, serif heading, optional illustration.
// Existing hero content is passed through as children, so page wording and
// links are unchanged; headings and lead text are restyled consistently.

export default function PageHero({
  illustration,
  children,
  narrow = false,
}: {
  illustration?: IllustrationName;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  const Art = illustration ? ILLUSTRATIONS[illustration] : null;
  return (
    <section className="relative overflow-hidden border-b border-border bg-ep-cream">
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-ep-orange" />
      <div className={`container mx-auto grid items-center gap-8 px-4 py-9 sm:py-12 ${Art ? "md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_320px]" : ""}`}>
        <div
          className={`min-w-0 ${narrow ? "max-w-4xl" : "max-w-3xl"} [&_h1]:font-heading [&_h1]:text-[1.75rem] [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:text-ep-brown sm:[&_h1]:text-[2.25rem] [&_h1]:mb-3 [&_h1+p]:text-base [&_h1+p]:leading-relaxed [&_h1+p]:text-foreground/80`}
        >
          {children}
        </div>
        {Art && (
          <div className="hidden md:block">
            <Art className="h-auto w-full max-w-[320px]" />
          </div>
        )}
      </div>
    </section>
  );
}
