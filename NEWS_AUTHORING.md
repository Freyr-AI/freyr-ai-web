# Add a Freyr AI news article

1. Open [`content/news/_template.md`](content/news/_template.md).
2. Choose **Copy raw file**, create a new file in the same folder, and use a
   descriptive filename such as `2026-07-23-new-platform.md`.
3. Complete every front matter field:
   - `title`: article headline.
   - `slug`: unique lowercase URL using letters, numbers, and hyphens.
   - `date`: publication date in `YYYY-MM-DD` format.
   - `category`: short uppercase category.
   - `summary`: homepage and archive description.
   - `cover`: an existing image path beginning with `./public/`.
4. Write the article below the second `---` using Markdown.
5. Commit directly to `main` if authorized, or open a pull request for review.

GitHub Actions validates the content, orders all articles by `date` from newest
to oldest, generates the static HTML and JSON files, and deploys GitHub Pages.
Open the workflow run after committing and confirm that all build and deploy
steps succeed.

Raw HTML is rendered as text. Use Markdown links and images rather than embedded
HTML or scripts.
