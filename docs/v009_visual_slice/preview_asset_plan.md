# v009 Visual Slice PREVIEW_ASSET Plan

Status: `READY_TO_START`

This plan starts from the approved v002 concept direction:

- `docs/v009_visual_slice/concept_art/v009_battle_visual_concept_mock_v002.png`

The goal is to stop generating whole-screen concept art and begin producing constrained preview assets that can be tested in the existing v009 layout.

## Approved Direction To Preserve

Use v002 for:

- Blackwater Sand Plain production mood
- player versus Wolf King scale relationship
- corrupted purple-black Wolf King presence
- dark jade / black panel base
- restrained gold active highlights
- cyan information/resource highlights
- purple boss danger accents
- cleaner HP/shield and skill slot treatment

Do not use v002 for:

- left-side thumbnail-card region list
- new navigation layout
- large inventory icon dominance
- fake text density
- direct runtime art
- exact generated pixel shapes

## Package 1: Player Paper-Doll Proof

Asset type:

- `PREVIEW_ASSET`

Purpose:

- prove the shared character base plus faction outfit-pack model
- do not create eight separate character systems

First proof content:

- one shared cute 3-head battle body base
- one hair option
- one eyes/face option
- one faction outfit pack
- optional front overlay if the outfit needs sleeve/weapon overlap

Required output:

- transparent native asset parts
- assembled preview
- 2x / 4x review board
- 1600 x 900 battle placement preview
- metadata JSON

Metadata must include:

- `asset_type: PREVIEW_ASSET`
- `runtime_ready: false`
- body variant key
- outfit pack key
- faction key
- canvas size
- layer order
- root/foot pivot
- head center
- hair anchor
- eye anchor
- chest center
- pelvis center
- hit center
- attack origin
- exception notes

Pass condition:

- outfit can change while body/anchor contract stays stable
- the unit reads clearly at battle size
- the style can plausibly support all eight factions through outfit packs

Fail condition:

- faction outfit requires a unique body system
- anchor shifts when outfit changes
- it only works as a portrait, not as a battle unit

## Package 2: Wolf King Proof

Asset type:

- `PREVIEW_ASSET`

Purpose:

- turn the approved v002 boss presence into a standalone enemy candidate

Required output:

- transparent native Wolf King candidate
- 2x / 4x review board
- battle placement preview against current v009 UI
- hit-center and attack-origin note
- metadata JSON

Required visual traits:

- large corrupted wolf silhouette
- purple-black energy core language
- readable head, body, legs, and hit area
- boss presence without hiding HP bars or skill UI
- compatible with Lv5 tutorial boss role

Pass condition:

- reads as Wolf King at gameplay distance
- target hit point is visually obvious
- impact FX can attach to the body, not empty space

Fail condition:

- too much painterly detail that collapses at battle scale
- silhouette unclear
- boss blocks UI or HP bars

## Package 3: Blackwater Sand Plain Background Proof

Asset type:

- `PREVIEW_ASSET`

Purpose:

- produce one background candidate based on the v002 mood while preserving combat readability

Required output:

- clean background image
- battle UI overlay preview
- player/enemy placement preview
- representative FX readability preview

Required visual traits:

- dark sand wasteland
- ruined structures and old-tech relic traces
- warm dust atmosphere
- controlled contrast behind combatants
- no clutter behind HP/shield/floating numbers

Pass condition:

- supports units and FX without forcing heavy text outlines
- region identity is clear
- battle field leads the eye

Fail condition:

- background competes with damage numbers
- too many small high-contrast details
- generic fantasy ruins without Liyuan/cyber-wuxia cues

## Package 4: UI Token Mock

Asset type:

- `PREVIEW_ASSET`

Purpose:

- apply the approved material direction to the current v009 layout without changing workflow

First UI targets:

- panel background
- panel border
- active navigation button
- normal navigation button
- disabled/locked state
- HP bar
- shield bar
- resource accent
- skill slot
- trigger-ready highlight
- inventory item row
- tracking entry row

Required output:

- token sheet
- current-layout mock screenshot
- before/after comparison

Rules:

- no left-side thumbnail-card region list
- no new full-screen layout
- no oversized inventory icon grid
- text must remain readable in Chinese once real labels are restored

Pass condition:

- current workflow remains recognizable
- active/available/disabled states are clearer
- combat field remains the visual priority

Fail condition:

- UI polish requires moving features
- ornament reduces scan readability
- token style cannot be reused across workshop, inventory, body switch, and tracking

## Integration Gate

None of these packages can enter formal runtime until:

- director approves visual direction
- metadata is present
- alpha/background checks pass
- 1600 x 900 battle placement is reviewed
- Battle Log hidden readability is checked
- runtime readiness is explicitly changed from `false`

## Immediate Work Order

1. Create player paper-doll proof first.
2. Create Wolf King proof second.
3. Create Blackwater Sand Plain background proof third.
4. Create UI token mock fourth.
5. Assemble one combined battle placement preview.

Reason:

- the player and boss scale relationship is the strongest approved part of v002
- background and UI should then be adjusted around those units
