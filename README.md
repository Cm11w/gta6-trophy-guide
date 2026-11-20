[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Cm11w/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Cm11w/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI, all 55 trophies

An offline web app that guides you to the Grand Theft Auto VI platinum on PlayStation 5: a tracker over all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze), each with its official name, description and grade, a guide in our own words that cites its sources, a roadmap to the platinum, and missable flags built from the official descriptions.

## What it does

- **Checklist** — tick trophies off as you earn them; progress saves in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, side quests, crime, exploration, misc), by grade, by earned/not earned, plus text search.
- **Spoiler setting** — hides the names and descriptions of the 28 hidden story trophies until you earn them (or turn the setting off).
- **Roadmap to Platinum** — four stages: the five-chapter story (60–80 hours), the 100% Completion checklist (~100 hours), Strangers & Freaks and misc cleanup (~10 hours), then the platinum.
- **Missable warning** — the list's only possibly missable trophy, Positive Mental Attitude (the Chapter 1 meditation at Jason's house), is flagged everywhere it matters.
- **Cited guides** — every trophy's guide names its sources beside it (PowerPyx's trophy guide and roadmap, Exophase's trophy list, Boosting Factory's trophy guide). Guides were written 20 November 2026, the day after the game released; where a detail is still unconfirmed, the guide says so. No guide text is copied from any source.

## Run it

No build step, no network needed at run time. Any static server works:

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static file server and open `app/index.html`.

## Layout

- `app/index.html`, `app/app.js`, `app/style.css` — the app.
- `app/data/trophies.json` — the 55 trophies with official names, descriptions, grades, hidden flags, kinds, missable flags, roadmap stages, guides and sources, plus the roadmap itself.
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `screenshots/` — four real renders of the app (cover, roadmap, missable filter, trophy detail).

## Notes

- Cheats disable trophies and saving — keep them off on a platinum run.
- There is no mission replay, so keep a manual save at the start and end of each chapter.
- One playthrough is enough; there is no online trophy and no DLC trophy.
- This guide is fan-made and not affiliated with Rockstar Games. It uses no Rockstar logo, artwork or game screenshots.

## License

MIT — see [LICENSE](LICENSE).

Built for [make.fun](https://make.fun/?ref=ywgem12g&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) — enter via the referral link above.
