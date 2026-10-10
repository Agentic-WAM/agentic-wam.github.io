"use client";

import { Braces, Database, Film, Layers3, LockKeyhole, Repeat2 } from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ANNOTATION_PROGRAM, ANNOTATION_SKILLS, POUR_SKILL, PRIMITIVE_APIS } from "@/data/annotationPipeline";
import { asset } from "@/lib/asset";
import { highlightPythonLine } from "@/lib/pythonHighlight";

type EdgeSpec = {
  from: string;
  to: string;
  tone: "blue" | "green" | "gold";
  route?: "down" | "up" | "return";
  label?: string;
  dashed?: boolean;
};
type DrawnEdge = EdgeSpec & { path: string; labelX: number; labelY: number };

const EDGES: EdgeSpec[] = [
  { from: "subset", to: "agent", tone: "blue" },
  { from: "agent", to: "coordinator", tone: "blue", route: "down" },
  { from: "coordinator", to: "library", tone: "blue", route: "down", label: "Distill + Admit" },
  { from: "library", to: "skills", tone: "green", route: "up", label: "Retrieve Skills", dashed: true },
  { from: "pour", to: "implementation", tone: "green", dashed: true },
  { from: "demos", to: "cache", tone: "gold" },
  { from: "cache", to: "reuse", tone: "gold" },
  { from: "reuse", to: "reannotate", tone: "gold", label: "Miss" },
  { from: "reannotate", to: "cache", tone: "gold", route: "return", label: "Write Back", dashed: true },
];

function Node({ id, label, className = "", children }: { id: string; label: string; className?: string; children: ReactNode }) {
  return <div className={`ap-node ${className}`} data-ap-node={id} role="group" aria-label={label} tabIndex={0}>{children}</div>;
}

function Listing({ code }: { code: string }) {
  const lines = code.split("\n");
  return <pre className="ap-code"><code>{lines.map((line, i) => (
    <Fragment key={i}>{highlightPythonLine(line)}{i < lines.length - 1 ? "\n" : null}</Fragment>
  ))}</code></pre>;
}

function Brand({ name }: { name: "google" | "gemini" | "claude" }) {
  return <Image className="ap-brand" src={asset(`/figures/annotation/${name}.png`)} alt="" width={24} height={24} />;
}

