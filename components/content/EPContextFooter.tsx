"use client";
import { Link } from "react-router-dom";
import { Send, BookOpen, Award } from "lucide-react";

/**
 * A soft call-to-action that appears at the end of every Knowledge Centre
 * guide. It mirrors the "About the publisher" block that legitimate journals
 * place at the foot of their content pages — informational rather than
 * advertising. Three concrete value points (peer review timeline, APC
 * structure, indexing) and two practical links (Submit, Browse journals).
 *
 * Placed AFTER the FAQ so that readers who finish the article are gently
 * funnelled toward submission or further exploration.
 */
const EPContextFooter = () => {
  return (
    <aside className="mt-10 mb-2 border border-border bg-secondary/40 p-5">
      <p className="text-[11px] font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        About the publisher
      </p>
      <h2 className="text-base font-heading font-semibold text-foreground mb-2">
        Considering EP Journals Group for your next paper?
      </h2>
      <p className="text-sm text-foreground leading-relaxed mb-4">
        EP Journals Group publishes six peer-reviewed open access journals across engineering, economics,
        management, natural sciences, social sciences, and education. We operate a documented editorial workflow
        with transparent timelines and clear ethics policies — designed in particular for students, early-career
        researchers, and authors without large research budgets.
      </p>
      <div className="grid sm:grid-cols-3 gap-3 mb-5 text-xs">
        <div className="flex items-start gap-2">
          <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-semibold text-foreground">1–2 week peer review</p>
            <p className="text-muted-foreground">Double-blind, two independent reviewers</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-semibold text-foreground">Affordable APC</p>
            <p className="text-muted-foreground">Fee waivers for unfunded researchers</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Send className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-semibold text-foreground">CrossRef DOI</p>
            <p className="text-muted-foreground">Permanent citation on every accepted article</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        <Link
          to="/submit"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
        >
          <Send className="h-3 w-3" />
          Submit a manuscript
        </Link>
        <Link
          to="/journals"
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-foreground hover:bg-muted transition-colors font-medium"
        >
          <BookOpen className="h-3 w-3" />
          Browse our journals
        </Link>
        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          About EP Journals Group →
        </Link>
      </div>
    </aside>
  );
};

export default EPContextFooter;
