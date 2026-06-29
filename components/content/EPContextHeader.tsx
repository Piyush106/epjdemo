"use client";
import { Link } from "react-router-dom";

/**
 * A short contextual byline that appears just above the body of every Knowledge
 * Centre guide. It establishes EP Journals Group as the publisher of the guide
 * (which strengthens topical authority for "EP Journals Group" as a brand
 * search) and gives readers a one-line orientation of what EP does.
 *
 * Tone: factual, not advertising. Sized like an editorial standfirst, not a
 * promotional banner.
 */
const EPContextHeader = ({ category }: { category: "guide" | "comparison" | "publishing" | "user-focused" }) => {
  const lead =
    category === "comparison"
      ? "This comparison"
      : category === "publishing"
        ? "This publishing reference"
        : category === "user-focused"
          ? "This author resource"
          : "This guide";

  return (
    <aside className="mb-6 pb-3 border-b border-border/60 text-xs text-muted-foreground leading-relaxed">
      {lead} is part of the Knowledge Centre maintained by{" "}
      <Link to="/about" className="text-primary hover:underline font-medium">EP Journals Group</Link>
      , an open access publisher of six peer-reviewed academic journals covering engineering and technology,
      economics and finance, management, natural sciences, social sciences, and education and finance. All journals
      operate under documented{" "}
      <Link to="/policies/peer-review-process" className="text-primary hover:underline">double-blind peer review</Link>
      {" "}with two independent reviewers, assign{" "}
      <Link to="/guides/what-is-doi" className="text-primary hover:underline">CrossRef DOIs</Link>
      {" "}on acceptance, and publish under a CC BY 4.0 licence.
    </aside>
  );
};

export default EPContextHeader;
