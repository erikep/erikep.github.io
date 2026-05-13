# Pomodoro Timer

A small browser app for the [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique): Pomodoro, short break, and long break with editable durations, a circular progress ring, optional end sounds (three styles plus a test button), and a weekly focus-time chart stored in the browser.

The page background and card styling follow the active mode (focus vs breaks) so the environment matches what you are doing.

## Live site (GitHub Pages)

This repo is set up for **GitHub Pages** as a static site (`index.html` at the repository root).

1. Push this branch to GitHub.
2. In the repo on GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose your publishing branch (often `main`), and set the folder to **`/` (root)**.
4. Save; after the build finishes, open the **Pages** URL shown there (typically `https://<username>.github.io/<repo>/`).

No build step is required; Pages serves the HTML, CSS, and JavaScript as-is.

## Run locally (testing)

The app uses **ES modules** (`<script type="module">`). Opening `index.html` as a `file://` URL will fail in most browsers because of CORS. Use a local HTTP server from the project root:

**Python 3** (macOS/Linux usually have this):

```bash
cd pomodoro_timer
python3 -m http.server 8000
```

Then visit **<http://localhost:8000/>** in your browser.

**Node** (if you prefer):

```bash
cd pomodoro_timer
npx --yes serve .
```

Follow the URL printed in the terminal (often **<http://localhost:3000>**).

Stop the server with **Ctrl+C** when you are done.
