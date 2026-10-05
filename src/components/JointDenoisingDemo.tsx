"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { usePrefersReducedMotion } from "@/lib/useIsClient";

// Schematic of one AW-0 inference pass (Section 3.2): code, future video and the
// action chunk are denoised together over T steps. The code canvas starts fully
// masked and commits the G/T most confident positions per step (masked
// diffusion); video and action follow flow matching with the shifted schedule
// sigma = phi_gamma(u), gamma = 5. Frames come from a real Arrange Fruits
// episode; the confidence order and the action curves are illustrative.

const T = 8;
const GAMMA = 5;
const sigmaAt = (k: number) => {
  const u = 1 - k / T;
  return (GAMMA * u) / (1 + (GAMMA - 1) * u);
};

const CODE = `# intruder: move it out of the left bowl to the right side
approach_best_grasp(robot, item, 'banana', [0.0, 0.0, -0.05])
robot.close_gripper('auto')
relocate_object(robot, item, 'right side')
robot.open_gripper('auto')`;

const FRAMES = ["/figures/denoise/frame_1.2.jpg", "/figures/denoise/frame_2.0.jpg", "/figures/denoise/frame_2.8.jpg"];

// Deterministic PRNG so the page renders the same on every load.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Tok = { text: string; space: boolean; rank: number };

function tokenize(code: string) {
  const rnd = mulberry32(7);
  const lines: Tok[][] = [];
  let maskable = 0;
  for (const line of code.split("\n")) {
    const toks: Tok[] = [];
    const re = /(\s+)|('[^']*')|(#.*$)|([A-Za-z_]\w*)|(-?\d+(?:\.\d+)?)|(.)/g;
    for (const m of line.matchAll(re)) {
      const text = m[0];
      if (m[1]) {
        toks.push({ text, space: true, rank: -1 });
        continue;
      }
      // Structural tokens tend to be committed first, arguments later.
      const structural = /^[()[\],.]$/.test(text) || text === "robot";
      const comment = text.startsWith("#");
      const bias = structural ? 0 : comment ? 0.55 : 0.3;
      toks.push({ text, space: false, rank: bias + rnd() * 0.7 });
      maskable++;
    }
    lines.push(toks);
  }
  // Convert scores to integer commit order.
  const flat = lines.flat().filter((t) => !t.space).sort((a, b) => a.rank - b.rank);
  flat.forEach((t, i) => (t.rank = i));
  return { lines, total: maskable };
}

