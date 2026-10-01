"""Render annotated rollouts at a uniform speed. Requires Pillow and FFmpeg.

Uses full-length SDR camera proxies and original source-time code stages.
Retimes footage and code stages together from the original camera timeline.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import math
from pathlib import Path
import re
import subprocess
import tempfile
from PIL import Image, ImageDraw
from rollout_code_overlay import draw_code_card, draw_instruction, font

TASK_IDS = {
    "replace_bulb": "replace_lightbulb",
    "arrange_fruits_tong": "arrange_fruits_with_tongs",
    "solve_cube": "solve_rubiks_cube",
}


def overlay(task, index, stage_index, speed, destination):
    image = Image.new("RGBA", (1920, 1080))
    draw = ImageDraw.Draw(image)
    for y in range(175):
        draw.line((0, y, 1919, y), fill=(6, 12, 20, int(180 * (1 - y / 175) ** 1.4)))
    for y in range(160):
        draw.line((0, 920 + y, 1919, 920 + y), fill=(6, 12, 20, int(180 * (y / 159) ** 1.4)))
    accent = "#8ED5A4" if task["embodiment"] == "YAM" else "#75BDE8"
    draw.text((52, 27), f"{index + 1:02d}", font=font(46, "bold"), fill=accent)
    draw.text((136, 28), task["title"], font=font(42, "bold"), fill="white")
    draw.text((138, 83), task["embodiment"] + "   /   FULL ROLLOUT", font=font(22, "sans"), fill="#E0E7EF")
    draw.rounded_rectangle((1645, 33, 1868, 87), 12, fill=(7, 15, 26, 165))
    draw.text((1668, 43), f"{speed:.1f}× SPEED", font=font(24), fill="white")
    draw_instruction(image, task["language_instruction"], accent)
    draw_code_card(image, task["stages"][stage_index]["code"], stage_index, len(task["stages"]), accent)
    total = len(task["stages"])
    for j in range(total):
        x = 1660 + j * int(202 / total)
        draw.rounded_rectangle((x, 1013, x + int(180 / total), 1018), 2, fill=accent if j <= stage_index else "#7C8692")
    image.save(destination)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--media-root", type=Path, required=True, help="demo_videos folder containing sources/ and work/proxies/")
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--encoder", choices=["libx264", "h264_nvenc"], default="libx264")
    parser.add_argument("--speed", type=float, default=3, help="Uniform recorded-speed multiplier (default: 3)")
    args = parser.parse_args()
    if not math.isfinite(args.speed) or args.speed <= 0:
        parser.error("--speed must be a finite positive number")
    repo = Path(__file__).resolve().parents[1]
    videos = repo / "public/videos"
    film_manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    assert len(film_manifest["tasks"]) == 8
    web_manifest_path = videos / "media-manifest.json"
    web_manifest = json.loads(web_manifest_path.read_text(encoding="utf-8"))
    previous = {entry["id"]: entry for entry in web_manifest["videos"]}

    def run(cmd):
        subprocess.run([args.ffmpeg, "-hide_banner", "-loglevel", "error", "-y", *map(str, cmd)], check=True)

    def probe_duration(path):
        probe = subprocess.run([args.ffmpeg, "-hide_banner", "-i", str(path)], capture_output=True, text=True, encoding="utf-8", errors="replace")
        match = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", probe.stderr)
        if not match:
            raise RuntimeError(probe.stderr)
        return int(match[1]) * 3600 + int(match[2]) * 60 + float(match[3])

    def export(item):
        index, task = item
        task_id = TASK_IDS.get(task["task"], task["task"])
        entry = dict(previous[task_id])
        source = args.media_root / "sources" / entry["source"]
        proxy = args.media_root / "work/proxies" / f"{task['task']}.mp4"
        source_duration, duration = probe_duration(source), probe_duration(proxy)
        assert abs(source_duration - duration) < 0.15
        assert abs(duration - task["source_duration"]) < 0.15
        target = repo / "public" / entry["video"].lstrip("/")
        temporary = target.with_name(target.stem + ".encoding.mp4")
        output_frames = math.ceil(duration / args.speed * 30 - 1e-6)
        output_duration = output_frames / 30
        maxrate = min(6000, int(88_000_000 * 8 / output_duration / 1000))
        encode = (["-preset", "p6", "-rc", "vbr", "-cq", "23", "-b:v", "0"]
                  if args.encoder == "h264_nvenc" else ["-preset", "medium", "-crf", "23"])
        print(f"Rendering {task_id}: {duration:.2f}s -> {output_duration:.2f}s, {args.speed:g}x speed", flush=True)
        with tempfile.TemporaryDirectory(prefix="aw0-annotations-") as overlay_dir:
            inputs = ["-threads", "4", "-i", proxy]
            filters = [f"[0:v]setpts=(PTS-STARTPTS)/{args.speed},fps=30,tpad=stop_mode=clone:stop_duration=0.1,trim=end_frame={output_frames},setsar=1[v0]"]
            stages = task["stages"]
            assert stages[0]["source_in"] == 0
            for k, stage in enumerate(stages):
                if k:
                    assert abs(stage["source_in"] - stages[k - 1]["source_out"]) < 0.01
                png = Path(overlay_dir) / f"{k:02d}.png"
                overlay(task, index, k, args.speed, png)
                inputs.extend(["-i", png])
                condition = f"gte(t,{stage['source_in'] / args.speed:.9f})"
                if k < len(stages) - 1:
                    condition += f"*lt(t,{stage['source_out'] / args.speed:.9f})"
                filters.append(f"[v{k}][{k + 1}:v]overlay=0:0:enable='{condition}'[v{k + 1}]")
            assert abs(stages[-1]["source_out"] - duration) < 0.15
            run([*inputs, "-filter_complex_threads", "2", "-filter_complex", ";".join(filters),
                 "-map", f"[v{len(stages)}]", "-an", "-c:v", args.encoder, *encode,
                 "-maxrate", f"{maxrate}k", "-bufsize", f"{maxrate * 2}k", "-g", "60", "-pix_fmt", "yuv420p", "-r", "30",
                 "-map_metadata", "-1", "-movflags", "+faststart", temporary])
        actual = probe_duration(temporary)
        assert abs(actual - output_duration) < 0.04, (task_id, actual, output_duration)
        assert abs(actual - source_duration / args.speed) < 0.05
        assert temporary.stat().st_size < 100_000_000
        temporary.replace(target)
        poster = repo / "public" / entry["poster"].lstrip("/")
        run(["-ss", "0.5", "-i", target, "-frames:v", "1", "-q:v", "2", poster])
        for key in ("annotatedSource", "filmStartFrame", "filmEndFrame"):
            entry.pop(key, None)
        entry.update({
            "durationSeconds": actual, "bytes": target.stat().st_size,
            "recordedDurationSeconds": source_duration,
            "recordedSpeedMultiplier": args.speed, "playerPlaybackRate": 1,
            "annotationTiming": f"Original source seconds divided by {args.speed:g}; full rollout and synchronized code at uniform {args.speed:g}x",
            "title": task["title"], "languageInstruction": task["language_instruction"],
            "codeStages": [{**stage, "output_in": stage["source_in"] / args.speed,
                            "output_seconds": (stage["source_out"] - stage["source_in"]) / args.speed, "speed": args.speed}
                           for stage in task["stages"]],
        })
        print(f"Done {task_id}: {actual:.2f}s, {target.stat().st_size / 1e6:.1f} MB", flush=True)
        return entry

    with ThreadPoolExecutor(max_workers=2) as pool:
        exports = {entry["id"]: entry for entry in pool.map(export, enumerate(film_manifest["tasks"]))}
    web_manifest["encoding"] = f"1080p, 30 fps, H.264/yuv420p, SDR, faststart, silent. Overview is the full film. All demos show complete rollouts at uniform {args.speed:g}x recorded speed, with synchronized code and matching on-screen badges; website players run at 1x."
    web_manifest["videos"] = [exports.get(entry["id"], entry) for entry in web_manifest["videos"]]
    web_manifest_path.write_text(json.dumps(web_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
