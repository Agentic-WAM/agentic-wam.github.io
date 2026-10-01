"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_POSTER, HERO_VIDEO } from "@/data/aw0";
import episodes from "@/data/taskEpisodes.json";
import { asset } from "@/lib/asset";

// Full-screen hero in two stages:
//   1. the demo plays clean — no dark veil, no title;
//   2. the first scroll down fades the demo towards black and brings in the
//      AW-0 title *without moving the page*. The page stays pinned until the
//      title has fully appeared AND the visitor starts a new scroll gesture
//      (or has kept scrolling for HOLD_MAX_MS more); only then does it move on.
// Back at the top, a fresh upward scroll reverses it: the title and the veil
// fade out and the clean demo returns (pinned the same way).
// The demo is the teaser video (HERO_VIDEO) once it exists, otherwise a muted
// mosaic of the eight real-world task episodes. Below 820px the template makes
// the hero a compact banner, so there the title simply follows the scroll
// position (shown once the page scrolls, gone at the top; no pinning).

type Phase = "clean" | "revealed" | "hiding";

const REVEAL_MS = 1500; // letters + tagline have settled by then (see aw0.css)
const HIDE_MS = 600; // title + chrome fade-out (see aw0.css)
const GESTURE_GAP_MS = 280; // wheel events closer than this are one gesture (incl. trackpad inertia)
// After the animation, wheel input that never pauses (a wheel rolled non-stop,
// Magic Mouse / trackpad momentum) is let through after this long instead of
// keeping the page pinned indefinitely.
const HOLD_MAX_MS = 800;
// Chrome/Safari group wheel events into one scroll sequence until the pointer
// moves or ~0.5 s passes without wheel input. A sequence whose first event we
// cancelled may not scroll natively afterwards, so we scroll it ourselves.
const WHEEL_SEQUENCE_END_MS = 600;
const COMPACT_MAX_WIDTH = 820; // globals.css compact-hero breakpoint
const DOWN_KEYS = new Set(["ArrowDown", "PageDown", "End", " "]);
const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

