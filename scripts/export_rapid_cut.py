"""Render the hand-selected hero edit from downloaded *_rapid_* camera clips."""

import argparse
import json
import re
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources", type=Path, required=True)
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--encoder", choices=["libx264", "h264_nvenc"], default="libx264")
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[1]
    edit = json.loads((repo / "scripts/rapid-cut-edit.json").read_text(encoding="utf-8"))
    target = repo / "public/videos/hero-rapid-cut.mp4"
    poster = repo / "public/videos/posters/hero-rapid-cut.jpg"
    poster.parent.mkdir(parents=True, exist_ok=True)

    def run(options):
        result = subprocess.run([args.ffmpeg, "-hide_banner", "-loglevel", "error", "-y", *map(str, options)],
                                capture_output=True)
        if result.returncode:
            raise RuntimeError(result.stderr.decode(errors="replace"))

    def duration(path):
        result = subprocess.run([args.ffmpeg, "-hide_banner", "-i", str(path)], capture_output=True)
        match = re.search(r"Duration: (\d+):(\d+):([\d.]+)", result.stderr.decode(errors="replace"))
        if not match:
            raise ValueError(f"Cannot read duration: {path}")
        return int(match[1]) * 3600 + int(match[2]) * 60 + float(match[3])

    with tempfile.TemporaryDirectory(prefix="aw0-rapid-cut-") as tmp:
        scratch = Path(tmp)

        def render(item):
            index, shot = item
            source = args.sources / shot["source"]
            assert "_rapid_" in source.name and source.is_file(), source
            assert shot["sourceIn"] >= 0 and shot["sourceOut"] <= duration(source) + .02, source
            frames = round((shot["sourceOut"] - shot["sourceIn"]) / shot["speed"] * 30)
            segment = scratch / f"{index:02d}.mp4"
            filters = [f"setpts=(PTS-STARTPTS)/{shot['speed']}", "fps=30", "scale=1920:1080:flags=lanczos"]
            if shot["hdr"]:
                # Match the full-film SDR proxies: Hable rolls off the bright
                # white tabletops and reflections in the phone's HLG footage.
                filters += ["zscale=t=linear:npl=100", "format=gbrpf32le", "zscale=p=bt709",
                            "tonemap=tonemap=hable:desat=0", "zscale=t=bt709:m=bt709:r=tv"]
            filters += ["format=yuv420p", "setsar=1", "tpad=stop_mode=clone:stop_duration=0.1", f"trim=end_frame={frames}"]
            encoding = (["-preset", "p6", "-rc", "vbr", "-cq", "22", "-b:v", "0"]
                        if args.encoder == "h264_nvenc" else ["-preset", "medium", "-crf", "22"])
            run(["-threads", "4", "-ss", shot["sourceIn"], "-t", shot["sourceOut"] - shot["sourceIn"],
                 "-i", source, "-map", "0:v:0", "-an", "-sn", "-dn", "-filter_threads", "2",
                 "-vf", ",".join(filters), "-c:v", args.encoder, *encoding, "-maxrate", "6000k", "-bufsize", "12000k",
                 "-g", "60", "-r", "30", "-video_track_timescale", "90000", "-color_primaries", "bt709",
                 "-color_trc", "bt709", "-colorspace", "bt709", "-map_metadata", "-1", segment])
            assert abs(duration(segment) - frames / 30) < .04
            print(f"Rendered {index+1:02d}/{len(edit['shots'])}: {shot['action']} ({frames/30:.2f}s)", flush=True)
            return frames

        with ThreadPoolExecutor(max_workers=2) as pool:
            frame_counts = list(pool.map(render, enumerate(edit["shots"])))
        concat = scratch / "concat.txt"
        concat.write_text("".join(f"file '{i:02d}.mp4'\n" for i in range(len(frame_counts))), encoding="utf-8")
        assembled = scratch / "hero.mp4"
        run(["-f", "concat", "-safe", "0", "-i", concat, "-c", "copy", "-an", "-map_metadata", "-1",
             "-movflags", "+faststart", assembled])
        total = sum(frame_counts) / 30
        assert abs(duration(assembled) - total) < .04
        target.write_bytes(assembled.read_bytes())
    run(["-i", target, "-frames:v", "1", "-q:v", "2", poster])

    # Retain a source-to-timeline mapping, including baked-in speed changes.
    timeline = []
    start = 0
    for shot, frames in zip(edit["shots"], frame_counts):
        timeline.append({**shot, "outputIn": round(start / 30, 4), "outputFrames": frames})
        start += frames
    manifest_path = repo / "public/videos/media-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    entry = {"id": "hero_rapid_cut", "video": "/videos/hero-rapid-cut.mp4",
             "poster": "/videos/posters/hero-rapid-cut.jpg", "durationSeconds": total,
             "bytes": target.stat().st_size, "playerPlaybackRate": 1,
             "sourceFolder": edit["sourceFolder"], "shotCount": len(timeline),
             "encoding": "1920x1080, 30 fps, H.264/yuv420p, SDR BT.709, faststart, no audio",
             "toneMapping": "HLG HDR to linear light (100-nit reference), Hable, BT.709 SDR; matches full-film proxies",
             "shots": timeline}
    manifest["videos"] = [v for v in manifest["videos"] if v["id"] != entry["id"]] + [entry]
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Done: {total:.2f}s, {len(timeline)} shots, {target.stat().st_size / 1e6:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
