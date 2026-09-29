# AW-0 Website

Project website for **AW-0: Agentic World Action Model**.

Built on the [ENPIRE](https://github.com/enpire-research/enpire-research.github.io) project-page template
(Next.js + React + TypeScript + Tailwind), following the T-Rex site that uses the same template: a full-screen hero,
then a long-form article with a sticky table of contents. AW-0-specific pieces:

- a hero mosaic of the eight real-world task episodes (swap in a teaser video via `HERO_VIDEO`),
- an interactive **joint-denoising** figure (code unmasking + video/action flow matching, scrubbable),
- a **code-aligned episode player**: each task's post-training episode plays next to its program label, and the block
  for the current frame lights up (same episodes and frame ranges as the paper's key-frame appendix figures),
- a **skill explorer** (10 visualized skills + the full 50-skill library),
- animated RoboTwin / real-world / ablation charts built from the paper's numbers, and a failure-case explorer.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Checks

```bash
npm run typecheck
npm run lint
npm run build    # static export to ./out (output: "export" in next.config.ts)
```

## Where things live

- `src/data/aw0.ts` — **all paper content**: links (Paper/Code), authors + homepages, results tables, ablations, skill
  library, rubrics, failure cases. Edit here, not in components.
- `src/data/taskEpisodes.json` — code blocks and frame-aligned segments of the 8 task episodes (generated).
- `src/app/page.tsx` — the article text and section order; `src/app/aw0.css` — AW-0 styles on top of the template's
  `globals.css`.
- `src/components` — `Hero`, `JointDenoisingDemo`, `TaskEpisodePlayer`, `SkillExplorer`, `Charts`, `FailureExplorer`,
  `CitationBibtex`, plus the template's `ZoomableImage` / `VideoPlayer` / `ExpandableVideoViewer`.
- `public/figures` — WebP renders of the paper figures; `public/videos/episodes` — the 8 task episodes (H.264, 640x400).

## Regenerating assets

Both scripts read from the DexWAM project folder one level up.

```bash
python3 scripts/export_task_episodes.py   # episodes + taskEpisodes.json, from make_task_keyframe_drawio.TASKS
python3 scripts/render_paper_figures.py   # our-paper-arxiv/figures/*.pdf -> public/figures/*.webp
```

## Deploy

See [DEPLOY.md](DEPLOY.md). Short version: `npm run deploy` builds the site and pushes `out/` to the `gh-pages` branch.
