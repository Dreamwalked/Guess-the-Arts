# Guess the Arts

A Next.js App Router game: ten open-answer culture prompts per day, with fixed rarity scoring and a playable archive. The expanded catalog currently includes 35,696 accepted question/answer pairs, up from 817 curated entries. Built with Next.js 16.3.4 and React 19.2.6.

## Run locally

Use Node.js 22 or newer. Extract this project into `Documents/Guess the Arts`, open a terminal there, and run:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. `npm test` checks the question schedule, answer matching, scoring, and Chicago date rollover. `npm run build` generates a static website in `out/`; serve that directory using any static web server. `next start` does not support static exports.

## Included

- Twelve editions across October 21–November 1, 2026, with ten questions each. October 31 uses the user-selected lineup; four prompts are also available on earlier dates.
- One accepted answer per round, skip, answer reveals, results, and copyable spoiler-free scores.
- Per-edition browser-local progress, including unfinished sessions.
- Responsive daily landing page, archive, and instructions.
- No timer; daily calendar uses America/Chicago.

## Editing questions

`lib/questions.json` defines each prompt and its curated answers, explicit aliases, and points. `lib/question-bank.mjs` merges these with the downloaded records in `lib/catalog/`, retaining curated scores and merging duplicate titles and aliases. `lib/days.json` maps ISO dates to exactly ten question IDs. Add a dated entry to release another edition. There is deliberately no automatic question generation: after the seeded dates, the home page directs players to the archive until a new edition is added.

Five rarity tiers use illustrative editorial values: Common (20), Uncommon (40), Rare (60), Epic (80), and Legendary (100), not population-based rarity statistics. New database entries receive 60 demo points; existing curated scores are preserved. The accepted-answer catalog remains non-exhaustive. Unknown answers permit retries; punctuation, capitalization, accents, a leading “The”, and explicit alternate titles are normalized while preserving non-Latin letters. Near matches offer up to three suggested corrections. The player must explicitly confirm a suggestion before it is scored. Short or unrelated inputs do not reveal answer suggestions. Suggestions use edit distance, including adjacent swapped letters, against titles and aliases.

## Refreshing the answer catalog

Run `npm run refresh:answers` with internet access, then rebuild or let the development server reload. No API keys are required for these public sources:

- Wikipedia: thematic category membership and reviewed title lists, with work-type infobox checks to exclude lists, people, unrelated pages, and disambiguation pages. Future/unreleased works are excluded where the metadata identifies them.
- Wikidata: actor/film cast relationships, existing publication dates, alternate titles, exact MusicBrainz artist IDs, and running times. Feature-film prompts require at least 40 minutes of running time when importing category records.
- Open Library: work titles, alternate titles, dates, and subjects. Thematic imports require exact matching subject labels after search; vague search results such as “Horror & ghost stories” alone do not establish that a book has a ghost character. Children's book additions use the more conservative Wikipedia classifications.
- MusicBrainz: albums tied to exact artist IDs. The website-default release-group filter removes bootleg-only groups; secondary types such as live albums, compilations, soundtracks, and remixes are excluded.
- TVmaze: character names linked to the exact show's IMDb ID, avoiding remakes with similar names. Reviewed Wikipedia character-list sections supplement principal-cast records.
- Box Office Mojo and The Numbers: worldwide theatrical lifetime grosses for the October 31 billion-dollar question. Only totals strictly greater than US$1 billion qualify; domestic totals are not used.

## October 31 edition

`lib/october31.mjs` defines the revised lineup and the six new prompts. `lib/days.json` schedules them in the requested order, reusing the existing color-title, animated-TV, Taylor Swift, and book-adaptation questions.

