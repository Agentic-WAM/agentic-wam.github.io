"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ZoomableImage from "@/components/ZoomableImage";
import { PLATFORM_LABEL, RUBRICS, type Platform } from "@/data/aw0";
import episodes from "@/data/taskEpisodes.json";
import { asset } from "@/lib/asset";
import { highlightPythonLine } from "@/lib/pythonHighlight";

// Code-aligned episode player: a post-training demonstration from each of the
// 8 real-world tasks plays next to its program label, and the code block that
// explains the current frame lights up (same episodes, blocks and frame ranges
// as the paper's "Real-world Task Progress" appendix figures).

type Episode = (typeof episodes)[number];

// Block colours of the paper figure (make_task_keyframe_drawio.PALETTE).
const PALETTE: [string, string][] = [
  ["#DAE8FC", "#6C8EBF"],
  ["#D5E8D4", "#82B366"],
  ["#FFE6CC", "#D79B00"],
  ["#E1D5E7", "#9673A6"],
  ["#F8CECC", "#B85450"],
  ["#FFF2CC", "#D6B656"],
  ["#B0E3E6", "#0E8088"],
  ["#F5F5F5", "#666666"],
  ["#E6D0DE", "#996185"],
  ["#BAC8D3", "#23445D"],
];
const color = (b: number) => PALETTE[b % PALETTE.length];

const SPEEDS = [1, 2, 4, 8] as const;
const PLATFORMS: Platform[] = ["yam", "sharpa"];

// Figure pixel sizes (public/figures/tasks/*.webp), for the zoomable paper figure.
const FIG_SIZE: Record<string, [number, number]> = {
  arrange_fruits: [2400, 1593],
  pack_backpack: [2400, 1891],
  replace_lightbulb: [2400, 1891],
  fold_and_stack_towels: [2400, 2690],
  arrange_fruits_sharpa: [2400, 1980],
  deal_poker: [2400, 1580],
  flip_scoreboard: [2400, 1327],
  solve_rubiks_cube: [2400, 1788],
};

