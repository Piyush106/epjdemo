"use client";
import { Link } from "react-router-dom";
import MetaTags from "@/components/MetaTags";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <MetaTags
        title="Page Not Found | EP Journals Group"
        description="The requested page does not exist on this site."
        noindex
      />
      <div className="text-left border border-border bg-card p-6 max-w-md">
        <h1 className="mb-3 text-2xl font-heading font-semibold text-foreground">404 — Page not found</h1>
        <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
          The requested resource does not exist on this site. If the address was entered manually, please verify the path.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Return to the publisher homepage or consult the policy and journal indexes.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <Link to="/" className="text-primary hover:underline">
            Home
          </Link>
          <Link to="/journals" className="text-primary hover:underline">
            Journals
          </Link>
          <Link to="/policies" className="text-primary hover:underline">
            Policies
          </Link>
          <Link to="/contact" className="text-primary hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
