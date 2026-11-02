# Surya Study Materials

A Docusaurus 3 site for DSA visual walkthroughs, beginner-first System Design interviews, and JavaScript polyfills. Node.js 20+ is required; Java is **not** required to build the site or display its Java examples.

## Development and validation

- Install the locked dependencies with `npm ci`.
- Start local development with `npm start`.
- Generate the production site with `npm run build`.
- Preview that build with `npm run serve`.
- After building, run `npm run test:system-design` for the browser checks. Tests start and stop their own preview server on port 4173.

Browser tests use installed Microsoft Edge on Windows. On other platforms, install Playwright Chromium with `npx playwright install chromium` first. The optional `PLAYWRIGHT_CHANNEL` environment variable can select a different installed browser channel. Test reports and failure screenshots are ignored by Git.

The build checks documentation routes and anchors. Browser tests validate all catalog destinations and pattern anchors, filtering and empty state, mobile layout in light/dark themes, beginner script navigation, and every Mermaid diagram in System Design. Java snippets are educational examples; they are not compiled by these tests.

## System Design learning area

Start at [the introduction](docs/system-design/intro.mdx), then SOLID → Strategy → [Parking Lot](docs/system-design/case-studies/parking-lot.md). Parking Lot preserves the supplied full playbook with a new source audit. Other entries are shorter learning guides, not claims of equivalent full playbooks.

The catalog contains 43 entries: three foundations, 25 patterns (including two clearly marked supplemental topics), and 15 case studies. Multiple pattern entries link to anchored sections in three grouped guides. Collection folders are not counted as additional lessons, and Splitwise implementation is part of the Splitwise guide.

- [Catalog component](src/components/SystemDesignCatalog/index.js): search and category filtering.
- [Foundation metadata](src/data/system-design/foundations.json), [pattern metadata](src/data/system-design/patterns.json), [Parking metadata](src/data/system-design/parking.json), and [case metadata](src/data/system-design/cases.json): one shared source for catalog cards and the source library.
- [Source library](docs/system-design/sources.mdx): original links and narrowly stated review scope.
- [PDF access audit](docs/system-design/source-access.md): public access and extraction results, **not** a blanket content-verification claim.

### Adding or extending a topic

1. Add a Markdown guide under the relevant System Design directory. Use `.md` for CommonMark (Java generics are safe inside fenced code blocks) and `.mdx` only when JSX is needed.
2. Provide requirements/invariants, minimal diagram, incremental DRAW/SAY steps, runtime and failure flows, an original Java example, a justified pattern decision, and practice checkpoints.
3. Add one catalog entry with unique `id` and `slug`, plus `title`, `category`, `kind`, `summary`, `sourceNote`, and labelled HTTPS `sources`. Slugs are relative to `/docs/system-design/`; a grouped topic can include an explicit heading anchor.
4. Distinguish PDF requirements, specific commit-pinned source observations, and original interview models. A downloaded PDF or reachable repository directory is not evidence that every implementation was reviewed. Preserve unverified labels where appropriate.
5. Link third-party PDFs and source instead of copying them into this repository. Keep downloaded research outside the site. Never add credentials or private Drive URLs.
6. Update the intentional topic-count assertion in [the browser tests](tests/system-design.spec.js) and this README if the catalog grows, then build and test.

The original playbook in Downloads is not modified or required at build time; its integrated copy is checked into the site's documentation when committed.

## Deployment

The production URL is configured for Vercel. Use `npm run build` as the build command and `build` as the output directory. Generated output is ignored; commit the source documentation, configuration, and lockfile. No deployment or Git push is performed automatically by development or browser tests.
