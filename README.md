# Cypress E2E Testing Framework — TMDB Showcase

[![Build and deploy report](https://github.com/fanfanmyid/cypress-tmdb-new/actions/workflows/build-report.yml/badge.svg)](https://github.com/fanfanmyid/cypress-tmdb-new/actions/workflows/build-report.yml)
![Cypress](https://img.shields.io/badge/Cypress-12.16-17202C?logo=cypress&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?logo=node.js&logoColor=white)

A Cypress + TypeScript end-to-end testing framework that exercises the authentication (login) flows of [themoviedb.org](https://www.themoviedb.org/) (TMDB). Built as a portfolio showcase of a scalable, multi-product / multi-environment test architecture: page objects, fixture-driven configuration, custom commands, an in-memory store, code scaffolding via hygen, and CI that publishes a mochawesome HTML report to GitHub Pages.

> Built on top of the open-source [optimumqa/cypress-boilerplate](https://github.com/optimumqa/cypress-boilerplate), extended with TMDB login coverage and a GitHub Actions report pipeline.

## Architecture

```
cypress/
├── configs/simplidots_tmdb/     # Per-product, per-type config (default.ts)
├── e2e/simplidots_tmdb/         # Specs (login.cy.ts)
├── fixtures/simplidots_tmdb/    # routes.json (env → baseUrl), users.json (dummy credentials)
├── pages/                       # Page objects (loginPage.js)
├── plugins/                     # Node-side setup: config resolver, store, Allure writer
└── support/
    ├── e2e/                     # Global + product-scoped custom commands
    ├── helpers.ts               # Fixture loading, credential resolution, URL builder
    └── store/                   # Small in-memory key/value store shared across tests
```

Key design points:

- **Page Object pattern** — UI locators and interactions live in `cypress/pages/loginPage.js`; specs read as business scenarios, not selector soup.
- **Multi-product / multi-environment configuration** — `product`, `env` (`staging` / `release` / `production`) and `type` are passed via `-e` flags; `@optimumqa/cypress-setup-utilities` resolves the matching config, spec pattern, and `baseUrl` from `fixtures/<product>/routes.json`.
- **Fixture-driven test data** — routes and users are plain JSON per product/environment, so adding an environment is a data change, not a code change.
- **Custom commands** — global commands (localStorage, iframe, API, steps plugins) plus product-scoped commands registered through a hygen-managed registry (`cypress/support/e2e/commands.ts`).
- **Store pattern** — a lightweight in-memory store (`cypress/support/store/`) wired through `@optimumqa/cypress-store` for sharing state between steps/tests.
- **hygen scaffolding** — `npm run add-project` generates a new product skeleton (config, spec, fixtures, command registry entries) from `_templates/`, keeping conventions consistent.
- **Reporting** — mochawesome (per-spec JSON/HTML) merged into a single HTML report; Allure output is also wired via `@shelex/cypress-allure-plugin`.
- **Quality gates** — husky pre-commit hook runs Prettier across the repo; ESLint uses `eslint-plugin-cypress` recommended rules.

## Test coverage

Spec: `cypress/e2e/simplidots_tmdb/login.cy.ts` — suite `Authentication`

| ID           | Scenario                               | User fixture                                  | Expected result                           |
| ------------ | -------------------------------------- | --------------------------------------------- | ----------------------------------------- |
| Auth-Login#1 | Successful login                       | `primary` (valid username + password)         | Profile page shows the logged-in username |
| Auth-Login#2 | Login with wrong password              | `secondary` (valid username, wrong password)  | "There was a problem" error banner        |
| Auth-Login#3 | Login with wrong username              | `tertiary` (invalid username, valid password) | "There was a problem" error banner        |
| Auth-Login#4 | Login with wrong username and password | `quaternary` (both invalid)                   | "There was a problem" error banner        |
| Auth-Login#5 | Login with empty username              | `primary` password, blank username            | "There was a problem" error banner        |
| Auth-Login#6 | Login with empty password              | `primary` username, blank password            | "There was a problem" error banner        |

## Running locally

Prerequisites: Node.js ≥ 18 and npm.

```bash
npm ci

# Interactive mode
npm run "tmdb-staging open"

# Headless runs per environment
npm run tmdb-staging      # env=staging
npm run tmdb-release      # env=release
npm run tmdb-production   # env=production
```

Or drive Cypress directly:

```bash
npx cypress open --env product=simplidots_tmdb,env=staging
npx cypress run  --env product=simplidots_tmdb,env=staging
```

All three environments currently point at `https://www.themoviedb.org/` (see `cypress/fixtures/simplidots_tmdb/routes.json`); the split exists to demonstrate environment-aware configuration.

### Credentials configuration

The committed `users.json` contains **obvious dummy placeholders only** — no real accounts. Real credentials are injected at runtime, resolved in this order (first non-empty value wins, see `cypress/support/helpers.ts`):

1. **Environment variables** — Cypress auto-maps `CYPRESS_*` vars into `Cypress.env()`:

   ```bash
   export CYPRESS_PRIMARY_USER=your-tmdb-username
   export CYPRESS_PRIMARY_USER_PW=your-tmdb-password
   npm run tmdb-staging
   ```

2. **`cypress/fixtures/simplidots_tmdb/users.local.json`** — same shape as `users.json`, git-ignored.
3. **`cypress/fixtures/simplidots_tmdb/users.json`** — dummy fallback.

Full variable list and a `cypress.env.json` alternative are documented in [`.env.example`](.env.example). Roles: `primary` = valid account; `secondary` = valid username + wrong password; `tertiary` = wrong username + valid password; `quaternary` = both wrong.

### Reports

```bash
npm run mocha.combine-reports    # merge per-spec mochawesome JSON
npm run mocha.generate-report    # generate cypress/reports/mochareports/index.html
npm run mocha.clear              # reset report folders
npm run assets.clear             # remove screenshots/videos/downloads
```

Allure is also available: `npm run allure.report` / `npm run allure.start`.

## CI/CD

[`.github/workflows/build-report.yml`](.github/workflows/build-report.yml) runs on every push to `main` (and manually via `workflow_dispatch`):

1. `actions/checkout@v4`
2. `cypress-io/github-action@v6` — installs dependencies, verifies Cypress, runs `npm run tmdb-staging` in Chrome (test failures don't abort the pipeline: `continue-on-error`)
3. Merges mochawesome JSON and generates the combined HTML report (always runs)
4. `peaceiris/actions-gh-pages@v4` publishes `cypress/reports/mochareports` to the `gh-pages` branch (always runs, so the report reflects failures too)

To make the login suite pass in CI, add repository secrets `TMDB_PRIMARY_USER`, `TMDB_PRIMARY_USER_PW`, etc. (mapped to `CYPRESS_*` env vars in the workflow). Without secrets, CI runs against the dummy fixtures and the report documents the resulting failures.

## Scaffolding a new product

```bash
npm run add-project
```

hygen prompts for a product name and generates configs, a starter spec, fixtures, and command-registry wiring under the same conventions.

## Author

**Fan Fan** — Senior QA Automation Engineer
GitHub: [@fanfanmyid](https://github.com/fanfanmyid)

## Acknowledgements

- [optimumqa/cypress-boilerplate](https://github.com/optimumqa/cypress-boilerplate) — base framework architecture
- [Cypress](https://www.cypress.io/), [mochawesome](https://github.com/adamgruber/mochawesome), [hygen](https://www.hygen.io/)
