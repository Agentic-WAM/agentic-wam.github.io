"use client";

import { useMemo, useState } from "react";
import CodeBlock from "@/components/CodeBlock";
import { SKILL_EXAMPLES, SKILL_LIBRARY, type SkillSource } from "@/data/aw0";
import { asset } from "@/lib/asset";

const SOURCE_LABEL: Record<SkillSource, string> = {
  yam: "YAM robot skills",
  human: "Egocentric human skills",
};

// Pick a discovered skill to see a representative slice: five key frames, the
// task / sub-goal annotation, the program slice that calls it, and the skill's
// definition over the primitive API (Appendix "Visualizations of ... Skills").
export default function SkillExplorer({ figureNumber }: { figureNumber: number }) {
  const [activeId, setActiveId] = useState(SKILL_EXAMPLES[0].id);
  const skill = useMemo(() => SKILL_EXAMPLES.find((s) => s.id === activeId) ?? SKILL_EXAMPLES[0], [activeId]);

  return (
    <figure className="aw-figure sk">
      <div className="tp-groups">
        {(["yam", "human"] as SkillSource[]).map((src) => (
          <div className="tp-group" key={src}>
            <span className="tp-group__label">{SOURCE_LABEL[src]}</span>
            <div className="tp-group__pills" role="tablist">
              {SKILL_EXAMPLES.filter((s) => s.source === src).map((s) => (
                <button
                  aria-selected={s.id === activeId}
                  className="aw-pill aw-pill--mono"
                  data-active={s.id === activeId}
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  role="tab"
                  type="button"
                >
                  {s.id}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sk-strip" key={skill.id}>
        {[0, 1, 2, 3, 4].map((i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={`${skill.id}, key frame ${i + 1} of 5`} key={i} loading="lazy" src={asset(`/figures/skills/${skill.id}/${i}.webp`)} />
        ))}
      </div>

      <div className="sk-meta">
        <p>
          <span className="sk-meta__key">Task</span> “{skill.task}”
        </p>
        <p>
          <span className="sk-meta__key">Sub-goal</span> “{skill.subgoal}”
        </p>
      </div>

      <div className="sk-code">
        <CodeBlock code={skill.slice} title="Program slice for this episode" />
        <CodeBlock code={skill.definition} title="Skill definition (library)" />
      </div>

      <details className="sk-library">
        <summary>Browse the full frozen skill library (23 YAM + 27 egocentric human skills)</summary>
        <div className="sk-library__cols">
          {(["yam", "human"] as SkillSource[]).map((src) => (
            <div key={src}>
              <h4>
                {SOURCE_LABEL[src]} ({SKILL_LIBRARY[src].length})
              </h4>
              <dl>
                {SKILL_LIBRARY[src].map(([name, def]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{def}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </details>

      <figcaption>
        Figure {figureNumber}: Skills discovered by the agentic annotation pipeline. Each skill is a Python function over
        the primitive API, so a subtask that recurs across the corpus becomes a single call. Frames show one
        representative slice per skill.
      </figcaption>
    </figure>
  );
}
