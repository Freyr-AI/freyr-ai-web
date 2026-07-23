# Freyr AI Web

Freyr AI company website built with plain HTML, CSS, and JavaScript. The
deployed website has no framework, npm runtime, backend, database, or API.
GitHub Actions uses a small Python build script to turn Markdown news files into
static HTML before deployment.

## Add a news article

1. Copy `content/news/_template.md`.
2. Rename the copy, for example `2026-07-23-new-platform.md`.
3. Complete the front matter and write the article in Markdown.
4. Commit the file to the public repository's `main` branch, directly or through
   a reviewed pull request.

See [`NEWS_AUTHORING.md`](NEWS_AUTHORING.md) for the editor checklist.

The `date` field must use `YYYY-MM-DD`. It controls the newest-first ordering;
filesystem modification times are not used. GitHub Actions automatically
generates:

- `news/index.json` for the homepage.
- `news/index.html` for the full archive.
- `news/<slug>/index.html` for each article.

## Local preview

Opening `index.html` directly shows the built-in fallback news item. To preview
generated Markdown news pages locally:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-news.txt
.venv/bin/python scripts/build_news.py --output _site
python3 -m http.server 8080 --directory _site
```

Then open `http://localhost:8080`.

## Deployment

The public website is deployed through GitHub Pages from the separate public
mirror repository:

- Repository: `Freyr-AI/freyr-ai-web-public`
- Deployment workflow: `.github/workflows/deploy-pages.yml`
- Pages URL: `https://freyr-ai.github.io/freyr-ai-web-public/`

The Freyr-AI organization currently redirects its GitHub Pages traffic to its
configured Pages domain, `www.token-exchange-ai.com`.

GitHub Actions builds the static `_site/` artifact and deploys it with GitHub
Pages. Python and the Markdown package are build-time tools only; the published
site contains only static HTML, CSS, JavaScript, JSON, and images.
