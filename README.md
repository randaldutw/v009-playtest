# 離淵紀 v009 Playtest

Static web playtest build for GitHub Pages.

## Save Compatibility

Player progress is stored in browser `localStorage` with:

```text
liyuan_v009_playtest_save_v1
```

Do not change this key during content updates unless an explicit migration/reset plan is added. The in-game reset button is the intended way to clear progress.

Before pushing content or data updates, run:

```text
node tools/check_text_integrity.js
node tools/smoke_save_migration.js
```

These checks catch broken Chinese/control characters in externalized data, verify script load order, and confirm old v009 saves can still migrate into the current runtime without losing core progress such as recruits, party slots, inventory, gear, chips, commissions, body slots, and auto-repeat state.

## Runtime Notes

- `index.html` is the entry point.
- Runtime assets are intentionally slimmed to referenced images, portraits, monster sprites, dialogue sprites, and `NotoSansTC-VF.ttf`.
- `.nojekyll` is included so GitHub Pages serves underscore-heavy asset paths directly.
