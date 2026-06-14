# v009 Visual Vertical Slice Contract

Status: `DRAFT_CONTRACT`

This document defines how to produce one small visual-production slice without destabilizing later production.

The goal is not to finish all art. The goal is to make the first finished-looking slice prove the rules that every later asset can follow.

## Scope

First vertical slice:

- one battle region: Blackwater Sand Plain
- one player-side faction character proof
- one normal enemy
- one tutorial boss: Wolf King
- one battle background
- one combat UI polish pass
- one representative FX set

Out of scope:

- no combat rule redesign
- no full eight-faction production batch
- no full enemy roster replacement
- no story/content expansion
- no final promotion of generated assets without director gate
- no Lua/procedural geometry drawings as art direction, art candidates, or visual-production samples

## Stability Strategy

The slice is small, but the contracts are broad.

Lock before production:

- viewport contract
- battle stage coordinate contract
- character anchor contract
- enemy anchor contract
- FX coordinate contract
- UI component token contract
- metadata schema
- screenshot and QA evidence format

Do not lock before director review:

- exact final character style
- exact final enemy rendering style
- exact final background treatment
- final UI palette and ornament density

This means the first slice can still be visually revised, but later revisions should not break placement, metadata, save data, or runtime integration.

## Viewport Contract

Baseline review viewport:

- 1600 x 900

Required responsive behavior:

- game frame remains anchored to browser top-left
- visual scale follows the existing game scale rules
- combat FX positions must scale with the same transform as the game frame

Every production candidate must be reviewed at:

- 1600 x 900 baseline
- one smaller desktop window
- one zoomed native/2x/4x asset board for pixel/art judgment

## Battle Stage Contract

The current v009 battle layout remains the reference.

Stable regions:

- left: area and battle-entry controls
- center: battle field, combatants, HP, resources, skill row, log/debug feed
- right: tracking and inventory

Safe rule:

- production art improves the center battle field
- it does not move confirmed workflows to new panels

Required stage anchors:

- player foot/root anchor
- enemy foot/root anchor
- player hit center
- enemy hit center
- player projectile origin where relevant
- enemy projectile origin where relevant
- buff/status row origin
- floating number origin

These anchors must be stored in metadata, not guessed ad hoc inside effect code.

## Character Creator Contract

The character creator should be treated as one shared character system plus faction outfit packs.

The first player-side proof is a `PREVIEW_ASSET` package that proves the shared specification. It does not need to prove all eight factions visually at once.

Stable shared character parts:

- body / gender base
- body variant key
- head anchor
- hair anchor
- eyes/face anchor
- root/foot pivot
- hit center
- attack origin
- layer order

Faction-specific parts:

- outfit pack as one clothing unit
- faction color/material language
- outer robe/armor/prosthetic cues
- faction-only silhouette accents contained inside the outfit pack

Production assumption:

- one faction and eight factions should differ mainly by outfit pack, not by rewriting the character system
- body, face, hair, anchor, and metadata rules must stay compatible across factions
- the first proof uses four selectable parts only: body/gender, hair, face/eyes, outfit
- the first proof must not split clothing into sleeves, weapons, foreground cloth, armor fragments, or other sub-parts
- if a later faction outfit truly requires an exception, it must pass a separate gate and be recorded in the outfit pack metadata, not hidden in runtime code

Required parts:

- body / gender base
- hair
- eyes/face
- faction outfit

Required metadata:

- asset classification
- faction key
- outfit pack key
- body variant key
- canvas size
- layer order
- root/foot pivot
- head center
- hair anchor
- eye anchor
- chest center
- pelvis center
- attack origin
- hit center
- outfit exception notes if any
- outfit source reference
- stance / pose reference
- runtime readiness
- source notes

Initial expectation:

- style direction: production-oriented cute pixel battle unit
- creator behavior: player can select visible current combination through direct left/right controls, not dropdown-first UX
- first proof is judged in battle context, not as isolated portrait art
- stance / pose must be chosen before generation
- outfit must be based on an existing approved faction direction, not invented as a generic costume

The slice may display only one faction outfit. The schema must prove that adding the other seven outfits is a content expansion task, not a new system task.

## Enemy Contract

Each enemy candidate must provide:

- native transparent sprite
- root/foot pivot
- hit center
- attack origin
- intended battle scale
- normal/boss classification
- region key

Wolf King rule:

- remains visually strong but must still support its role as the Lv5 tutorial boss
- visual upgrade must not imply late-game complexity in the first boss fight

## Background Contract

The first background is Blackwater Sand Plain.

Requirements:

- supports HP, shield, buff rows, damage numbers, and FX readability
- has region identity without busy detail behind combatants
- does not force UI text outlines or heavy dark overlays to stay readable

Required evidence:

- clean background
- background with player/enemy
- background with UI
- background with representative FX

Art-source rule:

- background candidates must be real raster art or pixel-art paintovers/generations
- procedural boxes, Lua-drawn shapes, gradients, and graybox geometry are allowed only as private layout debugging, not as director-facing art evidence

## FX Contract

FX should keep the verified v009 behavior where possible.

Stable requirements:

- projectile angle aligns with travel direction
- hit ripple sits on target hit center or endpoint
- impact FX is visually tied to damage number timing
- crit number has stronger expression than normal damage
- shield display aggregates total shield into one visible bar
- trigger effects are readable without creating banner flicker

FX must use stage anchors and current render transform. Do not hardcode screen coordinates that break after viewport scaling.

## UI Token Contract

The production UI pass should define tokens before repainting many screens.

Minimum token groups:

- panel background
- panel border
- title bar
- primary action
- secondary action
- disabled action
- danger/sell action
- craftable state
- uncraftable state
- selected state
- current body state
- locked state
- BIS one-line glow
- BIS two-line glow
- HP bar
- shield bar
- resource bar
- buff tag
- debuff tag
- trigger-ready glow

Rules:

- tokens must improve the existing layout, not replace the workflow
- one token should be reused across all matching surfaces
- do not solve one screen with bespoke styling that cannot scale to the rest

## Evidence Package

The first vertical slice is not complete unless it includes:

1. current screenshot reference
2. proposed production screenshot or mock
3. native art view
4. 2x / 4x art view
5. battle placement screenshot
6. Battle Log visible screenshot
7. Battle Log hidden screenshot
8. metadata files
9. pass/fail notes

## Pass Condition

The slice passes when:

- the director can judge visual direction from actual game-context evidence
- the same contracts can be reused for the next faction/enemy/background
- implementation does not require gameplay redesign
- assets have classification and runtime readiness labels
- UI polish preserves existing workflows
- combat remains readable with Battle Log hidden

## Fail Condition

The slice fails if:

- it only looks good as a standalone image
- anchors have to be manually corrected per skill
- UI polish forces workflow relocation
- character parts cannot support later creator variation
- the style cannot be repeated across factions
- FX breaks when the viewport scale changes
- metadata cannot tell whether an asset is safe to connect

## Next Execution Step

Create the first visual slice board:

- use the existing `02_battle_screen_boss.png` as the base
- mark stable UI regions
- mark replaceable art regions
- mark anchor points
- mark FX safe zones
- mark UI token targets

Director-facing visual evidence must use current screenshots, raster paintovers, or pixel-art asset candidates. Do not present Lua/procedural geometric drawings as the visual target.

This board should be director-review evidence before generating or integrating the first real asset batch.
