"use client";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Send, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
const epLogo = "/ep-journals-logo.png";
import GlobalSearch from "@/components/GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type NavItem =
  | { to: string; label: string }
  | { label: string; children: Array<{ to: string; label: string; description?: string }> };

const knowledgeCentreChildren = [
  { to: "/guides",       label: "Guides",              description: "How publishing works" },
  { to: "/comparisons",  label: "Comparisons",         description: "Side-by-side decisions" },
  { to: "/publishing",   label: "Publishing by Field", description: "Field-specific references" },
  { to: "/resources",    label: "Resources",           description: "For students & early-career authors" },
];

const navItems: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/journals", label: "Journals" },
  { to: "/articles", label: "Articles" },
  { label: "Knowledge Centre", children: knowledgeCentreChildren },
  { to: "/indexing", label: "Indexing" },
  { to: "/authors", label: "Author Guidelines" },
  { to: "/publication-process", label: "Publication Process" },
  { to: "/editorial", label: "Editorial Board" },
  { to: "/policies", label: "Policies" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  // True when any of the Knowledge Centre child paths is active.
  const knowledgeActive = knowledgeCentreChildren.some((c) => isActive(c.to));

  const navLinkClass = (active: boolean) =>
    `px-2.5 py-2 text-xs whitespace-nowrap transition-colors flex items-center gap-1 ${
      active
        ? "text-ep-orange border-b-2 border-ep-orange"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top row: Logo + Name + Mobile toggle */}
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={epLogo}
              alt="EP Journals Group logo"
              className="h-10 w-auto"
              width={111}
              height={120}
              fetchPriority="high"
              decoding="async"
            />
            <div>
              <span className="text-base font-heading font-semibold text-foreground whitespace-nowrap">EP Journals Group</span>
              <span className="hidden sm:block text-[11px] text-muted-foreground leading-tight">Academic Publishing Organisation</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Button asChild size="sm" className="hidden sm:inline-flex h-8 text-xs mr-1">
              <Link to="/submit">
                <Send className="h-3 w-3 mr-1" />
                Submit Paper
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Desktop Navigation - second row */}
        <nav className="hidden lg:flex items-center border-t border-border -mx-4 px-4 overflow-x-auto">
          {navItems.map((item) => {
            if ("children" in item) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className={navLinkClass(knowledgeActive) + " focus:outline-none"}>
                    {item.label}
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72">
                    {item.children.map((c) => (
                      <DropdownMenuItem key={c.to} asChild>
                        <Link to={c.to} className="flex flex-col items-start gap-0.5 cursor-pointer">
                          <span className="text-sm font-medium">{c.label}</span>
                          {c.description && (
                            <span className="text-xs text-muted-foreground">{c.description}</span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <Link key={item.to} to={item.to} className={navLinkClass(isActive(item.to))}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-border">
            <nav className="flex flex-col">
              {navItems.map((item) => {
                if ("children" in item) {
                  return (
                    <div key={item.label}>
                      <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground font-heading font-semibold">
                        {item.label}
                      </p>
                      {item.children.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`px-6 py-2.5 text-sm min-h-[44px] flex items-center transition-colors ${
                            isActive(c.to)
                              ? "text-ep-orange bg-muted"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 text-sm min-h-[44px] flex items-center transition-colors ${
                      isActive(item.to)
                        ? "text-ep-orange bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/submit"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm min-h-[44px] flex items-center gap-2 text-primary font-medium bg-accent"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Paper
              </Link>
            </nav>
          </div>
        )}
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Header;
