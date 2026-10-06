"use client";

// The pieces that show a player's own picture and background, and the form that sets them.

import { useState, type ReactNode } from "react";
import { artStyle } from "./ui";
import { fitImage, setAppearance, useAppearance } from "@/lib/appearance";

export function Avatar({ userId, name, size }: { userId: string; name: string; size?: "small" | "large" }) {
  const { avatar } = useAppearance(userId);
  const className = "avatar" + (size ? " " + size : "");
  if (avatar) {
    // A data URL from this browser; next/image has nothing to optimise here.
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className + " picture"} src={avatar} alt="" />;
  }
  return (
    <span className={className} aria-hidden="true">
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

// The profile's banner: the player's own background if they set one, a stock picture if not.
export function ProfileCover({ userId, children }: { userId: string; children?: ReactNode }) {
  const { cover } = useAppearance(userId);
  return (
    <div className="banner profile-banner" style={cover ? { "--art": `url(${cover})` } as React.CSSProperties : artStyle("peaks")} aria-hidden="true">
      {children}
    </div>
  );
}

function Picker({ label, note, onPick, onClear, has }: { label: string; note: string; onPick: (file: File) => void; onClear: () => void; has: boolean }) {
  return (
    <div className="look-picker">
      <label className="button secondary small">
        {has ? "Change " + label.toLowerCase() : "Add " + label.toLowerCase()}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onPick(file);
            event.target.value = "";
          }}
        />
      </label>
      {has ? (
        <button type="button" className="button ghost small" onClick={onClear}>
          Remove
        </button>
      ) : null}
      <span className="look-note">{note}</span>
    </div>
  );
}

export function AppearanceForm({ userId }: { userId: string }) {
  const look = useAppearance(userId);
  const [message, setMessage] = useState("");

  async function pick(kind: "avatar" | "cover", file: File) {
    if (file.size > 15 * 1024 * 1024) {
      setMessage("That picture is over 15 MB.");
      return;
    }
    try {
      // The avatar is shown at most 8rem across; the background fills the page width.
      const fitted = kind === "avatar" ? await fitImage(file, 256, 256) : await fitImage(file, 1600, 400);
      setMessage(setAppearance(userId, { [kind]: fitted }) ? "Saved in this browser." : "The browser would not keep it; try a smaller picture.");
    } catch {
      setMessage("That file could not be read as a picture.");
    }
  }

  return (
    <section className="look-form">
      <h2>Picture and background</h2>
      <Picker label="Picture" note="Square, shown beside your name and in the top bar." has={!!look.avatar} onPick={(file) => pick("avatar", file)} onClear={() => setAppearance(userId, { avatar: null })} />
      <Picker label="Background" note="Wide, shown across the top of your profile." has={!!look.cover} onPick={(file) => pick("cover", file)} onClear={() => setAppearance(userId, { cover: null })} />
      <p className="look-note">
        {message || "Kept in this browser for now; other players see them once accounts store pictures."}
      </p>
    </section>
  );
}