- Supernatural entities include ghosts, spirits, vampires, demons, angels, and other paranormal beings.
- The billion-dollar threshold uses worldwide theatrical US-dollar earnings, including re-releases and without inflation adjustment. The snapshot is dated October 31, 2026; later refreshes retain that dated box-office snapshot.
- An artist's first studio album can be by a solo artist or a band. Earlier EPs and mixtapes do not disqualify a studio debut. Imported debut-category entries must also be classified as studio albums in Wikidata.
- West Coast includes California, Oregon, and Washington, plus reviewed artists associated with the scene. Category imports require an explicit rapper occupation in Wikidata, so producer-only and DJ-only credits do not qualify.
- The no-lyrics question accepts instrumental tracks and compositions. Known sung/spoken-word exceptions such as Tequila and Wipe Out are excluded from the instrumental-category import.
- Time-travel fiction spans books, films, series, comics, anime, and video games; general articles about time travel, devices, and characters alone do not count as works.

Saved results are checked against the scheduled question IDs in order. Progress from the previous October 31 lineup is not applied to the new questions. Other dates' compatible progress remains available under the existing `gta-v2` storage key.

To refresh only the new Wikipedia criteria, run `node scripts/refresh-catalog.mjs --provider=wikipedia --only=oct31`. Refresh the financial sources with `node scripts/refresh-catalog.mjs --provider=boxoffice`.

Each imported answer retains provider, source URL, and criterion metadata. Links appear on the answer reveal and in its searchable, paginated accepted-answer list. The How to Play page includes provider and license links. These are source classifications, not a guarantee of perfect or exhaustive coverage; ambiguous narrative questions still benefit from editorial review. Add or revise criteria in `scripts/catalog-config.mjs` and validation rules in `lib/catalog-rules.mjs`.

The importer caches responses for seven days in `.catalog-cache/`, follows pagination, throttles requests per provider, retries temporary errors, and preserves existing records for jobs that fail. `lib/catalog/refresh-report.json` records failures, and a failed refresh exits nonzero. A specific provider can be refreshed with `node scripts/refresh-catalog.mjs --provider=wikipedia`; `--fresh` bypasses the cache. `CATALOG_BOOK_LIMIT` controls the search window per book query (default 600). Set `CATALOG_USER_AGENT` to an application/contact identifier for regular public API usage. Avoid repeatedly running fresh imports: reuse the cache and respect provider policies. Players use the checked-in snapshots and do not make live API requests when submitting answers.

This prototype runs entirely in the browser: answer lists are visible in the bundle, progress is local to the browser, and there is no shared leaderboard, account sync, or anti-cheat protection. Those features would require server-side validation and storage.

## Structure

- `app/page.jsx`: interactive game and archive
- `app/globals.css`: responsive design and CSS artwork
- `app/layout.jsx`: HTML shell and metadata
- `app/accepted-answers.jsx`: searchable answer reveal with source links
- `public/cosine.png`: supplied logo, also used as the browser icon
- `lib/game.mjs`: matching, scores, and date utilities
- `lib/question-bank.mjs`: merged curated and sourced answer catalog
- `lib/october31.mjs`: October 31 lineup, prompt hints, and curated answers
- `lib/edition-rules.mjs`: box-office chart parsing and strict threshold checks
- `lib/catalog/`: cached answer snapshots, source attribution, and refresh report
- `scripts/refresh-catalog.mjs`: repeatable public-database imports
- `scripts/catalog-config.mjs`: prompt-specific source queries and reviewed criteria
- `tests/game.test.mjs`: data and gameplay checks
- `tests/catalog.test.mjs`: source validation, matching, merging, and coverage checks
- `tests/october31.test.mjs`: selected-question order, financial thresholds, source classifications, and progress compatibility

The site uses optional Google Fonts with local serif and sans-serif fallbacks.

## Version 2

55 specialist prompts have been replaced with broad themes and familiar media categories. Navigation and question changes always fade out and slide in, with smooth height changes. The score and progress stay visible between rounds. Each answer has an explicit `rarity` field consistent with its points; these remain editorial demo assignments, not measured popularity.

Because prompts and scores changed, this version saves to `gta-v2` in localStorage. Old `gta-v1` progress remains intact but is not used for the revised editions.

No new dependencies are required for the expanded catalog. Keep the `lib/catalog/` snapshots, new source files, and supplied logo when copying the project. Restart `npm run dev` if necessary.
