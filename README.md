# Freyr AI Web

Freyr AI company website built with Next.js, React, TypeScript, and npm.

## Local development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm test
```

`npm run build` generates a fully static site in `out/`.

## Deployment

Cloudflare Pages is connected to the `main` branch and deploys automatically.

- Build command: `npm run build`
- Build output directory: `out`
