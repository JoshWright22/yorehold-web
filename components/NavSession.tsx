"use client";

// The account corner of the top bar. It asks the site who is signed in after the page loads, so
// the layout itself reads no cookie and the placeholder and docs pages can stay static.

import Link from "next/link";
import { Avatar } from "./Appearance";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Who {
  id: string;
  name: string;
}

export default function NavSession() {
  const pathname = usePathname();
  const [user, setUser] = useState<Who | null>(null);
  const [loaded, setLoaded] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let cancelled = false;
    menuRef.current?.removeAttribute("open");
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
        <Link href="/login" className="button ghost small">
          Sign in
        </Link>
        <Link href="/login?mode=signup" className="button primary small">
          Join
        </Link>
      </div>
    );
  }

  const name = user.name || "Account";
  const profile = "/u/" + encodeURIComponent(user.name || user.id) + "?id=" + encodeURIComponent(user.id);

  return (
    <div className="nav-session">
      <details className="account-menu" ref={menuRef}>
        <summary title={name}>
          <Avatar userId={user.id} name={name} size="small" />
          <span className="sr-only">{name}</span>
        </summary>
        <div className="account-drop">
          <p className="account-drop-name">{name}</p>
          <Link href="/account?tab=characters">Characters</Link>
          <Link href="/account?tab=favourites">Favourites</Link>
          <Link href="/account?tab=content">Your content</Link>
          <Link href={profile}>Public profile</Link>
          <Link href="/account?tab=settings">Settings</Link>
          <form action="/logout" method="post">
            <button type="submit" className="link-button">
              Sign out
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