/** Native Figure 3: static content, with hover/focus emphasis on nodes and edges. */
export default function AnnotationPipeline() {
  const root = useRef<HTMLDivElement>(null);
  const markerId = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [edges, setEdges] = useState<DrawnEdge[]>([]);
  const active = hovered ?? focused;

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    let frame = 0;
    let disposed = false;
    const measure = () => {
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const narrow = bounds.width <= 520;
      const rect = (id: string) => {
        const node = container.querySelector<HTMLElement>(`[data-ap-node="${id}"]`);
        if (!node) return null;
        const r = node.getBoundingClientRect();
        if (!r.width || !r.height) return null;
        return { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height };
      };
      setEdges(EDGES.flatMap((edge) => {
        const a = rect(edge.from), b = rect(edge.to);
        if (!a || !b) return [];
        let path: string, labelX: number, labelY: number;
        if (edge.route === "return") {
          if (narrow) {
            const x = a.x + a.w + 13;
            const y1 = a.y + a.h / 2, y2 = b.y + b.h / 2;
            path = `M ${a.x + a.w} ${y1} H ${x - 5} Q ${x} ${y1} ${x} ${y1 - 5} V ${y2 + 5} Q ${x} ${y2} ${x - 5} ${y2} H ${b.x + b.w + 2}`;
            labelX = x; labelY = (y1 + y2) / 2;
          } else {
            const x1 = a.x + a.w / 2, x2 = b.x + b.w / 2, y = Math.min(a.y, b.y) - 25;
            path = `M ${x1} ${a.y} V ${y + 6} Q ${x1} ${y} ${x1 - 6} ${y} H ${x2 + 6} Q ${x2} ${y} ${x2} ${y + 6} V ${b.y - 2}`;
            labelX = (x1 + x2) / 2; labelY = y;
          }
        } else if (edge.route === "up") {
          // A gutter keeps the retrieval loop clear of cards at every breakpoint.
          const x = 11, x1 = a.x + 35, x2 = b.x;
          const y1 = a.y, y2 = b.y + b.h / 2;
          const apis = rect("apis");
          if (apis && b.x > apis.x + 10) {
            // At the two-column breakpoint, enter Skills from below the input row.
            const rowBottom = Math.max(apis.y + apis.h, b.y + b.h) + 12;
            const targetX = b.x + b.w / 2;
            path = `M ${x1} ${y1} V ${y1 - 19} H ${x} V ${rowBottom} H ${targetX} V ${b.y + b.h + 2}`;
          } else {
            path = `M ${x1} ${y1} V ${y1 - 19} H ${x + 5} Q ${x} ${y1 - 19} ${x} ${y1 - 24} V ${y2 + 5} Q ${x} ${y2} ${x + 5} ${y2} H ${x2 - 2}`;
          }
          labelX = a.x + 57; labelY = y1 - 19;
        } else if (edge.to === "library") {
          const x = a.x + a.w / 2, y1 = a.y + a.h, y2 = b.y;
          path = `M ${x} ${y1} V ${y2 - 2}`;
          labelX = x; labelY = (y1 + y2) / 2;
        } else {
          const stacked = edge.route === "down" || b.y >= a.y + a.h - 2;
          if (stacked && edge.from === "pour") {
            // Route around the second row of example cards on narrow screens.
            const x1 = a.x + a.w, y1 = a.y + a.h / 2;
            const gutter = x1 + 10, y2 = b.y - 12, x2 = b.x + b.w / 2;
            path = `M ${x1} ${y1} H ${gutter} V ${y2} H ${x2} V ${b.y - 2}`;
            labelX = x2; labelY = y2;
          } else if (stacked) {
            const x1 = a.x + a.w / 2, x2 = b.x + b.w / 2;
            const y1 = a.y + a.h, y2 = b.y - 2, mid = (y1 + y2) / 2;
            path = `M ${x1} ${y1} C ${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
            labelX = (x1 + x2) / 2; labelY = mid;
          } else if (edge.from === "subset") {
            // Join the overlapping sides directly instead of bending between centers.
            const x1 = a.x + a.w, x2 = b.x - 3;
            const y = (Math.max(a.y, b.y) + Math.min(a.y + a.h, b.y + b.h)) / 2;
            path = `M ${x1} ${y} H ${x2}`;
            labelX = (x1 + x2) / 2; labelY = y - 12;
          } else {
            const x1 = a.x + a.w, x2 = b.x - 2;
            const y1 = a.y + a.h / 2, y2 = b.y + b.h / 2, mid = (x1 + x2) / 2;
            path = `M ${x1} ${y1} C ${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
            labelX = mid; labelY = (y1 + y2) / 2 - 12;
          }
        }
        return [{ ...edge, path, labelX, labelY }];
      }));
    };
    const schedule = () => { if (!disposed) { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); } };
    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    container.querySelectorAll<HTMLElement>("[data-ap-node]").forEach((node) => observer.observe(node));
    // Re-measure on first reveal if the page was initially rendered out of view.
    const visibility = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) schedule();
    });
    visibility.observe(container);
    document.fonts.ready.then(schedule);
    schedule();
    return () => { disposed = true; observer.disconnect(); visibility.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  function nodeAt(target: EventTarget | null) {
    return target instanceof Element ? target.closest<HTMLElement>("[data-ap-node]")?.dataset.apNode ?? null : null;
  }

  return (
    <div className="annotation-pipeline" id="annotation-pipeline">
      <div className="ap-diagram" ref={root} data-active={active ?? ""}
        onPointerOver={(event) => { if (event.pointerType !== "touch") setHovered(nodeAt(event.target)); }}
        onPointerLeave={() => setHovered(null)}
        onFocus={(event) => { setHovered(null); setFocused(nodeAt(event.target)); }}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null); }}>
        <svg className="ap-connections" aria-hidden="true">
          <defs>
            <marker id={`${markerId}-input`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 Z" className="ap-arrowhead ap-arrowhead--blue" />
            </marker>
            {["blue", "green", "gold"].map((tone) => (
            <marker id={`${markerId}-${tone}`} key={tone} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 8 4 L 0 8 Z" className={`ap-arrowhead ap-arrowhead--${tone}`} />
            </marker>
          ))}</defs>
          {edges.map((edge) => (
            <g key={`${edge.from}-${edge.to}`} data-edge={`${edge.from}-${edge.to}`} className={`ap-edge ap-edge--${edge.tone}${active === edge.from || active === edge.to ? " is-active" : ""}`}>
              <path d={edge.path} fill="none" strokeDasharray={edge.dashed ? "4 4" : undefined} markerEnd={`url(#${markerId}-${edge.from === "subset" ? "input" : edge.tone})`} />
              {edge.label ? <text x={edge.labelX} y={edge.labelY} dy=".35em" textAnchor="middle" className={edge.route === "return" ? "ap-return-label" : undefined}>{edge.label}</text> : null}
            </g>
          ))}
        </svg>

        <section className="ap-stage ap-stage--discovery" aria-label="Skill Discovery">
          <div className="ap-stage-heading"><span className="ap-stage-number">01</span><span>Skill Discovery</span></div>
          <div className="ap-discovery-grid">
            <div className="ap-inputs">
              <Node id="apis" label="Primitive APIs" className="ap-apis">
                <div className="ap-node-title"><Braces size={17} aria-hidden="true" /> Primitive APIs</div>
                <div className="ap-api-list">{PRIMITIVE_APIS.map((signature) => {
                  const split = signature.indexOf("(");
                  return <code key={signature}><span>{signature.slice(0, split)}</span>{signature.slice(split)}</code>;
                })}<span className="ap-ellipsis">···</span></div>
              </Node>
              <Node id="skills" label="Available Skills" className="ap-skills-input">
                <div className="ap-node-title"><Layers3 size={16} aria-hidden="true" /> Skills</div>
                <code>pick_and_bring(),<br />tilt_pour_over_target(),<br />move_item_two_handed(), …</code>
              </Node>
            </div>
            <Node id="subset" label="Subtask Subset: Turn Over the Bag of Laundry Powder" className="ap-subset">
              <div className="ap-node-title">Subtask Subset</div>
              <div className="ap-frame-stack"><Image src={asset("/figures/annotation/subtask-demo.jpg")} alt="Egocentric demonstration turning over a bag of laundry powder" width={1280} height={720} /></div>
              <div className="ap-instruction">“Turn Over the Bag of Laundry Powder.”</div>
            </Node>
            <div className="ap-agents">
              <Node id="agent" label="Coding agent and generated program" className="ap-agent">
                <div className="ap-node-title"><Brand name="gemini" /> Coding Agent</div>
                <Listing code={ANNOTATION_PROGRAM} />
              </Node>
              <Node id="coordinator" label="Coordinator" className="ap-coordinator">
                <div className="ap-node-title"><Brand name="claude" /> Coordinator</div>
              </Node>
            </div>
          </div>
        </section>

        <section className="ap-stage ap-stage--library" data-ap-node="library" tabIndex={0} aria-label="Skill Library: 50 Reusable Skills across Tasks">
          <div className="ap-stage-heading"><span className="ap-stage-number">02</span><span>Skill Library</span><span className="ap-library-count">50 Reusable Skills across Tasks</span></div>
          <div className="ap-library-grid">
            <Node id="tasks" label="Demonstrations across Tasks" className="ap-montage">
              <Image src={asset("/figures/annotation/task-montage.jpg")} alt="Original montage of robot and human demonstrations across tasks" width={2186} height={1530} />
              <div className="ap-photo-caption">Across Tasks</div>
            </Node>
            <div className="ap-examples" aria-label="Reusable Skill Examples">
              {ANNOTATION_SKILLS.map((skill) => (
                <Node id={skill.id} key={skill.id} label={`${skill.name}()`} className="ap-example">
                  <svg viewBox={skill.viewport} role="img" aria-label={`Demonstration of ${skill.name}`} preserveAspectRatio="xMidYMid slice">
                    <image href={asset("/figures/annotation/skill-examples.jpg")} width="1800" height="1200" />
                  </svg>
                  <code>{skill.name.split("_").map((word, i) => <Fragment key={i}>{i ? <>_<wbr /></> : null}{word}</Fragment>)}()</code>
                </Node>
              ))}
            </div>
            <Node id="implementation" label="Implementation of tilt_pour_over_target" className="ap-implementation">
              <div className="ap-code-heading"><Braces size={14} aria-hidden="true" /><span>Reusable Skill</span><span className="ap-language">Python</span></div>
              <Listing code={POUR_SKILL} />
            </Node>
          </div>
        </section>

        <div className="ap-freeze-divider"><Node id="frozen" label="Library Frozen" className="ap-frozen"><LockKeyhole size={14} aria-hidden="true" /> Library Frozen</Node></div>

        <section className="ap-stage ap-stage--corpus" aria-label="Corpus Annotation">
          <div className="ap-stage-heading"><span className="ap-stage-number">03</span><span>Corpus Annotation</span></div>
          <div className="ap-corpus-grid">
            <Node id="demos" label="All Demos" className="ap-corpus-node"><Film size={23} aria-hidden="true" /><div className="ap-node-title">All Demos</div></Node>
            <Node id="cache" label="Subtask to Code Cache" className="ap-corpus-node"><Database size={23} aria-hidden="true" /><div className="ap-node-title">Subtask → Code Cache</div><div className="ap-detail">Built by Re-Annotating the Subtask Subset Once Frozen</div></Node>
            <Node id="reuse" label="Reuse When Contact and Motion Evidence Match" className="ap-corpus-node"><Repeat2 size={23} aria-hidden="true" /><div className="ap-node-title">Reuse</div><div className="ap-detail">If Contact and Motion Evidence Match</div></Node>
            <Node id="reannotate" label="Re-Annotate on a Cache Miss" className="ap-corpus-node"><Brand name="gemini" /><div className="ap-node-title">Re-Annotate</div></Node>
          </div>
          <div className="ap-mobile-writeback">Write Back to the Subtask → Code Cache</div>
        </section>
      </div>
    </div>
  );
}
