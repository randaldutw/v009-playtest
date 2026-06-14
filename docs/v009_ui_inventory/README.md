# v009 UI Surface Inventory

This inventory records the current v009 UI surfaces before the production visual pass.

Status: `REVIEW_BASELINE`

Purpose:

- preserve the current working layout as the functional baseline
- identify which visual surfaces need production polish
- avoid accidentally redesigning validated workflows while upgrading presentation quality

Capture environment:

- viewport: 1600 x 900
- date: 2026-06-14
- build root: `C:\Users\Randal\Documents\Codex\v009-playtest`
- scenario: stable debug state with unlocked workshop, inventory, body switch, tracking, and a boss battle surface

The screenshots are evidence for layout and visual QA only. They are not director approval of final art quality.

## Screenshot Index

| File | Surface | Purpose |
| --- | --- | --- |
| [01_home_map_tracking_inventory.png](screenshots/01_home_map_tracking_inventory.png) | Home / map / tracking / inventory | Main non-combat hub layout with right-side tracking and inventory present. |
| [02_battle_screen_boss.png](screenshots/02_battle_screen_boss.png) | Battle screen | Current combat composition with boss, HP bars, skill row, log, and side panels. |
| [03_tactics_skill_order.png](screenshots/03_tactics_skill_order.png) | Skill order | Skill equipment and order-management surface. |
| [04_workshop_crafting.png](screenshots/04_workshop_crafting.png) | Workshop crafting | Forge list, recipe details, material requirements, and inventory side panel. |
| [05_body_switch.png](screenshots/05_body_switch.png) | Body switch | Eight-body switching interface and body status rows. |
| [06_inventory_tooltip.png](screenshots/06_inventory_tooltip.png) | Item tooltip | Small inventory with an active item tooltip. |
| [07_inventory_expanded.png](screenshots/07_inventory_expanded.png) | Expanded inventory | Large centered inventory overlay with filters and item rows. |
| [08_commission_tracking.png](screenshots/08_commission_tracking.png) | Commissions / tracking | Quest list and material tracking presentation. |

## Surface Notes

### 01 Home / Map / Tracking / Inventory

Structure to preserve:

- left-side area progression and combat entry flow
- central player/status/workspace area
- right-side task tracking and inventory access

Production gaps:

- panel materials, title bars, buttons, and item rows still feel like a functional web prototype
- repeated right-side panels need a stronger shared component language
- active state, available state, and disabled state need clearer hierarchy without adding extra explanation text

Polish target:

- keep the same workflow, but give the hub a production-grade frame, typography, and button treatment
- make inventory and tracking readable at a glance without visually competing with the battle scene

### 02 Battle Screen

Structure to preserve:

- center combat field with player on the left and enemy on the right
- HP/shield/resources/status below combatants
- skill row and battle controls below the battlefield
- right-side tracking and inventory remain available

Production gaps:

- player character, enemy sprite, and background are still placeholder/preview-level
- battle scene lacks a finished foreground/background layer language
- UI panels visually compete with the battle image because all elements share similar weight

Polish target:

- replace the battle image layer with production character, enemy, background, and FX assets
- keep combat readability when Battle Log is hidden
- give active stage and current battle entry a visible but controlled highlight

### 03 Skill Order

Structure to preserve:

- equipped skill row
- skill detail tags and effect text
- order-management focus

Production gaps:

- draggable slot affordance and combo connection visuals need more deliberate depth/layering
- skill detail blocks need a more polished information hierarchy
- trigger/passive/round tags should be treated as a stable visual language

Polish target:

- make ordering and combo readiness visually legible without relying on explanatory text
- keep current skill rules and slot behavior intact

### 04 Workshop Crafting

Structure to preserve:

- forge category/list
- item details and material requirement blocks
- tracking control
- inventory access remains on the right

Production gaps:

- recipe rows, availability, and tracking state need clearer color and density rules
- available/unavailable crafting state still reads like a debug list
- material requirement rows need stronger alignment and item identity treatment

Polish target:

- keep the current crafting flow
- improve recipe grouping, craftability feedback, and item preview quality
- default collapsed equipment groups should remain collapsed unless the player opens them

### 05 Body Switch

Structure to preserve:

- eight possible bodies as the complete body capacity
- each body occupies one row
- current body, switchable body, blank body, and locked body states remain distinct

Production gaps:

- row rhythm, button weight, and locked/unlocked hierarchy need visual refinement
- body identity should be readable without cramped text
- primary action buttons should stay compact so body information has space

Polish target:

- make the eight-row layout feel intentional and premium, not merely less cramped
- preserve the existing body-switching rules and save compatibility

### 06 Item Tooltip

Structure to preserve:

- item identity, stats, BIS cue, and action buttons
- equip/unequip action as the most prominent action
- sell/dismantle as secondary actions

Production gaps:

- tooltip needs a final production standard for width, placement, and edge clamping
- primary versus secondary action weight can be clearer
- item type, rarity/value, and main-stat relevance need better visual grouping

Polish target:

- ensure the whole tooltip remains inside a 1600 x 900 viewport
- close reliably when clicking elsewhere
- keep equip/unequip clear and immediate

### 07 Expanded Inventory

Structure to preserve:

- centered expanded list
- category/filter controls
- item rows with equipment/material distinction

Production gaps:

- overlay is functional but visually flat and heavy
- filter controls and item rows need stronger scan readability
- long loot lists need wrapping and density rules that do not crush text

Polish target:

- make this the primary high-comfort inventory management surface
- keep the compact inventory for quick access
- improve filter hierarchy before adding new inventory features

### 08 Commissions / Tracking

Structure to preserve:

- commission list and tracking list are separate same-level concepts
- tracking shows material collection progress
- entries can be expanded/collapsed without leaving unnecessary filler text

Production gaps:

- commission and tracking identity should be visually distinct but not split into unrelated screens
- entry body text must match the same typography level as other description fields
- collapsed groups should simply collapse and leave empty space if needed

Polish target:

- keep the current combined window structure
- make progression, completion, and tracked-material state clearer

## Cross-Surface Rules

- Do not move core workflows unless there is a director-approved layout change.
- Preserve save compatibility and existing feature keys.
- Do not promote placeholder art to production.
- Any new art connected to runtime must be classified as `PREVIEW_ASSET` or `PRODUCTION_SPRITE` with evidence.
- Production visual QA must include at least one pass with Battle Log hidden.
- Avoid UI text that explains obvious controls; clarity should come from hierarchy and interaction design.
