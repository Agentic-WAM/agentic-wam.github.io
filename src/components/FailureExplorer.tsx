"use client";

import { useState } from "react";
import ZoomableImage from "@/components/ZoomableImage";
import { FAILURE_CASES, FAILURE_FIG } from "@/data/aw0";
import { asset } from "@/lib/asset";

// Failure-case explorer (T-Rex style): the six mode cards select a row of the
// paper's failure figure; the strip below is that row, cropped from the full
// figure. Click the strip to open the whole figure.
export default function FailureExplorer({ figureNumber }: { figureNumber: number }) {
  const [active, setActive] = useState(0);
  const f = FAILURE_CASES[active];

  return (
    <div className="fail-explorer">
      <div className="fail-grid fail-grid--interactive">
        {FAILURE_CASES.map((c, i) => (
          <button
            className="fail-card"
            data-active={i === active ? "true" : undefined}
            key={c.mode}
            onClick={() => setActive(i)}
            onFocus={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            type="button"
          >
            <span className="fail-card__task">{c.task}</span>
            <h4>{c.mode}</h4>
            <p>{c.text}</p>
          </button>
        ))}
      </div>

      <figure className="aw-figure fail-stage">
        <div className="fail-stage__viewer" style={{ aspectRatio: `${FAILURE_FIG.w} / ${f.bottom - f.top}` }}>
          <div className="fail-stage__crop">
            <ZoomableImage
              alt={`${f.task}: ${f.mode}`}
              className="fail-stage__img"
              height={FAILURE_FIG.h}
              src={asset(FAILURE_FIG.src)}
              style={{ transform: `translateY(-${((f.top / FAILURE_FIG.h) * 100).toFixed(3)}%)` }}
              width={FAILURE_FIG.w}
            />
          </div>
        </div>
        <figcaption>
          Figure {figureNumber}: <strong>{f.mode}</strong> — {f.task}. Frames run left to right by execution progress; the
          red box on the last frame marks the region enlarged on the right, where the failure occurs. Hover a card to
          switch cases; click the strip to open the full figure.
        </figcaption>
      </figure>
    </div>
  );
}
