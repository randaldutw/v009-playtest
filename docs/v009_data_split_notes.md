# v009 Data Split Notes

This playtest now loads several pure data files before `app.js`:

- `data/codex_entries.js`
- `data/tianya_news.js`
- `data/progression_data.js`
- `data/item_core_data.js`
- `data/event_dialogue.js`
- `data/crafting_data.js`

Before pushing content or data updates, run:

```text
node tools/run_v009_checks.js
```

## Current Guardrails

- Keep `liyuan_v009_playtest_save_v1` unchanged.
- Put new save shape changes through `migrateSave()` and `normalizeSave()`.
- Keep external data script tags before `app.js`.
- Do not move data that depends on runtime helper functions into preloaded data files without converting it to plain data first.

## Blocked Direct Split

`CLASS_DATA` and skill definitions currently cannot be directly moved into a preloaded data file because skill entries are built with the runtime helper:

```js
skill("tianshu_three", "三點參直", 1, "...", { coefficient: 3 })
```

If class/skill data is externalized later, convert it into plain JSON-like records first, then rebuild skill objects inside `app.js` after `skill()` exists. Do not load raw `skill(...)` calls from an external data script before `app.js`.

Class and skill integrity is currently covered by:

```text
node tools/check_class_skill_integrity.js
```
