"use client";

import { Play } from "lucide-react";
import { useMemo, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { DEMOS, PLATFORM_LABEL, type Platform } from "@/data/aw0";
import { asset } from "@/lib/asset";

const PLATFORMS: Platform[] = ["yam", "sharpa"];

// Demonstration gallery (as on the T-Rex page): pick one of the 8 real-world
// tasks to watch an AW-0 rollout; the player has play/pause, 1–8× speed, a
// scrubber and a full-screen button. Tasks without a clip yet show a placeholder.
export default function DemoGallery() {
  const [activeId, setActiveId] = useState(DEMOS[0].id);
  const task = useMemo(() => DEMOS.find((t) => t.id === activeId) ?? DEMOS[0], [activeId]);

  return (
    <div className="aw-figure demo-gallery">
      <div className="tp-groups">
        {PLATFORMS.map((p) => (
          <div className="tp-group" key={p}>
            <span className="tp-group__label">{PLATFORM_LABEL[p]}</span>
            <div className="tp-group__pills" role="tablist">
              {DEMOS.filter((t) => t.platform === p).map((t) => (
                <button
                  aria-selected={t.id === activeId}
                  className="aw-pill"
                  data-active={t.id === activeId}
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  role="tab"
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {task.video ? (
        <div className="demo-gallery__player" key={task.id}>
          <VideoPlayer autoPlay className="demo-gallery__video" loop playbackRate={1} src={asset(task.video)} title={task.label} />
        </div>
      ) : (
        <div aria-label={`${task.label} rollout coming soon`} className="aw-video-slot" key={task.id} role="img">
          <Play aria-hidden="true" size={22} strokeWidth={1.8} />
          <span>{task.label} — rollout video coming soon</span>
        </div>
      )}

      {task.instruction ? (
        <p className="demo-desc">
          <b>{task.label}.</b> &ldquo;{task.instruction}&rdquo;
        </p>
      ) : null}
    </div>
  );
}
