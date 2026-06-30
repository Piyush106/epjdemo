"use client";

// Compatibility shim: lets components written for react-router-dom run unchanged
// under Next.js. tsconfig aliases "react-router-dom" to this file.

import NextLink from "next/link";
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, ...rest },
  ref,
) {
  // Defensive: a nullish/empty href makes next/link call url.format(undefined),
  // which throws "Cannot destructure property 'auth'…" during SSR/SSG. Fall back
  // to a plain anchor so a single bad link can't crash a prerendered page.
  if (to == null || to === "") {
    return <a ref={ref} {...rest} />;
  }
  return <NextLink ref={ref} href={to} replace={replace} {...rest} />;
});

export const NavLink = Link;

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, opts?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    if (opts?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname() || "/";
  // Read search lazily on the client to avoid forcing a Suspense boundary on
  // every page that only needs pathname (e.g. Header active-link logic).
  const search = typeof window !== "undefined" ? window.location.search : "";
  return { pathname, search, hash: "", state: null, key: "default" };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  return (useNextParams() ?? {}) as unknown as T;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>) => void] {
  const sp = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const params = new URLSearchParams(sp?.toString() ?? "");
  const setParams = (next: URLSearchParams | Record<string, string>) => {
    const usp = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    router.push(`${pathname}?${usp.toString()}`);
  };
  return [params, setParams];
}

// No-op components for SPA-only router primitives, in case any are referenced.
export function BrowserRouter({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
export function Routes({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
export function Route() {
  return null;
}
export function Outlet({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
