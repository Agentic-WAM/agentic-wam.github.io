"use client";

import { Fragment, useState } from "react";
import {
  LATENCY,
  PLATFORM_LABEL,
  REAL_TASKS,
  ROBOTWIN_MAIN,
  ROBOTWIN_METHODS,
  ROBOTWIN_PER_TASK,
  ROBOTWIN_PER_TASK_AVG,
  type Platform,
  type RealRow,
  type Series,
} from "@/data/aw0";
import { useInView } from "@/lib/useInView";

const PLATFORM_COLOR: Record<Platform, string> = { yam: "var(--aw-video)", sharpa: "var(--aw-action)" };
const PLATFORMS: Platform[] = ["yam", "sharpa"];
const tasksOf = (p: Platform) => REAL_TASKS.filter((t) => t.platform === p);

// ---------------------------------------------------------------------------
// RoboTwin 2.0: clean / random success per method, animated in on scroll.
// ---------------------------------------------------------------------------
export function RoboTwinBars({ figureNumber }: { figureNumber: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const max = 100;
  return (
    <figure className="aw-figure" ref={ref}>
      <div className="rt-legend">
        <span>
          <i className="rt-swatch rt-swatch--clean" /> Clean
        </span>
        <span>
          <i className="rt-swatch rt-swatch--random" /> Random (domain-randomized)
        </span>
        <span className="rt-legend__avg">Average</span>
      </div>
      <div className="rt-rows">
        {ROBOTWIN_MAIN.map((m, i) => (
          <div className="rt-row" data-ours={m.ours ? "true" : undefined} key={m.method}>
            <div className="rt-name">{m.ours ? <b>{m.method}</b> : m.method}</div>
            <div className="rt-bars">
              {(["clean", "random"] as const).map((k) => (
                <div className="rt-track" key={k}>
                  <div
                    className={`rt-fill rt-fill--${k}`}
                    style={{ width: inView ? `${(m[k] / max) * 100}%` : "0%", transitionDelay: `${i * 80}ms` }}
                  />
                  <span className="rt-val" style={{ left: inView ? `calc(${(m[k] / max) * 100}% + 6px)` : "6px", transitionDelay: `${i * 80}ms` }}>
                    {m[k].toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="rt-avg">{m.avg.toFixed(1)}</div>
          </div>
        ))}
      </div>
      <figcaption>
        Figure {figureNumber}: RoboTwin 2.0 success rate (%) averaged over 50 tasks with 50 rollouts each, trained on 50
        clean demonstrations per task. The default mode leads on clean scenes and on average; hybrid execution is the
        most robust under visual randomization.
      </figcaption>
    </figure>
  );
}

export function RoboTwinPerTask() {
  const [open, setOpen] = useState(false);
  return (
    <details className="aw-details" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Per-task RoboTwin 2.0 results (50 tasks × 2 settings)</summary>
      {open ? (
        <div className="aw-table-wrap aw-table-wrap--tall">
          <table className="aw-table aw-table--dense">
            <thead>
              <tr>
                <th rowSpan={2}>Task</th>
                {ROBOTWIN_METHODS.map((m) => (
                  <th colSpan={2} data-ours={m.startsWith("AW-0") ? "true" : undefined} key={m}>
                    {m}
                  </th>
                ))}
              </tr>
              <tr>
                {ROBOTWIN_METHODS.map((m) => (
                  <Fragment key={m}>
                    <th className="aw-table__sub">Clean</th>
                    <th className="aw-table__sub">Rand.</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROBOTWIN_PER_TASK.map(([task, vals]) => {
                const bestClean = Math.max(...vals.filter((_, i) => i % 2 === 0));
                const bestRand = Math.max(...vals.filter((_, i) => i % 2 === 1));
                return (
                  <tr key={task}>
                    <td>{task}</td>
                    {vals.map((v, i) => (
                      <td className={v === (i % 2 === 0 ? bestClean : bestRand) ? "is-best" : undefined} key={i}>
                        {v}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="aw-table__total">
                <td>Average</td>
                {ROBOTWIN_PER_TASK_AVG.map((v, i) => (
                  <td key={i}>{v.toFixed(1)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="aw-note">Success rate (%) over 50 rollouts per task per setting; the best result per task and setting is in bold.</p>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Real world: average bars + per-task table (Table 2).
// ---------------------------------------------------------------------------
export function AverageBars({ rows, figureNumber, caption }: { rows: RealRow[]; figureNumber: number; caption: React.ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  return (
    <figure className="aw-figure" ref={ref}>
      <div className="rc-bars">
        {rows.map((m, i) => (
          <div className="rc-bar-row" key={m.method}>
            <div className="rc-bar-name">{m.ours ? <b>{m.method}</b> : m.method}</div>
            <div className="rc-bar-track">
              <div
                className="rc-bar-fill"
                data-highlight={m.ours ? "true" : undefined}
                style={{ width: inView ? `${m.avg}%` : "0%", transitionDelay: `${i * 90}ms` }}
              />
              <span className="rc-bar-val">{m.avg.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
      <figcaption>
        Figure {figureNumber}: {caption}
      </figcaption>
    </figure>
  );
}

export function TaskTable({ rows, label, caption }: { rows: { name: string; vals: number[]; avg: number; ours?: boolean }[]; label: string; caption: React.ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const best = REAL_TASKS.map((_, i) => Math.max(...rows.map((r) => r.vals[i])));
  const bestAvg = Math.max(...rows.map((r) => r.avg));
  return (
    <figure className="aw-figure" ref={ref}>
      <div className="aw-table-wrap">
        <table className="aw-table">
          <thead>
            <tr>
              <th rowSpan={2}>{label}</th>
              {PLATFORMS.map((p) => (
                <th className="aw-table__group" colSpan={tasksOf(p).length} key={p} style={{ borderBottomColor: PLATFORM_COLOR[p] }}>
                  {PLATFORM_LABEL[p]}
                </th>
              ))}
              <th rowSpan={2}>Avg.</th>
            </tr>
            <tr>
              {REAL_TASKS.map((t) => (
                <th className="aw-table__sub" key={t.key}>
                  {t.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr className={r.ours ? "is-ours" : undefined} key={r.name}>
                <td>{r.name}</td>
                {r.vals.map((v, i) => (
                  <td className={`aw-cell${v === best[i] ? " is-best" : ""}`} key={i}>
                    <span
                      className="aw-cell__bg"
                      style={{
                        background: PLATFORM_COLOR[REAL_TASKS[i].platform],
                        opacity: inView ? Math.min(0.26, (v / 100) * 0.3) : 0,
                        transitionDelay: `${i * 25}ms`,
                      }}
                    />
                    <span className="aw-cell__v">{v.toFixed(1)}</span>
                  </td>
                ))}
                <td className={r.avg === bestAvg ? "is-best" : undefined}>{r.avg.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Grouped vertical bars per task (+ average), used for the ablations.
// ---------------------------------------------------------------------------
export function GroupedBars({
  series,
  figureNumber,
  caption,
  yMin = 0,
  showValues = true,
}: {
  series: Series[];
  figureNumber: number;
  caption: React.ReactNode;
  yMin?: number;
  showValues?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<{ g: number; s: number } | null>(null);
  const shown = series.filter((s) => !hidden.has(s.name));

  const W = 900;
  const H = 330;
  const padL = 44;
  const padR = 8;
  const padT = 34;
  const padB = 58;
  const groups = [...REAL_TASKS.map((t) => t.label), "Average"];
  const gw = (W - padL - padR) / groups.length;
  const span = 0.8;
  const bw = shown.length ? (gw * span) / shown.length : 0;
  const y = (v: number) => padT + (1 - (v - yMin) / (100 - yMin)) * (H - padT - padB);
  const ticks = [0, 20, 40, 60, 80, 100].filter((t) => t >= yMin);

  const toggle = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else if (series.length - next.size > 1) next.add(name);
      return next;
    });

  return (
    <figure className="aw-figure" ref={ref}>
      <div className="gb-legend">
        {series.map((s) => (
          <button data-dim={hidden.has(s.name) ? "true" : undefined} key={s.name} onClick={() => toggle(s.name)} type="button">
            <i style={{ background: s.color }} /> {s.ours ? <b>{s.name}</b> : s.name}
          </button>
        ))}
      </div>
      <div className="gb-scroll">
        <svg className="gb-svg" role="img" aria-label="Grouped bar chart of rubric scores per task" viewBox={`0 0 ${W} ${H}`}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="gb-grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
              <text className="gb-tick" textAnchor="end" x={padL - 8} y={y(t) + 4}>
                {t}
              </text>
            </g>
          ))}
          {/* platform brackets */}
          {PLATFORMS.map((p) => {
            const first = REAL_TASKS.findIndex((t) => t.platform === p);
            const n = tasksOf(p).length;
            const x0 = padL + first * gw + 6;
            const x1 = padL + (first + n) * gw - 6;
            return (
              <g key={p}>
                <line stroke={PLATFORM_COLOR[p]} strokeWidth={2.5} x1={x0} x2={x1} y1={12} y2={12} />
                <text className="gb-platform" textAnchor="middle" x={(x0 + x1) / 2} y={27}>
                  {PLATFORM_LABEL[p]}
                </text>
              </g>
            );
          })}
          <line className="gb-sep" x1={padL + 8 * gw} x2={padL + 8 * gw} y1={padT - 6} y2={H - padB} />
          {groups.map((g, gi) => {
            const gx = padL + gi * gw + (gw * (1 - span)) / 2;
            return (
              <g key={g}>
                {shown.map((s, si) => {
                  const v = gi < 8 ? s.vals[gi] : s.avg;
                  const x = gx + si * bw;
                  const top = inView ? y(Math.max(v, yMin)) : y(yMin);
                  const isHover = hover?.g === gi && hover?.s === si;
                  return (
                    <g key={s.name} onMouseEnter={() => setHover({ g: gi, s: si })} onMouseLeave={() => setHover(null)}>
                      <rect
                        className="gb-bar"
                        fill={s.color}
                        height={Math.max(0, y(yMin) - top)}
                        rx={2}
                        style={{ transitionDelay: `${gi * 40 + si * 60}ms`, filter: isHover ? "brightness(0.92)" : undefined }}
                        width={Math.max(1, bw - 2)}
                        x={x}
                        y={top}
                      >
                        <title>{`${s.name} · ${g}: ${v.toFixed(1)}`}</title>
                      </rect>
                      {(showValues || isHover || gi === 8) && inView ? (
                        <text className="gb-val" data-strong={s.ours ? "true" : undefined} textAnchor="middle" x={x + (bw - 2) / 2} y={top - 5}>
                          {v.toFixed(1)}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
                <text className="gb-label" textAnchor="middle" x={padL + gi * gw + gw / 2} y={H - padB + 20}>
                  {g.split(" ").slice(0, 1).join(" ")}
                </text>
                <text className="gb-label" textAnchor="middle" x={padL + gi * gw + gw / 2} y={H - padB + 36}>
                  {g.split(" ").slice(1).join(" ")}
                </text>
              </g>
            );
          })}
          <text className="gb-axis-title" textAnchor="middle" transform={`translate(12 ${(padT + H - padB) / 2}) rotate(-90)`}>
            Avg. rubric score (%)
          </text>
        </svg>
      </div>
      <figcaption>
        Figure {figureNumber}: {caption} Click a legend entry to hide a series; hover a bar for its value.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Joint denoising vs. AR: score and latency side by side (Figure 6).
// ---------------------------------------------------------------------------
export function LatencyChart({ figureNumber }: { figureNumber: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  return (
    <figure className="aw-figure" ref={ref}>
      <div className="lat-grid">
        <div className="lat-head" />
        <div className="lat-head">Avg. rubric score (%)</div>
        <div className="lat-head">Inference latency (s, RTX 5090)</div>
        {LATENCY.map((r, i) => (
          <Fragment key={r.name}>
            <div className="lat-name">{r.ours ? <b>{r.name}</b> : r.name}</div>
            <div className="lat-track">
              <div className="lat-fill" style={{ width: inView ? `${r.score}%` : "0%", background: r.color, transitionDelay: `${i * 90}ms` }} />
              <span className="lat-val">{r.score.toFixed(1)}</span>
            </div>
            <div className="lat-track">
              <div
                className="lat-fill lat-fill--time"
                style={{ width: inView ? `${(r.latency / 0.6) * 100}%` : "0%", transitionDelay: `${i * 90}ms` }}
              />
              <span className="lat-val">{r.latency.toFixed(2)} s</span>
            </div>
          </Fragment>
        ))}
      </div>
      <figcaption>
        Figure {figureNumber}: Performance and latency. Joint denoising runs in 0.23 s versus 0.55 s for autoregressive code
        generation (2.39× faster), and adds only 0.04 s over the WAM without code (0.19 s) while raising the average rubric
        score from 32.9 to 71.1.
      </figcaption>
    </figure>
  );
}