function useScrollGatedHero() {
  const [phase, setPhaseState] = useState<Phase>("clean");

  useEffect(() => {
    let phase: Phase = "clean";
    let locked = false;
    let unlockAt = 0;
    let lastWheel = 0;
    let touchY = 0;
    let lastY = window.scrollY;
    // Set when a scroll lands the page back at the top: the rest of that same
    // gesture must not also dismiss the title — only a fresh one may.
    let arrivedAtTop = false;
    let hideTimer: number | undefined;
    // Wheel input since the last release that the browser may still count as
    // the cancelled sequence; we scroll it via scrollBy.
    let manual = false;
    let pending = 0;
    let raf = 0;
    let pointerMoved = false;
    let px = -1;
    let py = -1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fullScreen = () => window.innerWidth > COMPACT_MAX_WIDTH;
    const atTop = () => window.scrollY <= 1;

    const setPhase = (next: Phase) => {
      phase = next;
      setPhaseState(next);
    };
    const pin = (ms: number) => {
      locked = true;
      manual = false;
      pending = 0;
      unlockAt = performance.now() + (reduced ? 300 : ms);
    };
    const stepManual = () => {
      const move = Math.abs(pending) <= 1 ? pending : pending * 0.35;
      pending -= move;
      window.scrollBy({ top: move, behavior: "instant" });
      raf = Math.abs(pending) > 0.5 ? requestAnimationFrame(stepManual) : 0;
    };
    const scrollManually = (dy: number) => {
      pending += dy;
      if (!raf) raf = requestAnimationFrame(stepManual);
    };
    const reveal = (pinned: boolean) => {
      if (phase === "revealed") return;
      window.clearTimeout(hideTimer);
      setPhase("revealed");
      if (pinned) pin(REVEAL_MS);
    };
    const hide = (pinned: boolean) => {
      if (phase !== "revealed") return;
      setPhase("hiding");
      hideTimer = window.setTimeout(() => setPhase("clean"), HIDE_MS);
      if (pinned) pin(HIDE_MS);
    };

    // Swallow scroll input while pinned. Once the animation has finished, the
    // page is released by a new gesture (a pause or a pointer move), or after
    // HOLD_MAX_MS of uninterrupted input. Returns true when it consumed the event.
    const gate = (e: Event, newGesture: boolean, dir: "down" | "up" | null, sameWheelSequence = false) => {
      if (locked) {
        const now = performance.now();
        if (now < unlockAt || (!newGesture && now < unlockAt + HOLD_MAX_MS)) {
          e.preventDefault();
          return true;
        }
        locked = false;
        manual = sameWheelSequence;
      }
      if (!fullScreen() || !atTop() || !dir) return false;
      if (dir === "down" && phase === "clean") {
        e.preventDefault();
        reveal(true);
        return true;
      }
      if (dir === "up" && phase === "revealed") {
        if (arrivedAtTop && !newGesture) return false;
        arrivedAtTop = false;
        e.preventDefault();
        hide(true);
        return true;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      const gap = now - lastWheel;
      const newGesture = gap > GESTURE_GAP_MS || pointerMoved;
      const sameWheelSequence = gap <= WHEEL_SEQUENCE_END_MS && !pointerMoved;
      pointerMoved = false;
      lastWheel = now;
      if (manual && !sameWheelSequence) manual = false;
      if (gate(e, newGesture, e.deltaY > 0 ? "down" : e.deltaY < 0 ? "up" : null, sameWheelSequence)) return;
      if (manual) {
        e.preventDefault();
        scrollManually(e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY);
      }
    };
    // Browsers end a wheel sequence when the pointer moves (the scroll that
    // makes the page re-render also fires mousemove, but without movement).
    const onMouseMove = (e: MouseEvent) => {
      if (px >= 0 && Math.abs(e.clientX - px) + Math.abs(e.clientY - py) > 3) pointerMoved = true;
      px = e.clientX;
      py = e.clientY;
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      arrivedAtTop = false; // a new touch is always a new gesture
      if (locked && performance.now() >= unlockAt) locked = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (locked) {
        e.preventDefault();
        return;
      }
      const dy = touchY - (e.touches[0]?.clientY ?? touchY);
      if (Math.abs(dy) > 6) gate(e, false, dy > 0 ? "down" : "up");
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const down = DOWN_KEYS.has(e.key) && !(e.key === " " && e.shiftKey);
      const up = UP_KEYS.has(e.key) || (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, [contenteditable='true']")) return;
      gate(e, !e.repeat, down ? "down" : "up");
    };
    // Scrollbar drags, anchor links, scroll restoration, and the compact hero.
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 1) reveal(false);
      else if (lastY > 1) {
        if (fullScreen()) arrivedAtTop = true;
        else hide(false);
      }
      lastY = y;
    };

    const initial = requestAnimationFrame(onScroll);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(initial);
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return phase;
}

export default function Hero() {
  const phase = useScrollGatedHero();
  // Letters keep their final pose while the title fades out.
  const lettersOn = phase === "clean" ? undefined : "true";

  return (
    <section className="article-hero aw-hero" data-state={phase}>
      <div className="article-hero__sticky">
        {HERO_VIDEO ? <TeaserVideo src={asset(HERO_VIDEO)} poster={asset(HERO_POSTER)} /> : <EpisodeMosaic />}
        <div aria-hidden="true" className="aw-hero__veil" />
        <div className="article-hero__title" data-revealed={lettersOn}>
          <div aria-hidden="true" className="article-hero__wordmark">
            {"AW-0".split("").map((ch, i) => (
              <span className="article-hero__letter" key={i} style={{ animationDelay: `${i * 90}ms` }}>
                {ch}
              </span>
            ))}
          </div>
          <p className="hero-tagline">
            Agentic <em>World Action</em> Model
          </p>
        </div>
        {/* Always visible, including on the clean first screen, so visitors know to scroll. */}
        <a className="scroll-cue" href="#article-content">
          Scroll to explore
        </a>
      </div>
    </section>
  );
}

// Start each tile at a different point of its episode so the wall looks alive.
const START_AT = [0.18, 0.42, 0.3, 0.55, 0.25, 0.5, 0.35, 0.45];

function EpisodeMosaic() {
  const wallRef = useRef<HTMLDivElement | null>(null);

  // Decode only while the hero is on screen.
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        for (const v of wall.querySelectorAll("video")) {
          if (entry.isIntersecting) v.play().catch(() => undefined);
          else v.pause();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(wall);
    return () => io.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="aw-hero__mosaic" ref={wallRef}>
      {episodes.map((ep, i) => (
        <video
          autoPlay
          key={ep.id}
          loop
          muted
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (Number.isFinite(v.duration)) v.currentTime = v.duration * START_AT[i % START_AT.length];
          }}
          playsInline
          preload="auto"
          src={asset(ep.video)}
        />
      ))}
    </div>
  );
}

// The teaser clip, as on the T-Rex page: a black curtain hides the page until
// the video can play through (with timeout / error / <noscript> escape hatches).
function TeaserVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let lifted = false;
    const lift = () => {
      if (lifted) return;
      lifted = true;
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        void video.play().catch(() => {});
      }
      setReady(true);
    };
    const fallback = window.setTimeout(lift, 15000);
    const video = videoRef.current;
    if (!video) return () => window.clearTimeout(fallback);
    video.addEventListener("canplaythrough", lift);
    video.addEventListener("error", lift);
    const cached = video.readyState >= 4 ? window.setTimeout(lift, 0) : undefined;
    return () => {
      video.removeEventListener("canplaythrough", lift);
      video.removeEventListener("error", lift);
      window.clearTimeout(fallback);
      if (cached !== undefined) window.clearTimeout(cached);
    };
  }, []);

  useEffect(() => {
    if (ready) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [ready]);

  // Chrome pauses video-only media in background tabs; resume on return.
  useEffect(() => {
    const resume = () => {
      const video = videoRef.current;
      if (!video || document.hidden || !video.paused) return;
      void video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", resume);
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);

  return (
    <>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".hero-curtain{display:none}" }} />
      </noscript>
      <div aria-hidden="true" className={`hero-curtain${ready ? " hero-curtain--lifted" : ""}`} />
      <video
        aria-label="AW-0 rapid-cut montage of six robot manipulation tasks"
        autoPlay
        className="article-hero__video"
        loop
        muted
        playsInline
        poster={poster}
        preload="auto"
        ref={videoRef}
        src={src}
      />
    </>
  );
}
