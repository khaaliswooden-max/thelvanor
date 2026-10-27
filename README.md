# thelvanor.com

Site for Thelvanor, PBC: a sub-$1,000 solar-powered three-node data center in a stainless keg, built as an instrument and published as it is measured.

## Stack

Next.js (App Router, TypeScript), Tailwind v4, self-hosted fonts (Archivo variable, IBM Plex Mono). Fully static. Deployed on Vercel.

## Content

- `src/content/site.ts` — structured content: build status, phases, bill of materials, claims under test, research questions, volume list. Edit this to change numbers anywhere on the site.
- `content/log/*.md` — build-log entries. Front matter: `title`, `date`, `phase`, optional `step`, `summary`. Newest first on `/keg-1/log`.

### Logging a measurement

1. Add a Markdown file in `content/log/` named `YYYY-MM-DD-slug.md`.
2. If it resolves a claim, update the matching row in `claims` (grade and, when the site gains a measured column, the value).
3. If it is a purchase, fill `actual` on the BOM row.
4. Bump `status.measurements` and `status.spent` in `src/content/site.ts`.

## Develop

```
npm install
npm run dev
```

`npm run build` must pass before merging. `npm run lint` runs ESLint.

## Rules

Evidence grades match the preprint: VERIFIED (cited source), PLAUSIBLE (reasoned from evidence), SPECULATIVE (hypothesis to test), LESSON (withheld by design). A datasheet is a claim; a measurement is evidence. They never share a column.

## License

Code MIT. Papers CC BY 4.0.
