# AW-0 Website

Project website for **AW-0: Agentic World Action Model**.

Built on the [ENPIRE](https://github.com/enpire-research/enpire-research.github.io) project-page template
(Next.js + React + TypeScript + Tailwind), following the T-Rex site that uses the same template: a full-screen hero,
then a long-form article with a sticky table of contents. AW-0-specific pieces:

- a hero mosaic of the eight real-world task episodes (swap in a teaser video via `HERO_VIDEO`),
- an interactive **joint-denoising** figure (code unmasking + video/action flow matching, scrubbable),
- a native **annotation pipeline** figure with module hover / keyboard-focus highlights and connected paths,
- a **rollout gallery** with eight annotated full recordings at uniform 3x recorded speed, task selection, fixed 1x player controls,
  seeking, and an expanded player; each clip includes its title, instruction, synchronized code slices, and speed badge,
- the **full project film** directly below the abstract,
- a **skill explorer** (10 visualized skills + the full 50-skill library),
- animated RoboTwin / real-world / ablation charts built from the paper's numbers, and a failure-case explorer.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
```

On Windows PowerShell, use `npm.cmd` if script execution is restricted. If a newly installed Node.js is not yet on
the terminal's PATH, run `$env:Path = "C:\Program Files\nodejs;" + $env:Path` first.

Preview the rapid-cut opening at `http://localhost:3000/`, the full film at `http://localhost:3000/#overview`,
and task rollouts at `http://localhost:3000/#demos`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build    # static export to ./out (output: "export" in next.config.ts)
```

## Where things live

- `src/data/aw0.ts` — **all paper content**: links (Paper/Model/Code), authors + homepages, results tables, ablations, skill
  library, rubrics, failure cases. Edit here, not in components.
- `src/data/taskEpisodes.json` — code blocks and frame-aligned segments of the 8 task episodes (generated).
- `src/app/page.tsx` — the article text and section order; `src/app/aw0.css` — AW-0 styles on top of the template's
  `globals.css`.
- `src/components` — `Hero`, `JointDenoisingDemo`, `AnnotationPipeline`, `DemoGallery`, `SkillExplorer`, `Charts`, `FailureExplorer`,
  `CitationBibtex`, plus the template's `ZoomableImage` / `VideoPlayer` / `ExpandableVideoViewer`.
- `public/figures` — WebP renders of the paper figures; `public/videos/episodes` — the 8 task episodes (H.264, 640x400).
- `public/figures/annotation` — original embedded photos and agent logos from `code_label_pipeline_v2_0926.pdf`;
  Figure 3's text, cards, and connectors are rendered natively. Content lives in `src/data/annotationPipeline.ts`.
  The Coding Agent's Gemini icon comes from [Gemini's official site](https://gemini.google/images/spark_4c.png).
- `public/videos/overview.mp4` — the complete 9:08 project film (v13), displayed below the abstract.
- `public/videos/hero-rapid-cut.mp4` — a silent 40.9-second opening loop: 19 shots from dedicated rapid clips,
  opening with YAM replacing a lightbulb and covering six tasks across YAM and Tianji + Sharpa. Individual shots use 1.5–3x recorded speed, baked into the
  file; the browser plays at 1x. `scripts/rapid-cut-edit.json` records every source, cut, and speed.
- `public/videos/demos` — eight annotated rollout videos (1080p, 30 fps, H.264); `public/videos/posters` — their cover images.
- `public/videos/future-predictions` — Arrange Fruits (v3, 16 s) and Deal Poker (v4, 12 s) prediction comparisons,
  copied without re-encoding from `future_prediction_comparisons_v4`. They replace Figures 12 and 13's static images,
  loop at the original file speed (1x player), and support pause, seeking, and an expanded view.
- `public/videos/media-manifest.json` — original filenames, website paths, durations, sizes, and encoding details.
  All demos show the complete rollout at 3x recorded speed. Code timings are divided by 3, and the on-screen badge reads
  3.0x. Both inline and expanded players stay at 1x, with controls outside the picture to keep code readable.
  The original recordings remain in the external `demo_videos` folder.

## Regenerating assets

Both scripts read from the DexWAM project folder one level up.

```bash
python3 scripts/export_task_episodes.py   # episodes + taskEpisodes.json, from make_task_keyframe_drawio.TASKS
python3 scripts/render_paper_figures.py   # our-paper-arxiv/figures/*.pdf -> public/figures/*.webp
```

To regenerate annotated demos from the full-length SDR camera proxies and source-time code stages in the edit manifest
(requires Pillow; the annotation renderer uses Windows fonts):

```bash
python scripts/export_annotated_demos.py --media-root /path/to/demo_videos --manifest /path/to/demo_videos/work/edit-manifest.json --speed 3
```

Pass `--ffmpeg /path/to/ffmpeg` if FFmpeg is not on PATH. `--encoder h264_nvenc` optionally enables NVIDIA encoding.
The script checks `work/proxies/` durations against the original videos in `sources/`, then updates all eight demos,
their posters, and the media manifest. `--speed` applies the same multiplier to footage and code timing (default: 3).
The full overview film is unchanged.

To regenerate the opening montage from the original `*_rapid_*` camera files (standard-library Python and FFmpeg):

```bash
python scripts/export_rapid_cut.py --sources /path/to/demo_videos/sources/rapid --ffmpeg /path/to/ffmpeg
```

Use `--encoder h264_nvenc` for NVIDIA encoding. The renderer converts HDR footage to SDR BT.709 with Hable tone
mapping to match the full-film proxies and retain highlight detail, exports silent
1080p/30fps H.264 with fast-start metadata, and updates the poster and source-to-timeline media manifest.

## Deploy

See [DEPLOY.md](DEPLOY.md). Short version: `npm run deploy` builds the site and pushes `out/` to the `gh-pages` branch.
