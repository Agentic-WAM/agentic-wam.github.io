# Deploying the AW-0 site for free (GitHub Pages)

The site is a static export (`output: "export"` in `next.config.ts`), so any static host works. The recipe below matches
how the T-Rex site is deployed: build locally and push the `out/` folder to a `gh-pages` branch. It does not need GitHub
Actions, so it also works with a token that lacks the `workflow` scope.

| Repo name | Resulting URL | Build with |
|---|---|---|
| `<org>.github.io` (root site, recommended) | `https://<org>.github.io/` | `npm run deploy` |
| anything else, e.g. `aw-0` (project site) | `https://<org>.github.io/aw-0/` | `NEXT_PUBLIC_BASE_PATH=/aw-0 npm run deploy` |

T-Rex uses the root-site pattern (`tactile-reactive-dexterous.github.io`).

## 1. Create the organization and repository

1. GitHub → avatar → **Settings → Organizations → New organization** (Free plan). The org name becomes the subdomain.
2. In the org: **Repositories → New**, name it `<org>.github.io`, **Public**, no README.

## 2. Push the source

From `web-based-on-enpire-research/`:

```bash
git init
git add -A
git commit -m "AW-0 project website"
git branch -M main
git remote add origin https://github.com/<org>/<org>.github.io.git
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `.next/`, and `out/`.

## 3. Publish

```bash
npm run deploy
```

Then in the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `gh-pages`,
folder `/ (root)`. The first deploy takes a minute or two. To update the site later, run `npm run deploy` again (and push
`main` if you want the source on GitHub too).

## Custom domain (optional, free)

**Settings → Pages → Custom domain**, then add the DNS record GitHub shows (a `CNAME` to `<org>.github.io`). Add a
`public/CNAME` file containing the domain so it survives redeploys.

## Notes

- The eight episode videos (~13 MB) and the figures are committed with the site; the whole build is ~25 MB, far below the
  Pages limits. A long teaser or many demo videos are better hosted elsewhere (T-Rex streams its videos from a Hugging
  Face dataset) and referenced by URL.
- `next/font` downloads the Google fonts at build time, so `npm run build` needs internet access.
