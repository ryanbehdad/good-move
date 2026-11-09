# Good Move

A simple personal movement reference: 11 routines and 37 exercises for daily care, desk breaks, tennis, gym, and recovery.

Site: https://ryanbehdad.github.io/good-move/

## Design and implementation plan

The supplied `Good-Move-Ryan-Simple.html` was a self-contained, read-only routine browser. It held exercise instructions, doses, equipment, cautions, alternatives, and attributed external photos. The implementation preserves that dataset, including four exercises requiring clinician approval and the tennis/gym restrictions.

The design uses warm off-white, forest green, large readable headings, and a compact routine list. Scenario filters lead into ordered instructions; optional extras and clinician-review reference instructions expand on request. Subtle entrance, hover, and sticky-navigation effects respect reduced-motion preferences. No accounts, analytics, persistent tracking, or settings are needed.

Use plain HTML/CSS/JavaScript modules with a separate JSON content file. This fits the static, read-only scope and avoids framework dependencies. Hash links support sharing, refresh, back/forward navigation, and GitHub Pages project paths without server rewrites.

## Local development

Requires Node.js 22 or later (CI uses Node 24). No dependencies to install.

```sh
npm run check
npm start
```

Open http://127.0.0.1:4173. After editing, run `npm run build` to refresh the served `dist/` files.

- `assets/data.json`: original exercise and routine data; keep IDs and clinical cautions intact.
- `assets/app.js`: routine filters, navigation, exercise rendering, error handling.
- `assets/model.js`: shared routing, categories, and approval rules.
- `assets/styles.css`: responsive styling, reduced motion, and print rules.
- `scripts/site.test.js`: content integrity, routing, approval, escaping, and project-path checks.

Images still load directly from the original publishers and can fail or change; instructions remain available, a fallback appears, and every exercise links to the original photo. Photo notes explain illustrative or partial matches. The website does not change the supplied medical guidance or certify any exercise for use.

## CI/CD and hosting

GitHub Pages is configured with **GitHub Actions** as its publishing source. The workflow in `.github/workflows/pages.yml` runs syntax checks, Node tests, and a static build on pull requests and pushes to `main`. Only a successful `main` run uploads `dist/` and deploys to the `github-pages` environment. Merging a PR to `main` therefore updates the site automatically; direct pushes do too. A manual run is also available from Actions. Failed checks prevent that revision from being deployed.

The artifact contains only `index.html` and `assets/`; repository docs and development scripts are excluded. Deployment uses GitHub’s built-in token with Pages/OIDC permissions only in the deploy job, with no personal access token or hosting secret. Runs are queued per branch to avoid overlapping deployments.

For a new fork, enable Pages under **Settings → Pages → Source → GitHub Actions**, then push to `main` or run the workflow manually. Public Pages content is accessible to anyone with its URL.

Research: [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [publishing source configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
