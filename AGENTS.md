# Repository Guidelines

## Project Structure & Module Organization

This is a small static web project. The application entry point is `index.html`, styling lives in `style.css`, and browser behavior lives in `script.js`. Keep related markup, style, and interaction changes coordinated across these three files. There is currently no dedicated `tests/` directory or asset folder; add one only when the project grows enough to need it, for example `assets/` for images or fonts.

## Build, Test, and Development Commands

No package manager or build step is configured. Open `index.html` directly in a browser for quick checks:

```sh
open index.html
```

For a local HTTP server, use a standard static server from the repo root:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Use this when validating relative paths, browser behavior, or future assets.

## Coding Style & Naming Conventions

Use 4-space indentation in HTML, CSS, and JavaScript to match the current files. Prefer semantic HTML where possible, and keep CSS class names descriptive and kebab-case, such as `top-container`, `bottom-item`, and `clickable-title`. JavaScript functions and variables should use camelCase, as in `toggleCategory`, `runColorScan`, and `activeTimeouts`.

Keep interaction logic in `script.js`; avoid inline JavaScript for new features when practical. Preserve the existing Korean comments where they explain animation behavior, and keep new comments short and useful.

## Testing Guidelines

There is no automated test framework yet. Manually test changes in a browser by clicking each top category and bottom item. Verify that fade-in behavior, dark-mode color changes, and repeated scan animations still work after toggling items on and off several times.

If tests are added later, place them in a `tests/` directory and document the runner command here.

## Commit & Pull Request Guidelines

The current git history uses short, informal messages such as `initial`, `test`, and `delete dumpfiles`. Going forward, use concise imperative messages that describe the change, for example `Add category toggle animation` or `Fix dark mode reset`.

Pull requests should include a short description, before/after screenshots or screen recordings for visual changes, manual test notes, and any linked issue or task. Keep PRs focused on one visible behavior or cleanup at a time.

## Security & Configuration Tips

Do not commit local system files such as `.DS_Store`. Avoid adding external scripts or CDN dependencies unless they are necessary and documented in the PR.

## Deployment Notes

GitHub is connected to Vercel, so pushed commits trigger redeployment. When future changes are requested, make the requested edits, then commit and push them unless the user says otherwise.
