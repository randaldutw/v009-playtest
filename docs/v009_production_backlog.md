# v009 Production Backlog

This backlog follows `docs/v009_product_status.md`. It assumes the current combat foundation is validated and focuses on moving the playtest toward a production-quality version.

## Engineering Without Director Gate

- Keep save compatibility stable.
- Keep GitHub Pages playable after every update.
- Keep checks passing:
  - text integrity
  - cache keys
  - save contract
  - save migration
  - save roundtrip
  - data references
  - asset paths
  - class/skill integrity
  - battle start smoke
- Add more smoke coverage for player flows where the expected behavior is already explicit:
  - create character
  - enter first battle
  - finish battle
  - craft gear
  - open item tooltip
  - equip and unequip gear
  - switch body
  - auto battle start/stop
- Keep refactors scoped to data extraction, testability, and stability.

## UI Production Polish

Current UI is readable and organized, but not final product quality.

Work direction:

- Improve visual hierarchy without changing the confirmed feature layout.
- Tighten spacing and density across 1600x900 and smaller windows.
- Make buttons, tabs, panels, and item lists feel like one coherent system.
- Improve item tooltip, inventory expansion, workshop, body switch, and combat panels first because they are repeated core surfaces.
- Preserve current clarity while improving finish.

Director gate:

- Any major UI visual language change.
- Any layout change that moves core features to different places.
- Any palette/type treatment that changes the game's visual identity.

## Art Production Gap

Current art is placeholder/preview level.

Needs later production direction:

- player faction sprites
- enemy sprites
- dialogue portraits
- battle backgrounds
- map/settlement backgrounds
- UI material assets

Near-term safe work:

- Catalog current art as placeholder/preview/final-candidate.
- Record native size, anchor assumptions, and runtime use for each asset.
- Identify which assets are hard blockers for a shareable demo versus later production.

Director gate:

- Promoting any current placeholder to production.
- Choosing a final character art pipeline.
- Choosing final enemy/background style.
- Replacing a director-approved visual asset.

## Balance Work

Current numbers are not final and will keep moving with content.

Safe checks:

- Detect broken skills, dead turns, missing resources, impossible fights, and extreme outliers.
- Keep Lv5 wolf king accessible as tutorial boss.
- Keep Lv20 boss checks as signal reports, not final pass/fail.

Director gate:

- Any class identity change.
- Any major resource loop redesign.
- Any change that removes the skill-order planning value.

## Next Useful Work Order

1. Produce a current UI surface inventory with screenshots.
2. Produce a battle-screen art replacement inventory:
   - faction/player characters
   - enemies
   - background
   - FX
3. Recover and summarize usable character-creator / paper-doll research.
4. Prepare the first visual production pilot package.
5. Add browser-level smoke tests for the confirmed core flows once the visual pilot begins touching runtime screens.

The detailed next-phase spec is `docs/v009_next_phase_spec.md`.

Current production-phase baseline files:

- `docs/v009_ui_inventory/README.md`
- `docs/v009_battle_screen_production_spec.md`
- `docs/v009_character_creator_research_sources.md`
