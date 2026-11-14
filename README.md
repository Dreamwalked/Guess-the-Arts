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
