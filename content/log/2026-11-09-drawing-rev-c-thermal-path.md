---
title: Drawing rev C and the thermal-path decision
date: 2026-11-09
phase: 0
summary: Exploded assembly drawing K1-SOL-EXP-01 rev C and a CAD model were produced. The drawing shows a tray-and-bridge thermal path; the BOM supports plate-on-wall. Plate-on-wall governs.
---

## What was produced

- Exploded assembly drawing K1-SOL-EXP-01 rev C, mm [in], not to scale, status "illustrative, not released for fabrication."
- A CAD model of the solar cluster (`.glb`, Draco-compressed to 385 KB for the site) and three rendered views: exterior, front cutaway, front-left cutaway.
- All four now appear on the site. The CAD exterior replaces the earlier concept render in the home hero; the cutaway replaces the earlier blueprint illustration.

## Where the drawing agrees with the design

Keg 216 OD × 637 tall (8.5 in × 25 in), 212 ID. Panel 900 × 550 × 35, VIF. Two INA226 monitors placed as the preprint places them (#1 on the PV line, #2 on the bus feed). BME280 on the internal tray. Main fuse holder present and labelled "size per Lesson 1." Three safety notes carried in the title block. Parts list matches the BOM for 15 of 18 items.

## Where it does not

Items 4, 5, and 8 on the drawing, an internal tray, three aluminium bosses (15 × 15 × 14.9), and three curved thermal bridges, describe a different heat path from the one in the preprint and the BOM. The BOM has passive heatsinks, one 3 mm aluminium plate (~6 × 12 in), thermal pads, and M2.5 standoffs. It has no bosses and no bridges.

## Decision

The design is the one the BOM permits: a 3 mm aluminium plate bolted to the keg wall, each SoC through a thermal pad into the plate. Rev D of the drawing will correct items 4, 5, and 8 to match. The thermal claim under test on the Keg-1 page ("shell rise is small; the SoC-to-plate interface dominates") stands as written.

## Open values

Dimensions marked VIF (panel envelope, keg height, battery envelope) remain unverified. Standoff offsets (120 min, 170 min), node pitch (115), and gland azimuths are design intent, not measurements. Nothing on the drawing is evidence yet.