export default function TaskEpisodePlayer({ figureNumber }: { figureNumber: number }) {
  const [activeId, setActiveId] = useState(episodes[0].id);
  const [view, setView] = useState<"episode" | "figure">("episode");
  const ep = useMemo(() => episodes.find((e) => e.id === activeId) ?? episodes[0], [activeId]);

  return (
    <figure className="aw-figure tp">
      <div className="tp-groups">
        {PLATFORMS.map((p) => (
          <div className="tp-group" key={p}>
            <span className="tp-group__label">{PLATFORM_LABEL[p]}</span>
            <div className="tp-group__pills" role="tablist">
              {episodes
                .filter((e) => e.platform === p)
                .map((e) => (
                  <button
                    aria-selected={e.id === activeId}
                    className="aw-pill"
                    data-active={e.id === activeId}
                    key={e.id}
                    onClick={() => setActiveId(e.id)}
                    role="tab"
                    type="button"
                  >
                    {e.label}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="tp-viewtabs" role="tablist" aria-label="View">
        <button aria-selected={view === "episode"} data-active={view === "episode"} onClick={() => setView("episode")} role="tab" type="button">
          Episode + aligned code
        </button>
        <button aria-selected={view === "figure"} data-active={view === "figure"} onClick={() => setView("figure")} role="tab" type="button">
          Key frames (paper figure)
        </button>
      </div>

      {view === "episode" ? (
        <EpisodeView ep={ep} key={ep.id} />
      ) : (
        <div className="tp-figure">
          <ZoomableImage
            alt={`Key frames and code label of ${ep.label}`}
            className="fig-img"
            height={FIG_SIZE[ep.id]?.[1] ?? 1600}
            src={asset(ep.figure)}
            width={FIG_SIZE[ep.id]?.[0] ?? 2400}
          />
        </div>
      )}

      <details className="tp-rubric">
        <summary>Grading rubric — {ep.label}</summary>
        <ul>
          {(RUBRICS[ep.id] ?? []).map((r) => (
            <li key={r.text}>
              <b>{r.pts}</b> {r.text}
            </li>
          ))}
        </ul>
        <p>Each task is graded with an additive rubric that awards independent partial credit for each completed sub-step.</p>
      </details>

      <figcaption>
        Figure {figureNumber}: Program labels aligned with demonstrations. Each post-training episode (head camera) is
        annotated by the agentic pipeline with a program; every colour-coded block is linked to the frames it explains,
        and the block for the current frame lights up as the video plays. Click a band on the timeline to jump to that
        step.
      </figcaption>
    </figure>
  );
}

function EpisodeView({ ep }: { ep: Episode }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const speed = SPEEDS[speedIndex];

  const totalFrames = ep.segments[ep.segments.length - 1].end + 1;
  const frame = Math.floor(time * ep.fps);
  const segIndex = ep.segments.findIndex((s) => frame >= s.start && frame <= s.end);
  const seg = segIndex >= 0 ? ep.segments[segIndex] : null;
  const activeBlock = seg ? seg.block : -1;
  // First line number of each block (numbering runs through the whole program).
  const firstLine = useMemo(() => ep.blocks.map((_, b) => 1 + ep.blocks.slice(0, b).reduce((n, bl) => n + bl.length, 0)), [ep]);

  // Smooth playhead while playing (timeupdate only fires a few times a second).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v) setTime(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  // Keep the active block in view inside the code panel (never scrolls the page).
  useEffect(() => {
    const panel = codeRef.current;
    const el = activeBlock >= 0 ? blockRefs.current[activeBlock] : null;
    if (!panel || !el) return;
    const top = el.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
    const bottom = top + el.offsetHeight;
    if (top < panel.scrollTop || bottom > panel.scrollTop + panel.clientHeight) {
      panel.scrollTo({ top: Math.max(0, top - 12), behavior: "smooth" });
    }
  }, [activeBlock]);

  const seekFrame = (f: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min((f + 0.5) / ep.fps, (v.duration || Infinity) - 0.05);
    setTime(v.currentTime);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => undefined);
    else v.pause();
  };

  return (
    <div className="tp-main">
      <div className="tp-left">
        <p className="tp-instruction">
          <b>Task instruction:</b> {ep.instruction}
        </p>
        <div className="tp-video">
          <video
            autoPlay
            muted
            onClick={togglePlay}
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = speed;
              setDuration(e.currentTarget.duration || 0);
            }}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            loop
            playsInline
            preload="metadata"
            ref={videoRef}
            src={asset(ep.video)}
          />
          <span className="tp-video__tag">
            {speed}× · {formatTime(time)} / {formatTime(duration)}
          </span>
        </div>
        <div className="tp-controls">
          <button aria-label={playing ? "Pause" : "Play"} className="aw-btn" onClick={togglePlay} type="button">
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            aria-label={`Playback speed ${speed}x`}
            className="aw-btn"
            onClick={() => setSpeedIndex((i) => (i + 1) % SPEEDS.length)}
            type="button"
          >
            {speed}×
          </button>
          <div className="tp-timeline" aria-label="Aligned code segments">
            {ep.segments.map((s, i) => {
              const [bg, border] = color(s.block);
              return (
                <button
                  aria-label={`Jump to step ${i + 1}`}
                  className="tp-band"
                  data-active={i === segIndex ? "true" : undefined}
                  key={i}
                  onClick={() => seekFrame(s.start)}
                  style={{
                    left: `${(s.start / totalFrames) * 100}%`,
                    width: `${((s.end - s.start + 1) / totalFrames) * 100}%`,
                    background: bg,
                    borderColor: border,
                  }}
                  title={`Block ${s.block + 1}${"label" in s && s.label ? ` · ${s.label}` : ""} · frames ${s.start}–${s.end}`}
                  type="button"
                />
              );
            })}
            <span className="tp-playhead" style={{ left: `${Math.min(100, (frame / totalFrames) * 100)}%` }} />
          </div>
        </div>
        <p className="tp-status">
          {seg ? (
            <>
              Step {segIndex + 1} of {ep.segments.length} · block {seg.block + 1}
              {"label" in seg && seg.label ? ` (${seg.label})` : ""} · frames {seg.start}–{seg.end}
            </>
          ) : (
            <>Between labelled steps</>
          )}
        </p>
      </div>

      <div className="tp-code" ref={codeRef}>
        {ep.blocks.map((block, b) => {
          const [bg, border] = color(b);
          return (
            <div
              className="tp-block"
              data-active={b === activeBlock ? "true" : undefined}
              data-dim={activeBlock >= 0 && b !== activeBlock ? "true" : undefined}
              key={b}
              onClick={() => {
                const first = ep.segments.find((s) => s.block === b);
                if (first) seekFrame(first.start);
              }}
              ref={(el) => {
                blockRefs.current[b] = el;
              }}
              style={{ background: bg, borderLeftColor: border }}
            >
              {block.map((line, li) => (
                <div className="code-line" data-grey={line.executed ? undefined : "true"} key={li}>
                  <span className="code-line__no">{firstLine[b] + li}</span>
                  <span className="code-line__text">{highlightPythonLine(line.text)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}
