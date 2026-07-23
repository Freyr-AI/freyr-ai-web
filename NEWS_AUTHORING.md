# Add a Freyr AI news article

1. Copy the complete [`content/news/_template/`](content/news/_template/)
   directory.
2. Rename the copied directory with a short descriptive name, such as
   `new-platform`. The directory name is only for source organization; it does
   not determine the public page URL.
3. Keep the article Markdown at `index.md` inside that directory.
4. Put the cover and every image used by the article in the same directory as
   `index.md`. Use simple image filenames containing letters, numbers, dots,
   hyphens, or underscores.
5. Complete every front matter field:
   - `title`: article headline.
   - `slug`: unique lowercase URL using letters, numbers, and hyphens.
   - `date`: publication date in `YYYY-MM-DD` format.
   - `category`: short uppercase category.
   - `summary`: homepage and archive description.
   - `cover`: the cover image filename from the same directory, for example
     `cover.jpg`. It is an image path, not the article URL.
6. Write the article below the second `---` using Markdown. Reference local
   images with a same-directory path and one of the supported size markers:
   - `![Architecture](./architecture.png#small)` renders at `400px`.
   - `![Architecture](./architecture.png#medium)` renders at `680px`.
   - `![Architecture](./architecture.png#full)` fills the article width.
   - Omitting the marker defaults to `#full`.
7. Commit directly to `main` if authorized, or open a pull request for review.

GitHub Actions validates the content, orders all articles by `date` from newest
to oldest, generates the static HTML and JSON files, and deploys GitHub Pages.
Open the workflow run after committing and confirm that all build and deploy
steps succeed.

Raw HTML is rendered as text. Use Markdown links and images rather than embedded
HTML or scripts. During the build, images are copied beside the generated
`news/<slug>/index.html`; the `slug` field alone controls the public article
path. The selected width is enforced even when the source image is smaller.
Every size remains limited to the available screen width for mobile
compatibility.
