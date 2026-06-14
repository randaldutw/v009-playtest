# 離淵紀 v009 Playtest

Static web playtest build for GitHub Pages.

## Playtest URLs

- GitHub Pages: https://randaldutw.github.io/v009-playtest/
- RawGitHack fallback: https://raw.githack.com/randaldutw/v009-playtest/main/index.html

## Save Compatibility

Player progress is stored in browser `localStorage` with:

```text
liyuan_v009_playtest_save_v1
```

Do not change this key during content updates unless an explicit migration/reset plan is added. The in-game reset button is the intended way to clear progress.

Before pushing content or data updates, run:

```text
node tools/run_v009_checks.js
```

These checks catch broken Chinese/control characters in externalized data, verify script load order, confirm old v009 saves can still migrate, confirm current saves can roundtrip through `saveGame()` and `loadGame()`, validate data references, verify referenced asset files exist, check skill data integrity, and smoke-test battle startup across the eight playable classes.

GitHub Actions also runs the same check suite on pushes to `main` and `gh-pages`.

## Runtime Notes

- `index.html` is the entry point.
- Runtime assets are intentionally slimmed to referenced images, portraits, monster sprites, dialogue sprites, and `NotoSansTC-VF.ttf`.
- `.nojekyll` is included so GitHub Pages serves underscore-heavy asset paths directly.
- Current product-level decisions are recorded in `docs/v009_product_status.md`.
- Production backlog and director gates are recorded in `docs/v009_production_backlog.md`.
- The next production phase is defined in `docs/v009_next_phase_spec.md`.
