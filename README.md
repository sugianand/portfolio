# Suganeshwara Anand — Portfolio

Personal portfolio for Suganeshwara Anand, a computer scientist and AI master's student focused on dependable software, intelligent tools, and systems that people can trust.

The site is intentionally presented as a horizontal, single-viewport experience. Visitors can use the centered tabs or the left/right arrow keys to move between Home, Work, About, and Contact.

## Live site

- Portfolio: [sugianand.github.io/portfolio](https://sugianand.github.io/portfolio/) (moving to sugi.is-a.dev)
- GitHub repositories: [github.com/sugianand](https://github.com/sugianand?tab=repositories)
- LinkedIn: [linkedin.com/in/suganeshwara-anand-b86367219](https://www.linkedin.com/in/suganeshwara-anand-b86367219/)
- Resume: [Download the PDF](./public/resume.pdf)

## Highlights

- Horizontal tab-based navigation with animated panel transitions
- Responsive layout with a mobile-friendly stacked fallback
- Pointer-reactive ambient lighting and animated visual signal
- Work panel featuring QA, embedded systems, backend, full-stack, and game-development experience
- Direct GitHub, LinkedIn, email, and downloadable resume links
- GitHub Pages deployment through GitHub Actions

## Tech stack

- React 19
- TypeScript
- Vite
- CSS
- GitHub Pages
- GitHub Actions

## Local development

Requirements:

- Node.js 22 or newer
- npm

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

The local site is available at `http://127.0.0.1:5173`.

## Validation and production build

Run the linter:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

The workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) builds and deploys the `dist` directory to GitHub Pages:

- On every push to `main`
- On manual dispatch
- On a six-hour schedule to re-publish the current committed site

Scheduled runs deploy the committed repository state; they do not generate or modify content automatically.
