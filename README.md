# Suganeshwara Anand — Portfolio

Personal site for Suganeshwara "Sugi" Anand, a computer scientist and AI master's student at Wayne State.

**Live:** [sugianand.github.io](https://sugianand.github.io) (forwards to [sugianand.github.io/portfolio](https://sugianand.github.io/portfolio/) via [sugianand/sugianand.github.io](https://github.com/sugianand/sugianand.github.io))

## What's on the site

| Section | What it shows |
| --- | --- |
| Hero | Particle-text name with a rotating "a.k.a." line, over a live WebGL topographic shader |
| About | Bio, quick facts, stats, and skills |
| Projects | Filterable project grid. Each card opens a case study (overview, motivation, features, challenges), linkable at `#project/<id>` |
| Experience | Roles shown as an expandable `git log` |
| GitHub | Live contribution heatmap and stats |
| Playground | A working terminal (`help`, `neofetch`, `sudo hire-me`, …) and a playable remake of The Frantic Run |
| Contact | Click-to-copy email, links, and resume |

There are also a <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> command palette, twelve hidden achievements, and a Konami code. The footer shows the deployed commit hash.

## Editing content

Almost everything lives in [`src/data.ts`](./src/data.ts):

- `profile`: name, links, resume path
- `projects`: cards and case-study copy (`overview`, `why`, `features`, `challenges`)
- `roles`: experience entries for the git log
- `skills`, `stats`

## Tech

React 19 · TypeScript · Vite · hand-written WebGL and Canvas 2D (no animation libraries) · GitHub Pages via GitHub Actions

## Local development

Requires Node.js 22+.

```bash
npm ci
npm run dev      # http://localhost:5173
npm run lint
npm run build    # outputs to dist/
npm run preview
```

## Deployment

[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) builds the site and publishes `dist/` to GitHub Pages on every push to `main`. The build uses a relative base path, so the same output works on the `/portfolio/` subpath and on a custom domain.

The contribution heatmap reads from the public [github-contributions-api](https://github.com/grubersjoe/github-contributions-api) at runtime, and the build injects the commit hash and count from git.