function gaussian(rnd: () => number) {
  const u = Math.max(rnd(), 1e-9);
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Three illustrative joint trajectories over an action horizon H.
const H = 32;
const CLEAN = [0, 1, 2].map((j) =>
  Array.from({ length: H }, (_, i) => {
    const s = i / (H - 1);
    if (j === 0) return 0.75 * (1 - Math.cos(Math.PI * s)) / 2 - 0.35;
    if (j === 1) return 0.28 * Math.sin(Math.PI * s * 1.2) + 0.05;
    return -0.45 + 0.2 * s + 0.12 * Math.sin(2 * Math.PI * s);
  }),
);
const EPS = (() => {
  const rnd = mulberry32(11);
  return CLEAN.map((c) => c.map(() => 0.42 * gaussian(rnd)));
})();
const ACTION_COLORS = ["#7a5aa8", "#a384c9", "#c7b1e0"];

function beat(k: number, committed: number, total: number) {
  if (k === 0) return <>All {total} code positions are masked; the video and action latents are pure Gaussian noise.</>;
  if (k === T)
    return (
      <>
        Decoded. The program slice has conditioned the predicted future frames, and the clean action chunk drives the robot. By
        default the code is <b>not executed</b>; in hybrid mode a valid slice may be run instead.
      </>
    );
  return (
    <>
      Step {k}/{T}: the code expert has committed {committed} of {total} tokens (top-confidence first; committed tokens stay
      fixed), while video and action each take one flow-matching step to σ = {sigmaAt(k).toFixed(2)}.
    </>
  );
}

export default function JointDenoisingDemo({ figureNumber }: { figureNumber: number }) {
  const { lines, total } = useMemo(() => tokenize(CODE), []);
  const [k, setK] = useState(0);
  // "auto" plays while the figure is on screen (unless reduced motion); any
  // interaction hands control to the visitor.
  const [mode, setMode] = useState<"auto" | "playing" | "paused">("auto");
  const { ref, inView } = useVisible<HTMLDivElement>(0.35);
  const reduced = usePrefersReducedMotion();
  const playing = mode === "playing" || (mode === "auto" && inView && !reduced);
  const setPlaying = (p: boolean) => setMode(p ? "playing" : "paused");

  useEffect(() => {
    if (!playing) return;
    const delay = k === T ? 2600 : k === 0 ? 900 : 750;
    const id = window.setTimeout(() => setK((cur) => (cur >= T ? 0 : cur + 1)), delay);
    return () => window.clearTimeout(id);
  }, [playing, k]);

  const sigma = sigmaAt(k);
  const committed = Math.round((k * total) / T);
  const prevCommitted = Math.round((Math.max(0, k - 1) * total) / T);

  const W = 360;
  const Hh = 130;
  const path = (j: number) =>
    CLEAN[j]
      .map((x0, i) => {
        const x = (1 - sigma) * x0 + sigma * EPS[j][i];
        const px = 10 + (i / (H - 1)) * (W - 20);
        const py = Hh / 2 - x * (Hh / 2 - 10);
        return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(" ");

  return (
    <figure className="aw-figure dn" ref={ref}>
      <svg aria-hidden="true" height="0" style={{ position: "absolute" }} width="0">
        <filter id="dn-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence baseFrequency="0.85" numOctaves="2" seed="4" stitchTiles="stitch" type="fractalNoise" />
          <feColorMatrix type="matrix" values="0.9 0.1 0 0 0  0.1 0.8 0.1 0 0  0 0.1 0.9 0 0  0 0 0 0 1" />
        </filter>
      </svg>
      <div className="dn-stage">
        <div className="dn-lane dn-lane--code">
          <div className="dn-lane__head">
            <span className="dn-chip dn-chip--code">Code expert</span>
            <span className="dn-lane__meta">discrete · masked diffusion</span>
          </div>
          <pre className="dn-code" aria-label="Program slice being unmasked">
            {lines.map((toks, li) => (
              <div key={li}>
                {toks.map((t, ti) =>
                  t.space ? (
                    <span key={ti}>{t.text}</span>
                  ) : (
                    <span
                      className={`dn-tok${t.rank >= committed ? " is-masked" : ""}${
                        t.rank >= prevCommitted && t.rank < committed ? " is-new" : ""
                      }${t.text.startsWith("#") ? " is-comment" : ""}${t.text.startsWith("'") ? " is-string" : ""}`}
                      key={ti}
                    >
                      {t.text}
                    </span>
                  ),
                )}
              </div>
            ))}
          </pre>
        </div>

        <div className="dn-lane dn-lane--video">
          <div className="dn-lane__head">
            <span className="dn-chip dn-chip--video">Video expert</span>
            <span className="dn-lane__meta">flow matching · σ<sub>v</sub> = {sigma.toFixed(2)}</span>
          </div>
          <div className="dn-frames">
            {FRAMES.map((src) => (
              <div className="dn-frame" key={src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={asset(src)}
                  style={{ filter: `blur(${(sigma * 2).toFixed(2)}px)` }}
                />
                <svg aria-hidden="true" className="dn-frame__noise" preserveAspectRatio="none" style={{ opacity: sigma }} viewBox="0 0 160 100">
                  <rect fill="#808080" filter="url(#dn-noise)" height="100" width="160" />
                </svg>
              </div>
            ))}
          </div>
          <div className="dn-lane__foot">Predicted future frames (head camera)</div>
        </div>

        <div className="dn-lane dn-lane--action">
          <div className="dn-lane__head">
            <span className="dn-chip dn-chip--action">Action expert</span>
            <span className="dn-lane__meta">flow matching · σ<sub>a</sub> = {sigma.toFixed(2)}</span>
          </div>
          <svg className="dn-actions" viewBox={`0 0 ${W} ${Hh}`} role="img" aria-label="Action chunk being denoised">
            <line className="dn-actions__axis" x1="10" x2={W - 10} y1={Hh / 2} y2={Hh / 2} />
            {[0, 1, 2].map((j) => (
              <path d={path(j)} key={j} stroke={ACTION_COLORS[j]} />
            ))}
          </svg>
          <div className="dn-lane__foot">Action chunk, H steps (illustrative joints)</div>
        </div>

        <div className="dn-mask-legend" aria-label="Blockwise causal attention across experts">
          <div className="dn-attn">
            <span />
            <b>C</b>
            <b>V</b>
            <b>A</b>
            {["C", "V", "A"].map((row, r) => (
              <FragmentRow key={row} row={row} r={r} />
            ))}
          </div>
          <p>
            Attention is bidirectional within each expert and blockwise causal across them, in the order{" "}
            <b>code → video → action</b>.
          </p>
        </div>
      </div>

      <div className="dn-controls">
        <button className="aw-btn" onClick={() => setPlaying(!playing)} type="button">
          {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Play"}
        </button>
        <button
          className="aw-btn"
          onClick={() => {
            setPlaying(false);
            setK(0);
          }}
          type="button"
        >
          <RotateCcw size={14} /> Reset
        </button>
        <input
          aria-label="Denoising step"
          className="aw-range"
          max={T}
          min={0}
          onChange={(e) => {
            setPlaying(false);
            setK(Number(e.currentTarget.value));
          }}
          step={1}
          type="range"
          value={k}
        />
        <span className="dn-step">
          step {k} / {T}
        </span>
      </div>
      <div className="aw-beat">{beat(k, committed, total)}</div>
      <figcaption>
        Figure {figureNumber}: Joint denoising in AW-0, one replanning step. The code canvas is decoded by masked diffusion
        while the video and action experts integrate flow matching, all inside the same {T}-step loop; the noise level
        follows the shifted schedule σ = γu / (1 + (γ − 1)u) with γ = 5, so the future frames resolve late. Drag the
        slider to scrub. Frames are from a real <i>Arrange Fruits</i> episode; the token confidence order and joint curves are
        schematic.
      </figcaption>
    </figure>
  );
}

// Live visibility (unlike useInView, which latches once).
function useVisible<T extends HTMLElement>(threshold: number) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return { ref, inView: visible };
}

function FragmentRow({ row, r }: { row: string; r: number }) {
  return (
    <>
      <b>{row}</b>
      {[0, 1, 2].map((c) => (
        <i data-on={c <= r ? "true" : undefined} data-kind={["code", "video", "action"][r]} key={c} />
      ))}
    </>
  );
}
