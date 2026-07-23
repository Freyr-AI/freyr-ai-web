# Freyr AI Web

Freyr AI company website built with plain HTML, CSS, and JavaScript. It has no
framework, package manager, build step, or backend.

## Local preview

Open `index.html` directly in a browser, or serve the repository root with any
static file server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

The public website is deployed through GitHub Pages from the separate public
mirror repository:

- Repository: `Freyr-AI/freyr-ai-web-public`
- Branch and directory: `main` / repository root
- Pages URL: `https://freyr-ai.github.io/freyr-ai-web-public/`

The Freyr-AI organization currently redirects its GitHub Pages traffic to its
configured Pages domain, `www.token-exchange-ai.com`.

Deployment settings:

- Build command: none
- Build output directory: `.`
