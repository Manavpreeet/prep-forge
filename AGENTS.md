# DSA Helper — Agent Schema (Sources → Wiki → Schema)

This repo follows the **LLM Wiki** pattern:

- **Raw sources**: immutable inputs (docs, references, research).
- **Wiki**: curated, interlinked markdown pages that evolve over time.
- **Schema**: these instructions + Cursor rules that keep the workflow consistent.

## 1) Directory layers

### 1.1 Raw sources (read-only for agents)

- Location: `knowledge/raw/`
- Rule: **Never edit existing raw sources.** Add new sources as new files only.
- Preferred format: markdown (`.md`). If you clip web pages, store them as markdown too.
- If a source includes images, keep them alongside the source under `knowledge/raw/assets/`.

### 1.2 Wiki (agent-maintained)

- Location: `knowledge/wiki/`
- The wiki is the **compiled, persistent** knowledge layer.
- You may create/update wiki pages when:
  - a new source is added
  - a user asks a question that produces a reusable answer
  - periodic “lint” detects gaps/contradictions/orphans

Required special pages:
- `knowledge/wiki/index.md`: catalog of wiki pages (content-oriented).
- `knowledge/wiki/log.md`: append-only operations log (chronological).

### 1.3 Product artifacts (app runtime)

- App artifacts live under `src/artifacts/` (once the app exists).
- Treat `src/artifacts/` as **runtime inputs** (ship with the app), not as the knowledge wiki.

## 2) How to ingest a new source

When a new file appears in `knowledge/raw/`:

- Read the source.
- Create (or update) at least:
  - a source summary page in the wiki (e.g. `knowledge/wiki/sources/<slug>.md`)
  - any impacted concept/entity pages (patterns, engines, UX rules, etc.)
  - `knowledge/wiki/index.md` (add the page + 1-line summary)
  - `knowledge/wiki/log.md` (append an entry)

### Log entry format

Use consistent headings for machine-grepability:

`## [YYYY-MM-DD] ingest | <source-title>`
`## [YYYY-MM-DD] query  | <topic>`
`## [YYYY-MM-DD] lint   | <summary>`

## 3) Wiki conventions

- Use relative links between wiki pages.
- Prefer short pages over giant “everything” pages.
- If there are contradictions between sources or decisions, record them explicitly in the wiki:
  - add a “Contradictions / Open Questions” section
  - link to both relevant pages

## 4) Product constraints from the project brief

From `docs/dsa-helper-project-brief.md`:

- Local-first: **no backend for MVP**.
- Storage: `localStorage` for progress; later `IndexedDB` for heavier AI indexes.
- Tech: React + Vite + TypeScript, Tailwind, Zustand, React Router.
- Avoid WebLLM; prefer Transformers.js (later phases).
- Dark-mode-first UI, calm/premium, pattern-based practice loop.

## 5) Task system

- Project plan and structured tasks live in `project/`.
- Use `Taskfile.yml` + `scripts/tasks.py` to list “what’s next” based on dependencies.

