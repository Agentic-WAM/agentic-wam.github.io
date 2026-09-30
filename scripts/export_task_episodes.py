"""Export the 8 real-world task episodes shown in the paper's "Real-world Task Progress" appendix
(keyframes_codegt/*.pdf); the website currently uses them for the temporary hero mosaic.

For every task it reuses the exact spec that draws the appendix figure
(DexWAM/make_task_keyframe_drawio.py -> TASKS), resolves the code blocks and the
frame ranges they explain the same way the figure does, and writes

    src/data/taskEpisodes.json              code blocks + frame-aligned segments per task
    public/videos/episodes/<task>.mp4       the head-camera episode, H.264, 640x400, no audio

Run from anywhere (needs ffmpeg with libx264):
    python3 scripts/export_task_episodes.py
"""

import json
import os
import re
import subprocess
import sys

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEXWAM = os.path.dirname(SITE)
sys.path.insert(0, DEXWAM)
import make_task_keyframe_drawio as fig  # noqa: E402

# Paper order (Table 2): 4 YAM tasks, then 4 Tianji-Sharpa tasks.
ORDER = [
    ("arrange_fruits", "Arrange Fruits", "yam"),
    ("pack_backpack", "Pack Backpack", "yam"),
    ("replace_lightbulb", "Replace Lightbulb", "yam"),
    ("fold_and_stack_towels", "Fold and Stack Towels", "yam"),
    ("arrange_fruits_sharpa", "Arrange Fruits with Tongs", "sharpa"),
    ("deal_poker", "Deal Poker", "sharpa"),
    ("flip_scoreboard", "Flip Scoreboard", "sharpa"),
    ("solve_rubiks_cube", "Solve Rubik's Cube", "sharpa"),
]

# Web framing: one 16:10 crop per task (W:H:X:Y on the source frame), scaled to 640x400.
CROP = {
    "arrange_fruits": "640:400:0:50",
    "pack_backpack": "640:400:0:50",
    "replace_lightbulb": "640:400:0:50",
    "fold_and_stack_towels": "640:400:0:50",
    "arrange_fruits_sharpa": "640:400:0:80",
    "deal_poker": "640:400:0:80",
    "flip_scoreboard": "640:400:0:80",
    "solve_rubiks_cube": "1440:900:240:540",  # 1920x1440 full-res source
}


def resolve(spec):
    """Blocks and segments exactly as build_task_page() lays them out in the figure."""
    if spec.get("code_gt"):
        loader = fig.load_code_gt_stages if spec.get("group_stages") else fig.load_code_gt
        blocks, segs = loader(spec)
    else:
        blocks, segs = spec["blocks"], spec["segments"]
    for find, repl in spec.get("edits", ()):
        blocks = [[(t.replace(find, repl), e) for t, e in b] for b in blocks]
    for pat in spec.get("drop_lines", ()):
        blocks = [[(t, e) for t, e in b if not re.search(pat, t)] for b in blocks]
    if fig.DROP_BLANK_LINES:
        blocks = [[(t, e) for t, e in b if t.strip()] for b in blocks]
    return blocks, segs


def main():
    out_dir = os.path.join(SITE, "public", "videos", "episodes")
    os.makedirs(out_dir, exist_ok=True)
    tasks = []
    for key, label, platform in ORDER:
        spec = fig.TASKS[key]
        blocks, segs = resolve(spec)
        instruction = spec["instruction"].strip()
        if not instruction.endswith((".", "!", "?")):
            instruction += "."
        instruction = instruction[0].upper() + instruction[1:]
        tasks.append({
            "id": key,
            "label": label,
            "platform": platform,
            "instruction": instruction,
            "fps": spec["fps"],
            "video": f"/videos/episodes/{key}.mp4",
            "blocks": [[{"text": t, "executed": bool(e)} for t, e in b] for b in blocks],
            "segments": [
                {"start": s["frames"][0], "end": s["frames"][1], "block": s["block"], **({"label": s["label"]} if s.get("label") else {})}
                for s in segs
            ],
        })
        dst = os.path.join(out_dir, f"{key}.mp4")
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-i", spec["video"],
            "-vf", f"crop={CROP[key]},scale=640:400:flags=lanczos,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-profile:v", "high",
            "-movflags", "+faststart", "-an", dst,
        ], check=True)
        print(f"{key:24s} {len(blocks):2d} blocks {len(segs):2d} segments  {os.path.getsize(dst) / 1e6:5.1f} MB")

    with open(os.path.join(SITE, "src", "data", "taskEpisodes.json"), "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=1, ensure_ascii=False)
        f.write("\n")


if __name__ == "__main__":
    main()
