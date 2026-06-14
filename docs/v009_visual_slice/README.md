# v009 Visual Slice Review Package

Status: `CONCEPT_ART_REVIEW`

This folder records the first director-facing visual exploration for the v009 production battle-screen direction.

These images are `CONCEPT_ART`.

They are not runtime assets, not production sprites, not UI implementation, and not formal game integration.

## Images

| File | Status | Use |
| --- | --- | --- |
| [concept_art/v009_battle_visual_concept_mock_v001.png](concept_art/v009_battle_visual_concept_mock_v001.png) | `CONCEPT_ART / NEEDS_WORK` | Broad mood exploration. Useful for atmosphere and material direction. |
| [concept_art/v009_battle_visual_concept_mock_v002.png](concept_art/v009_battle_visual_concept_mock_v002.png) | `CONCEPT_ART / REVIEW_CANDIDATE` | More constrained layout exploration. Useful for battle-scene polish direction. |

## v001 Review

Useful:

- stronger battlefield atmosphere than the current placeholder
- corrupted boss presence is closer to production intent
- dark jade / black / gold / cyan UI material direction is promising
- skill slot treatment suggests a usable production component language

Reject / do not inherit:

- multiple player figures
- left-side region list converted into collectible cards
- right-side inventory becoming too visually dominant
- excessive total-screen redesign
- too much high-detail painterly density for a first runtime direction

Conclusion:

- keep as mood reference only
- do not use as layout reference

## v002 Review

Useful:

- one player unit and one boss unit are correctly emphasized
- central battlefield has a more production-ready read
- player scale and boss scale create clear combat hierarchy
- UI material treatment is more coherent than the current prototype
- skill row and HP bars have a clearer final-game direction

Reject / do not inherit:

- left-side region list still becomes thumbnail-card style
- inventory icons are too prominent for a combat-first view
- text/glyph density is too high
- lower character/equipment area is more redesigned than needed
- exact image is not pixel-production-safe and cannot be used as runtime art

Conclusion:

- use v002 as the first visual direction reference
- next iteration should preserve the current v009 layout more strictly while borrowing only:
  - combat scene depth
  - boss/player scale relationship
  - dark jade/black/gold/cyan material language
  - cleaner HP/skill component treatment

## Stable Rules After v002

Keep:

- current v009 screen structure
- one player unit
- one enemy/boss unit
- right-side tracking + inventory as secondary panels
- left-side region list as text-first progression list, not image cards
- battle scene as the visual focus

Avoid:

- Lua/procedural geometry as director-facing art
- wireframe/graybox mock as visual target
- generic fantasy/gacha UI
- unreadably dense ornament
- full layout redesign before director approval
- treating generated concept art as runtime-ready

## Next v003 Prompt Direction

Goal:

- produce a stricter paintover-style concept that keeps the current v009 functional layout
- reduce UI novelty
- push only battle-scene art, panel material, skill slot polish, HP/shield polish

Prompt constraints:

- no left-side thumbnails
- no extra character portraits outside existing lower info panel
- no oversized inventory icon grid
- combat field must occupy the same center region as the current screenshot
- panels should be upgraded visually but retain current proportions

## Gate

Before generating runtime candidates, director should decide:

- whether v002's battle-scene mood is directionally acceptable
- whether the dark jade / black / gold / cyan UI material language is acceptable
- whether player/boss scale relationship is acceptable

If these are acceptable, the next production step is not another full-screen concept. It is a constrained `PREVIEW_ASSET` package for:

1. one paper-doll player body/outfit proof
2. one Wolf King enemy proof
3. one Blackwater Sand Plain background proof
4. one UI token mock applied to the current layout
