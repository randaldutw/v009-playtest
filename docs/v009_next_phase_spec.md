# v009 Next Phase Spec

This spec records the next production phase after v009 gameplay validation.

## Fixed Assumption

The v009 architecture is considered stable. Do not spend the next phase revalidating the basic combat model.

Confirmed:

- turn skills + trigger skills work as the combat base
- auto battle works
- arranging skill order has player-facing value
- the current UI is clear enough structurally, but not production-quality visually
- current player art, enemy art, backgrounds, and many UI materials are placeholder/preview-level
- balance will continue moving with content expansion

## Phase Goals

There are two priority tracks.

### 1. Production-Quality Battle Screen

The battle screen should become a production-quality visual scene built from four coordinated parts:

- faction/player characters
- enemy characters
- battle backgrounds
- combat FX

The player/faction character side should use the researched character-creator / paper-doll direction where feasible.

### 2. Production-Quality UI Visuals

The UI should keep the current clear structure but move toward final commercial quality:

- stronger visual hierarchy
- more coherent component language
- better panel, button, tooltip, tab, inventory, workshop, and body-switch presentation
- better polish without moving core functions around

## Battle Screen Track

### Faction / Player Characters

Target:

- production-ready faction character runtime assets
- compatible with character creator / paper-doll composition research
- readable at current battle scale
- suitable for the eight v009 factions

Current useful references:

- `assets/preview/v007/characters/moyan/lorlike_paper_puppet_01`
- `assets/concept/v008_portrait_faction_clothing_design_2026_06_02`
- `data/portrait_catalog.js`
- current v009 player portrait runtime paths under `assets/generated/v008/portraits/`

Working assumptions:

- Character visuals should not be generated as one-off unrelated sprites.
- Hair, face/eyes, clothing/faction outfit, and body silhouette should be separable enough to support creator-system reuse.
- The in-game first visible result can still use limited poses if the FX carries most action readability.
- Do not promote any generated output to production without director review at native scale and in battle context.

First deliverable:

- one faction character creator proof package
- includes a small selectable set:
  - gender/body base
  - hair
  - eyes/face
  - faction outfit
- shown as:
  - native asset view
  - 2x / 4x view
  - battle-screen placement view

Director gate:

- visual style approval
- character proportion approval
- faction read approval
- paper-doll composition approval

### Enemy Characters

Target:

- production-quality enemy sprites for the current Blackwater Sand Plain set
- readable silhouettes
- clear normal enemy versus boss hierarchy

Current runtime assets:

- `assets/v009_runtime_preview/monsters/`

First deliverable:

- enemy sprite status board
- choose one normal enemy and one boss as production pilot candidates
- provide native/2x/4x plus battle placement screenshots

Director gate:

- final enemy style direction
- boss scale and silhouette language

### Battle Backgrounds

Target:

- production-quality battlefield backgrounds that support readability
- Blackwater Sand Plain first
- background should not compete with characters, HP, FX, or floating numbers

Current runtime asset:

- `assets/v009_runtime_preview/backgrounds/blackwater_sand_plain_battle_bg_760x260_v001.png`

First deliverable:

- Blackwater Sand Plain background direction board
- at least two production-style candidates before integration
- include battle UI overlay preview

Director gate:

- final background style
- color/contrast relationship with combat units and FX

### Combat FX

Target:

- keep the verified v009 FX direction where it already works
- make FX visually consistent with production characters and backgrounds
- preserve combat readability

Current useful reference:

- `v009_verified_fx_library.js` if present in the work root or referenced build history

First deliverable:

- FX inventory by skill family
- identify which FX are already acceptable, which need polish, and which must be rebuilt after character/background style is chosen

Director gate:

- any major FX style replacement
- any change that makes combat harder to read without Battle Log

## UI Visual Production Track

Target:

- keep current structure
- raise perceived quality to production level
- avoid redesigning core workflows without cause

Priority surfaces:

1. main combat/home layout
2. inventory and item tooltip
3. workshop crafting
4. body switching
5. skill arrangement
6. codex / commissions / tracking

First deliverable:

- UI surface screenshot inventory at 1600x900
- mark each surface:
  - acceptable structure
  - visual weak points
  - candidate polish scope

Director gate:

- visual language direction
- palette/material treatment
- typography and frame style
- any major layout relocation

## Immediate Next Work

1. Build a screenshot inventory for current UI surfaces.
2. Build an art replacement inventory for the battle screen:
   - player/faction characters
   - enemies
   - background
   - FX
3. Recover and summarize usable character-creator / paper-doll research without importing old broken files blindly.
4. Prepare the first production pilot:
   - one faction character creator proof
   - one normal enemy
   - one boss
   - one Blackwater background
   - one UI surface polish pass

Stop for director only when there is visual evidence to judge.
