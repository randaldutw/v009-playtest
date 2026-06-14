# v009 Character Creator Research Sources

Status: `SOURCE_INVENTORY`

This document records which existing research files can safely inform the v009 character creator / paper-doll production track.

It is not approval to connect any of these assets to formal runtime.

## Usable Technical Reference

### v007 Mo Yan LoR-like Paper Puppet Package

Path:

`C:\Users\Randal\Documents\Codex\2026-04-26\codex\assets\preview\v007\characters\moyan\lorlike_paper_puppet_01`

Useful files:

- `manifest.json`
- `pivots.json`
- `reference_template_notes.md`
- `motions/`
- `front/`
- `head/`
- `viewer/`

Current metadata states:

- `asset_type`: `PREVIEW_ASSET`
- `runtime_ready`: `false`
- `production_sprite`: `false`
- `formal_runtime_integration`: `false`
- canvas: 1024 x 1024
- root pivot: approximately `[512, 930]`
- head/front layers are approximate crops, not clean separated source layers

How to use:

- use as a paper-doll package structure reference
- use its manifest/pivot shape as a starting model for new metadata
- use its viewer/state-switch direction as a proof-of-concept reference

Do not use:

- as production art
- as final v009 character style
- as a direct runtime sprite
- as proof that the creator system is production-ready

## Usable Faction Clothing Direction Reference

### v008 Portrait Faction Clothing Design Boards

Path:

`C:\Users\Randal\Documents\Codex\2026-04-26\codex\assets\concept\v008_portrait_faction_clothing_design_2026_06_02`

Useful status:

- `CONCEPT_ART`
- `DESIGN_DECISION_BOARD`
- `NOT_PIXEL_PRODUCTION`
- contains passed faction clothing direction boards

Useful concept files:

- `v008_portrait_faction_clothing_tianshu_pai_design_board_v002_blue_impression.png`
- `v008_portrait_faction_clothing_tang_jia_design_board_v002_green_impression.png`
- `v008_portrait_faction_clothing_chanlin_si_design_board_v003_hair_body_cultivator.png`
- `v008_portrait_faction_clothing_leishi_design_board_v002_black_orange.png`
- `v008_portrait_faction_clothing_xinhuo_bang_design_board_v002_grassroots.png`
- `v008_portrait_faction_clothing_wangchuan_du_design_board_v001.png`
- `v008_portrait_faction_clothing_emei_design_board_v002_shen_zhaoxi_echo.png`
- `v008_portrait_faction_clothing_huashan_jungong_design_board_v001.png`

How to use:

- use as director-approved faction clothing direction reference
- extract silhouette, color, faction read, and material cues into new production briefs
- rebuild as creator-compatible body/outfit layers before runtime use

Do not use:

- as runtime sprites
- as final pixel masters
- as 1:1 pasted source into v009
- as UI display text source

Encoding warning:

- the README in this folder contains mojibake in some Chinese faction names
- do not copy those damaged strings into code, metadata, or UI
- use v009 canonical class keys and display names from the current build instead

## Required New Output Shape

The first v009 character creator proof should be a new `PREVIEW_ASSET` package, not a direct reuse of older v007/v008 assets.

Minimum package contents:

- manifest with asset classification, runtime readiness, source notes, and faction key
- pivot data with root, head, chest, pelvis, and attack-origin estimates
- transparent native asset images
- battle placement screenshot at 1600 x 900
- native / 2x / 4x review board
- explicit `runtime_ready:false` until production gate passes

Recommended parts for the first proof:

- body base
- hair
- eye/face layer
- faction outfit
- optional front overlay for arms/weapons where needed

## First Gate

The director should judge the first proof from:

1. native-scale asset sheet
2. zoomed review board
3. actual battle placement screenshot
4. component breakdown
5. metadata and anchor notes

Do not ask the director to judge production suitability from an isolated beauty image alone.
