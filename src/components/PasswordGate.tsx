"use client";

import { Lock } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState, useSyncExternalStore } from "react";

// Pre-release password screen. The check runs in the browser and the repository is public, so this only keeps
// casual visitors out; it is not access control. To change the password, set PASSWORD_SHA256 to
// sha256(SALT + new password) in hex. Remove this component (and `robots` in layout.tsx) at launch.
const SALT = "aw0-preview:";
const PASSWORD_SHA256 = "d5b1c493c319dc4ca0a4dd2bef4f06b131ea88cf26e776ceabd57569b05e5129";
const STORAGE_KEY = "aw0-preview-unlocked";

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const subscribe = () => () => {};

// Returning visitors skip the screen; a stored hash from an older password no longer matches.
function readRemembered() {
  try {
    return localStorage.getItem(STORAGE_KEY) === PASSWORD_SHA256;
  } catch {
    return false;
  }
}

export default function PasswordGate({ children }: { children: ReactNode }) {
  // null during the static prerender, so the exported HTML contains neither the page nor the form.
  const remembered = useSyncExternalStore(subscribe, readRemembered, () => null);
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (unlocked || remembered) return <>{children}</>;
  if (remembered === null) return <div className="pw-gate" aria-busy="true" />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if ((await sha256Hex(SALT + value)) !== PASSWORD_SHA256) {
      setError(true);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, PASSWORD_SHA256);
    } catch {}
    setUnlocked(true);
  };

  return (
    <main className="pw-gate">
      <form className="pw-gate__card" onSubmit={submit}>
        <Lock aria-hidden="true" className="pw-gate__icon" size={26} />
        <h1 className="pw-gate__title">Agentic World Action Models</h1>
        <p className="pw-gate__text">This project page is not public yet. Enter the password to view it.</p>
        <div className="pw-gate__row">
          <input
            aria-label="Password"
            autoComplete="current-password"
            autoFocus
            className="pw-gate__input"
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            type="password"
            value={value}
          />
          <button className="pw-gate__button" type="submit">
            View page
          </button>
        </div>
        {error ? (
          <p className="pw-gate__error" role="alert">
            Incorrect password.
          </p>
        ) : null}
      </form>
    </main>
  );
}
