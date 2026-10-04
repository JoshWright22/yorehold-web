"use client";

// The sign-in corner of the nav. It asks the site who is signed in after the page loads, so the
// layout itself reads no cookie and the placeholder and docs pages can stay static.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Who {
  id: string;
  name: string;
}

export default function NavSession() {
  const pathname = usePathname();
  const [user, setUser] = useState<Who | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((body: { user: Who | null }) => {
        if (cancelled) return;
        setUser(body.user ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!loaded) return <div className="nav-session" aria-hidden="true" />;

  if (!user) {
    return (
      <div className="nav-session">
        <Link href="/login">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="nav-session">
      <Link href="/account">{user.name || "Account"}</Link>
      <form action="/logout" method="post">
        <button type="submit" className="link-button">
          Sign out
        </button>
      </form>
    </div>
  );
}
