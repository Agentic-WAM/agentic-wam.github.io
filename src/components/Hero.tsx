"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO } from "@/data/aw0";
import episodes from "@/data/taskEpisodes.json";
import { asset } from "@/lib/asset";

// Full-screen hero in the ENPIRE style. With a teaser video (HERO_VIDEO) it plays
// that clip edge to edge, like the T-Rex page. Until one exists it shows a muted
// mosaic of the eight real-world task episodes under the AW-0 wordmark.
export default function Hero() {
  return HERO_VIDEO ? <VideoHero src={asset(HERO_VIDEO)} /> : <MosaicHero />;
}

// Start each tile at a different point of its episode so the wall looks alive.
const START_AT = [0.18, 0.42, 0.3, 0.55, 0.25, 0.5, 0.35, 0.45];

function MosaicHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setRevealed(true), 250);
    return () => window.clearTimeout(t);
  }, []);

  // Decode only while the hero is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        for (const v of videoRefs.current) {
          if (!v) continue;
          if (entry.isIntersecting) v.play().catch(() => undefined);
          else v.pause();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const word = "AW-0";

  return (
    <section className="article-hero aw-hero" ref={sectionRef}>
      <div className="article-hero__sticky">
        <div className="aw-hero__mosaic" aria-hidden="true">
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
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={asset(ep.video)}
            />
          ))}
        </div>
        <div className="aw-hero__veil" aria-hidden="true" />
        <div className="article-hero__title" data-revealed={revealed ? "true" : undefined}>
          <div className="article-hero__wordmark" aria-hidden="true">
            {word.split("").map((ch, i) => (
              <span
                className="article-hero__letter"
                key={i}
                style={{ animationDelay: `${i * 110}ms` }}
              >
                {ch}
              </span>
            ))}
          </div>
          <p className="hero-tagline">
            Agentic <em>World Action</em> Model
          </p>
          <p className="aw-hero__sub">Code, future video, and actions — generated jointly.</p>
        </div>
        <p className="aw-hero__note">Head-camera views of the eight real-world tasks</p>
        <a className="scroll-cue" href="#article-content">
          Scroll to explore
        </a>
      </div>
    </section>
  );
}

// Same behaviour as the T-Rex hero: a black curtain hides the page until the
// teaser can play through, with a timeout / error / <noscript> escape hatch.
function VideoHero({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let lifted = false;
    const reveal = () => {
      if (lifted) return;
      lifted = true;
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        void video.play().catch(() => {});
      }
      setRevealed(true);
    };
    const fallback = window.setTimeout(reveal, 15000);
    const video = videoRef.current;
    if (!video) return () => window.clearTimeout(fallback);
    video.addEventListener("canplaythrough", reveal);
    video.addEventListener("error", reveal);
    const cached = video.readyState >= 4 ? window.setTimeout(reveal, 0) : undefined;
    return () => {
      video.removeEventListener("canplaythrough", reveal);
      video.removeEventListener("error", reveal);
      window.clearTimeout(fallback);
      if (cached !== undefined) window.clearTimeout(cached);
    };
  }, []);

  useEffect(() => {
    if (revealed) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [revealed]);

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
      <div aria-hidden="true" className={`hero-curtain${revealed ? " hero-curtain--lifted" : ""}`} />
      <section className="article-hero">
        <div className="article-hero__sticky">
          <video
            aria-label="AW-0 overview"
            autoPlay
            className="article-hero__video"
            loop
            muted
            playsInline
            preload="auto"
            ref={videoRef}
            src={src}
          />
          <a className="scroll-cue" href="#article-content">
            Scroll to explore
          </a>
        </div>
      </section>
    </>
  );
}
