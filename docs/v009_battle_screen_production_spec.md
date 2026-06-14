# v009 Battle Screen Production Spec

Status: `DRAFT_BASELINE`

This spec defines the production pass boundary for the v009 battle screen. It does not change combat rules.

## Director Intent

The battle gameplay foundation is already validated:

- turn skill + trigger skill arrangement
- auto battle
- skill-order planning
- short repeatable combat loop

The next production work should improve what the player sees and understands, not restart the combat system.

## Baseline

Current evidence:

- UI inventory: `docs/v009_ui_inventory/README.md`
- battle screenshot: `docs/v009_ui_inventory/screenshots/02_battle_screen_boss.png`

Current 1600 x 900 battle layout:

- left side: area progression / combat entry panel
- center: combat scene, combatants, HP/shield/resource/status, skill row, battle log
- right side: task tracking and inventory

These regions are functional and should be treated as fixed unless a later director gate approves layout movement.

## Production Components

The finished battle screen is composed from four coordinated visual tracks:

1. faction/player character
2. enemy character
3. battlefield background
4. combat FX

UI polish is a separate but dependent track. Battle visuals must be judged inside the actual UI frame, not only as isolated art.

## Layer Contract

From back to front:

1. battlefield background
2. optional background atmosphere and ground accents
3. enemy character shadow / ground contact
4. player character shadow / ground contact
5. enemy character
6. player character
7. persistent buffs, shields, resource markers, and target indicators
8. attack travel FX
9. impact FX
10. floating damage / heal / crit numbers
11. trigger banner and skill banner
12. tutorial highlight and modal overlays

Rules:

- combo connection glow belongs below skill slots, not over the slot text.
- impact FX must visually attach to the target, not to the projectile midpoint.
- damage and crit numbers must remain readable over all backgrounds.
- Battle Log hidden must still leave the action understandable through motion, FX, floating numbers, and status markers.

## Player / Faction Character Track

Target:

- use the character-creator / paper-doll direction for player-side faction bodies where feasible
- support the eight v009 factions as the current build distinction
- readable at battle scale
- compatible with future body switching

Minimum first pilot:

- one faction body base
- two gender/body variants if the creator proof needs it
- three hair options
- three eye/face options
- one faction outfit
- battle placement preview

Required evidence before runtime promotion:

- native asset view
- 2x view
- 4x view
- 1600 x 900 battle placement screenshot
- alpha/transparent background check
- anchor and foot contact check
- side-by-side with the current placeholder

Gate labels:

- `CONCEPT_ART`: direction only, never formal runtime
- `PREVIEW_ASSET`: can be used for layout/anchor testing
- `PRODUCTION_SPRITE`: can be connected to formal runtime only after visual and technical QA

Do not connect generated character art directly to formal runtime if it lacks native-scale evidence, alpha evidence, and director approval.

## Enemy Character Track

First production target:

- one Blackwater Sand Plain normal enemy
- one Blackwater Sand Plain boss

Recommended pilots:

- normal enemy: wolf or scorpion family, because their silhouettes support repeated combat readability
- boss: Wolf King, because it is the first major player-facing boss and tutorial boss

Required evidence:

- native asset view
- 2x view
- 4x view
- battle placement screenshot beside the player
- boss/normal scale comparison
- hit FX alignment check

Boss note:

- Lv5 Wolf King remains a tutorial boss and should not be made visually or mechanically confusing for first-time players.
- Later bosses can carry heavier mechanics and longer fight pacing.

## Background Track

First production target:

- Blackwater Sand Plain battle background

Requirements:

- readable behind player, enemy, HP bars, buffs, and floating numbers
- enough atmosphere to sell the region without obscuring combat state
- no high-contrast clutter behind the main hit area
- tested with gun, blade, needle, crit, shield, and buff FX

Required evidence:

- clean background view
- background with UI overlay
- background with both combatants
- background with representative FX burst

## FX Track

Starting point:

- keep the verified v009 FX direction where it already works
- rebuild only where production character/background direction makes the old FX visibly inconsistent

Required FX inventory categories:

- melee hit
- sword / flying blade
- needle / projectile
- gunfire
- energy / seal impact
- shield
- dodge / counter / trigger
- crit number and crit impact

Technical rules:

- projectile angle and hit endpoint must align.
- hit ripple belongs on the target body.
- shield display should show total shield value as one bar, not segmented by source.
- trigger banners must not flicker and must be offset from normal skill banners.

## UI Safe Zones

Do not place production art or FX where it blocks:

- player HP / shield / resources
- enemy HP / shield / resources
- buff and debuff rows under HP
- skill slots
- auto-battle statistics window
- right-side tracking and inventory panels
- tutorial highlights and skip button

The battle scene can become richer, but the player must still read:

- who is acting
- what hit
- whether it crit
- what resource changed
- what trigger skill is ready or fired
- whether the enemy/player is close to death

## First Production Pilot Package

The first pilot should contain:

1. one player faction paper-doll proof
2. one normal enemy proof
3. one Wolf King proof
4. one Blackwater Sand Plain background proof
5. one UI battle-frame polish proof
6. one combined battle screenshot with Battle Log visible
7. one combined battle screenshot with Battle Log hidden

Pass condition:

- the director can judge the final visual direction from actual 1600 x 900 evidence
- the pilot does not require new gameplay rules to look good
- all assets have classification, native size, anchor notes, and runtime-readiness status

Fail condition:

- art only looks good as an isolated image
- character style floats between generations
- background makes numbers/FX unreadable
- UI polish changes workflow instead of presentation
- Battle Log hidden makes combat unclear

## Non-Goals

- no combat system redesign
- no new faction-build system inside a single faction
- no story expansion
- no large content expansion before the first visual production pilot is reviewed
- no promotion of placeholder or generated art without evidence
