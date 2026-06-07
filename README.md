# 離淵紀 v009 Playtest

Static web playtest build for GitHub Pages.

## Save Compatibility

Player progress is stored in browser `localStorage` with:

```text
liyuan_v009_playtest_save_v1
```

Do not change this key during content updates unless an explicit migration/reset plan is added. The in-game reset button is the intended way to clear progress.

## Runtime Notes

- `index.html` is the entry point.
- Runtime assets are intentionally slimmed to referenced images, portraits, monster sprites, dialogue sprites, and `NotoSansTC-VF.ttf`.
- `.nojekyll` is included so GitHub Pages serves underscore-heavy asset paths directly.
