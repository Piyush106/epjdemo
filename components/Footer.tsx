"use client";
import { Link } from "react-router-dom";
import { useJournals } from "@/hooks/useJournals";

// Strip the /index.php/<slug> portion of an OJS URL to get the journal homepage.
const journalHomepage = (externalUrl: string) => externalUrl.replace(/\/index\.php\/.*$/, "");

const Footer = () => {
  const { data: journals = [] } = useJournals();
  return (
    <footer className="bg-primary text-primary-foreground border-t border-border">
      <div className="container mx-auto px-4 py-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div>
            <h3 className="font-heading font-semibold text-primary-foreground mb-2 text-sm border-b border-primary-foreground/20 pb-1.5">
              Publisher
            </h3>
            <p className="text-primary-foreground/90 leading-relaxed mb-2">
              <strong>EP Journals Group</strong>
            </p>
            <p className="text-primary-foreground/75 leading-relaxed">
              Publisher of peer-reviewed scholarly journals operating under a documented governance framework. Editorial
              decisions are based on scholarly merit and peer review, and the portfolio is published on a monthly frequency.
            </p>
            <p className="text-primary-foreground/65 leading-relaxed mt-2">
              Country / jurisdiction: <span className="text-primary-foreground/80">Published and administered internationally</span>
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-primary-foreground mb-2 text-sm border-b border-primary-foreground/20 pb-1.5">
              Journals
            </h3>
            <ul className="space-y-1 text-primary-foreground/75">
              {journals.map((j) => (
                <li key={j.abbrev}>
                  <a
                    className="hover:underline"
                    href={journalHomepage(j.external_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {j.title} ({j.abbrev})
                  </a>
                </li>
              ))}
              <li className="pt-2 border-t border-primary-foreground/10">
                <Link className="hover:underline" to="/journals">
                  Journals list (publisher site)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-primary-foreground mb-2 text-sm border-b border-primary-foreground/20 pb-1.5">
              Policies
            </h3>
            <ul className="space-y-1 text-primary-foreground/75">
              <li>
                <Link className="hover:underline" to="/policies/publication-ethics">
                  Publication Ethics
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/policies/peer-review-process">
                  Peer Review Process
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/policies/editorial-policies">
                  Editorial Policies
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/policies/corrections-retractions">
                  Corrections & Retractions
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/policies/open-access">
                  Open Access
                </Link>
              </li>
              <li className="pt-2 border-t border-primary-foreground/10">
                <Link className="hover:underline" to="/policies">
                  Complete policy index
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-primary-foreground mb-2 text-sm border-b border-primary-foreground/20 pb-1.5">
              Administration
            </h3>
            <div className="text-primary-foreground/75 space-y-2">
              <p>
                Official contact email:
                <br />
                <a className="hover:underline" href="mailto:editor@ep-journals.org">
                  editor@ep-journals.org
                </a>
              </p>
              <p className="text-primary-foreground/65 leading-relaxed">
                Administrative note: Correspondence is logged for governance and audit purposes. Editorial enquiries answered within 24 hours. Editorial decisions typically within 1–2 weeks.
              </p>
              <p className="text-primary-foreground/60 leading-relaxed">
                Compliance disclaimer: Indexing claims and database listings are subject to verification by the respective
                agencies.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-6 pt-4 text-xs text-primary-foreground/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <p>© {new Date().getFullYear()} EP Journals Group. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              <Link className="hover:underline" to="/about">About</Link>
              <Link className="hover:underline" to="/journals">Journals</Link>
              <Link className="hover:underline" to="/indexing">Indexing</Link>
              <Link className="hover:underline" to="/policies">Policies</Link>
              <Link className="hover:underline" to="/policies/publication-ethics">Ethics</Link>
              <Link className="hover:underline" to="/policies/peer-review-process">Peer Review</Link>
              <Link className="hover:underline" to="/contact">Contact</Link>
            </div>
          </div>
          <p className="mt-2 leading-relaxed text-primary-foreground/55">
            EP Journals Group operates under a documented policy framework. Editorial decisions are independent and are
            grounded in peer review and scholarly assessment. All journals are peer-reviewed, open-access, and published monthly. 
            Indexing claims are subject to verification by the respective agencies.
          </p>
          <p className="mt-1 text-primary-foreground/45">
            Last site update: April 2026
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
