"use client";
import { Link } from "react-router-dom";

export interface RelatedLink {
  to: string;
  label: string;
  description?: string;
  external?: boolean;
}

interface RelatedLinksProps {
  links: RelatedLink[];
  heading?: string;
}

const RelatedLinks = ({ links, heading = "Related reading and next steps" }: RelatedLinksProps) => {
  return (
    <section aria-labelledby="related-links">
      <h2 id="related-links" className="text-base font-heading font-semibold text-foreground mb-2">
        {heading}
      </h2>
      <ul className="text-sm space-y-1.5 list-disc pl-5">
        {links.map((link) => (
          <li key={link.to}>
            {link.external ? (
              <a
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {link.label}
              </a>
            ) : (
              <Link to={link.to} className="text-primary hover:underline">
                {link.label}
              </Link>
            )}
            {link.description ? (
              <span className="text-muted-foreground"> — {link.description}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RelatedLinks;
