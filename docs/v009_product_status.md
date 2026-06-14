# v009 Product Status

This document records director-level decisions for the current v009 playtest. Do not reopen these as open validation questions unless the director explicitly changes direction.

## Confirmed Gameplay Base

- The current combat structure is viable:
  - turn skills
  - trigger skills
  - auto battle
  - player skill-order arrangement
- The build value in v009 comes mainly from the eight factions/classes, not multiple build branches inside one class.
- Future work should preserve the existing turn-skill and trigger-skill arrangement unless a concrete regression or director request requires change.

## UI Status

- Current UI is orderly and readable enough for playtest.
- It is not yet at final commercial product quality.
- UI work should focus on production polish, hierarchy, readability, spacing, interaction clarity, and visual finish rather than re-proving the core layout.

## Art Status

- Current player characters, enemies, dialogue portraits, and backgrounds should be treated as placeholder or preview-level assets for production planning purposes.
- They are sufficient for testing flow and scale, but far from final product art quality.
- Do not promote placeholder art to final production status without explicit director approval and visual evidence.

## Balance Status

- Numeric balance is expected to keep changing as content expands.
- Do not treat the current numbers as final.
- Balance checks should catch obvious breakage and outliers, not try to prove final tuning.

## Engineering Focus

- Protect save compatibility and public playtest stability.
- Keep GitHub Pages playable.
- Add checks that prevent broken data, missing assets, broken save migration, and unimplemented skills.
- Avoid revalidating already-confirmed gameplay direction unless new content changes the premise.

## Next Phase Focus

The next v009 phase has two priority tracks:

1. production-quality battle screen visuals, built from faction/player characters, enemy characters, backgrounds, and FX
2. production-quality UI visuals while preserving the current clear structure

Detailed execution notes are in `docs/v009_next_phase_spec.md`.
