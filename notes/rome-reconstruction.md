# Rome scene: evidence and current limits

## Status
The scene now intentionally includes the 18th-century Trevi Fountain alongside
the ancient-city base, as requested by the user. It is a cross-era composition,
not a depiction of one historically consistent date.

This is a schematic monochrome city, **not a surveyed archaeological reconstruction**.
The city boundary, river, monument coordinates, road routing, surrounding houses,
and most building elevations are approximate/procedural. Do not describe passing
collision tests or the building count as evidence of historical accuracy.

For the present ancient-city treatment, use an early fourth-century reference
period (before the second Circus Maximus obelisk of AD 357). This is a modelling
constraint, not a claim that every building has been historically validated.

## Two different venues, not duplicate Circus Maximus buildings

### Stadium of Domitian (the present Piazza Navona site)
Source consulted 2026-10-06:
https://www.turismoroma.it/en/places/stadium-domitian-archaeological-area

Rome's official tourism description states that it opened in AD 86, hosted
athletic competitions, measured 275 × 106 metres, and was a long rectangle with
one semicircular end and one straight, slightly oblique end.

Implementation: a 55 × 21.2 unit footprint preserves that length-to-width ratio.
The curved end faces approximately north. The arena is open: **no spina, no
obelisk and no chariot starting gates**. Seating tiers and elevations remain
simplified. This model does not depict the Baroque fountains or the later
Piazza Navona obelisk.

### Circus Maximus
Source consulted 2026-10-06:
https://www.turismoroma.it/en/places/torre-della-moletta-and-archaeological-area-%E2%80%8B%E2%80%8B-circus-maximus

This official description gives 600 × 140 metres and dates the erection of the
later obelisk to AD 357. The model uses 120 × 28 units, the same 0.2 units/metre
as the Stadium of Domitian. These nominal dimensions do not establish accuracy
of all phases of the seating, masonry or the surrounding city.

One model only, in the valley south/southwest of the Palatine. This is the chariot
racing venue, with a central spina, turning posts, and a bank of twelve starting
gates opposite the curved end. One obelisk represents the earlier imperial
arrangement; the later second obelisk is not included. The current footprint
and elevations still need an agreed scaled reconstruction plan before they can
be represented as metrically accurate.

## Remaining historical work
- Establish one dated, scaled base plan for the whole city rather than moving
  landmarks merely to resolve overlaps.
- Check the Tiber, hills, Aurelian wall outline and primary road alignments.
- Rebuild the other landmarks from their own plans; the forum models still use generalized courtyard geometry. The two baths now
  distinguish the axial natatio/frigidarium/tepidarium/caldarium, lateral palaestrae
  and Caracalla's round versus Diocletian's rectangular hot hall, but their dimensions
  and elevations are still schematic.
- Distinguish evidenced residential footprints from conjectural infill.

## Landscape and animated life
560 procedural monochrome cypresses, umbrella pines, olives and shrubs decorate
open pockets; 180 instanced walkers follow checked street-side routes. These are
conjectural visual additions, not mapped ancient planting/population records.

## Pool depth correction
Bath water was originally at exactly the podium top (base + 0.20), causing
z-fighting. It is now a single opaque plane at base + 0.30, above the podium
and below the coping. Courtyard roof strips no longer overlap at the corners.

## Bath exterior reference
Consulted 2026-10-06: Diana E. E. Kleiner's Yale lecture, republished by Brewminate:
https://brewminate.com/bigger-is-better-the-baths-of-caracalla-and-other-second-and-third-century-buildings-in-rome/

The lecture and reconstruction model distinguish internal groin vaults from the
exterior tiled pitched roofs, clerestories, axial bathing halls and twin palaestrae.
The revised exterior uses roof bays and arched high windows rather than exposed
pillow-like shells. Caracalla's southern caldarium is round; the Diocletian model
is still generalized massing and has not been checked against its own measured plan.

## Bridges and aqueduct
References consulted 2026-10-06:
- https://curate.nd.edu/articles/figure/Pons_Fabricius_Rome_Italy/24816537
  Notre Dame's architectural collection identifies the surviving Pons Fabricius
  as a 62 BC arch bridge. It is a typological reference, not a measured plan for
  the scene's bridges.
- https://en.wikipedia.org/wiki/Aqua_Claudia
  Background on the aqueduct's covered conduit, arcades near Rome and later
  extensions. The rendered single conduit is not a reconstruction of every
  historical stacked channel or repair phase.

Scene bridges now have open semicircular masonry arches, piers with cutwaters,
parapets and approach ramps; pedestrian/cart elevation follows the bridge deck.
The aqueduct has 18 open arches and a recessed, mostly covered specus with a gentle
inward fall. The small exposed channel sections are illustrative inspection
cutaways. Bridge counts, span sizes, aqueduct alignment and gradients remain
schematic; these are not exact models of named surviving structures.

## AI lab cover
The cover uses the user-supplied dense city close-up (2026-10-06), cropped to remove
the toolbar and fit the existing 1145 × 1374 portrait cover. It is a selected static
composition, not a live preview of the latest architectural changes.

## Structural follow-up (2026-10-06)
- Bridge approaches are solid embankments with continuous descending parapets.
- Aqueduct bed and side walls use a single graded mesh each; arch tops and cover
  slabs share the same gradient, removing the previous small steps at each bay.
- Pool coping now consists of four edge-matched strips without overlapping top
  faces. Water remains physically separated from the podium.
- The Caracalla caldarium drum has eight broad arched openings and a continuous
  cornice supporting its dome, replacing small rectangular surface decals. This
  is simplified structural massing; glazing, thermal rooms and measurements are
  not a surveyed reconstruction.
- The user's newly selected cover remains unchanged by these scene edits.

## Roads and Tiber treatment (2026-10-06)
The old independent road/water rectangles produced triangular gaps at bends.
Both now use shared cross-sections; the Tiber centreline is rounded within 1.5
scene units of its reserved corridor. Terrain is lowered beneath the water,
with low graded banks, rather than a grey sheet laid on top of the city. Bridge
piers and cutwaters extend below the water surface to the bed. Subtle monochrome
flow strokes follow the channel and obey the scene pause control.

Streets use world-aligned irregular stone paving with narrow curbs/drainage
joints, omitted at intersections and ramps. Bridge surfaces use the same paving;
no duplicate ground-level road is drawn through the water under a bridge.
97 checked links connect nearby lane ends and all six bridge approaches. Buildings
are placed after these links (1012 remain), preventing streets from cutting
through houses. Vegetation avoids the widened sloping bank zone.

This is a typological ancient-city treatment, **not a verified ancient road map**:
the existing guide routes and river course remain schematic, links are procedural,
and the paving pattern is an illustration, not a surveyed excavation texture.
No modern lane markings or nineteenth-century high Tiber embankments are added.
Selected cover image and other experiments are unchanged.

## Extramural countryside (2026-10-07)
Expanded the ground beyond the city walls and continued the river through the
surrounding landscape. Added four procedural hamlets (56 low farmhouses), 42
plots alternating grain, ploughed ground, orchard and vines, plus 150 scattered
rural trees (in addition to orchard trees). Dirt tracks connect individual homes
to through village streets; three roads join existing urban routes at wall gaps.
The eastern hamlet connects to the southern route outside the walls, avoiding
existing eastern housing and the aqueduct. Tests check both river clearance and
that gate connections do not intersect existing city buildings.

The new COUNTRYSIDE / 城外田园 tab frames the southern agricultural belt; ALL ROME
zooms out enough to include it. Existing cover art remains unchanged. These farms,
settlements, gate positions and crop patterns are illustrative additions, not
mapped or archaeologically verified imperial-era parcels.

## Pantheon detail and intentional Trevi addition (2026-10-07)
Sources consulted:
- https://www.turismoroma.it/en/places/pantheon
  Official description: cylindrical cella, Corinthian portico and pediment,
  Agrippa inscription, hemispherical dome; interior height equals its diameter
  (just over 43 m), oculus diameter 8.92 m, five rings of 28 coffers.
- https://www.turismoroma.it/en/places/trevi-fountain
  Official description: commissioned in 1732, Palazzo Poli backdrop,
  triumphal-arch facade, Oceanus, two sea horses and tritons, flanking allegorical
  niches and a large rocky basin. This is not an imperial-era monument.

The new Pantheon model has a hollow drum, a thick dome shell with a genuine
oculus, interior coffer frames, lower exterior steps, relieving-arch linework,
16 portico columns in 8+4+4 rows, simplified capitals, pediment and an Agrippa
inscription. The dedicated camera turns toward its northern entrance so the
portico is visible. These remain simplified details, not measured masonry or
fully sculpted Corinthian leaves.

Trevi is intentionally included at the user's request as an 18th-century,
cross-era landmark, explicitly dated in the bilingual selector and model data.
Its sculptural figures and sea horses are low-poly approximations. It occupies
a protected footprint northeast of the Pantheon rather than overlapping nearby
houses. The updated procedural housing count is 978, with 13 landmark footprints;
this density change reserves the fountain's building and forecourt.

The standalone COUNTRYSIDE / 城外田园 selector has been removed at the user's
request. Farms, villages, rural roads and enlarged terrain remain in the scene.
The chosen cover image is unchanged.

## Core architecture detail pass (2026-10-07)
The generic monument branches are replaced by `rome-architecture.js`; all static
parts still feed the scene's merged material/line batches rather than creating
thousands of independent draw calls. Existing city footprints, surrounding houses,
roads, cover art and camera rotation are retained.

- Colosseum: 80 bays per arcade storey, three orders of arcades with genuinely
  open arch geometry, an attic with alternating window panels and mast sockets,
  arena podium, 16 seating sectors and radial stair divisions. The seating has
  solid risers rather than suspended rings. The complete arena floor is an
  imperial reconstruction choice, not today's exposed hypogeum.
- Marcellus: semicircular two-storey arcades, ten seating wedges, orchestra,
  stage platform and a two-order, three-door scaenae frons. The backstage wall
  now has pilasters, windows and cornices. This is a conjectural complete ancient
  theatre, not the later apartments visible on the surviving monument.
- Forums: the Roman Forum is an asymmetric civic square with basilica ranges,
  temple, rostra, a small round shrine and an entrance arch. Trajan's precinct
  instead has an open colonnaded square, a transverse Basilica Ulpia with apses,
  separate library masses, an equestrian silhouette and a spiral-banded column.
  Ornament is stylized; the column band is not a reproduction of its reliefs.
- Temples: elevated podia, frontal stairs, deep pronaoi, column bases/capitals,
  entablatures, dentils and correctly front-facing pediments. The Capitoline
  model has three cellae; Claudius retains a single-cell arrangement.
- Palatine: the former central block is removed. An open peristyle and basin
  are framed by reception, dining and residential ranges with raised nave roofs.
- Baths: keep the corrected axial plan and water elevations, add thermal windows
  on both long and short elevations, buttresses, pool screens, paired columns,
  exercise-court exedrae and entrance arcades. The round Caracalla caldarium and
  rectangular Diocletian hot hall remain distinct.
- Circus/Stadium: add external arcaded substructures and stair divisions while
  preserving the chariot-versus-athletics distinction. No spina or obelisk is
  added to Domitian's stadium.
- Pantheon: lower drum now has a physical doorway aligned with the portico;
  door panels and porch coffers supplement the open oculus and interior dome
  coffers. Trevi receives deep arched niches, articulated capitals and balustrade
  details instead of only surface-darkened niche silhouettes.

All 13 landmarks can now be selected from the horizontally scrolling top strip.
Temple and theatre presets face their decorated fronts; orbit/reset still work.
Tests check finite geometry, protected footprints, true openings with raycasts,
seating/model vertex budget, scene wiring and the existing landscape regressions.
Curved seating is tessellated by arc length, avoiding full-circle subdivisions
on each small sector. The detail builders currently emit about 0.78M source
vertices before batching; this is a geometry guard, not a mobile FPS guarantee.

**Accuracy limit:** these are recognizable architectural reconstructions within
an existing schematic map, not measured models. The details above are modelling
choices based on the established monument types, not newly verified excavation
measurements. Statuary, internal circulation, roof construction, column orders
and elevations remain simplified. Trevi remains an explicitly labelled
18th-century addition to the imperial composition.


## Reference-led urban fabric correction (2026-10-07)
The user supplied a photograph of a dense Rome reconstruction model and rejected
our circular city distribution. It is used as a qualitative massing reference,
not as an orthographic/metric plan from which coordinates can be measured.

- Replace the near-convex oval wall by a 34-point concave, asymmetric perimeter:
  a narrow northern extension, eastern salients, a southern Appian wedge, and a
  smaller west-bank quarter. Wall lengths and coordinates remain illustrative.
- Remove elliptical rejection masks around neighbourhoods. Eighteen overlapping
  street-oriented patches now have explicit ownership boundaries; local roads
  follow each quarter's grain, rather than several grids crossing each other.
- Place close-set street frontage parcels first, then irregular edge infill.
  Oriented rectangular SAT/segment tests replace overly conservative circular
  building-to-building and building-to-road separation. Keep river, monument,
  wall, bridge and aqueduct clearance checks. Current seed: 1,590 residential
  footprints, 65 with open courtyards, about 80,154 square scene units built area.
- Preserve all 13 detailed landmark models and their relative positions. Avoid
  moving these merely to imitate a photograph's perspective. Reduce oversized
  empty foreground buffers and support the Palatine/Capitoline buildings with
  broader plateau terrain instead of a small mound under a tall exposed slab.
- Reserve country gate-road corridors BEFORE adding city houses. Reposition
  the four existing villages outside the new wall; keep their 56 houses and
  42 agricultural plots. The countryside outline is independent of the wall,
  rather than a uniformly scaled duplicate perimeter.
- Reframe the overview; keep manual pan/zoom/orbit and all landmark views.
  Clamp visible river strokes to the landscape footprint. Other experiments
  and the chosen static cover are unchanged.

Tests now check both convex and concave wall turns, north/east urban extensions,
minimum built area, courtyard population, true rectangular parcel clearance,
all three bridges' road connections, and rural gate paths. This does not establish
archaeological authenticity: the measured city plan, exact wall chronology and
hill/road profiles remain future reference work.

## Civic precinct and terrain clearance (2026-10-07)
The user highlighted the central Forum/Palatine/Capitoline area as both occluded
and overly fragmented. Numerical inspection reproduced a 7-unit terrain intrusion
into the Forum footprint: buildings were based at their centre elevation, while
the adjacent palace slope rose through their perimeter. `naturalHeightAt` now
remains the ungraded reference; shared `heightAt` grades each architectural
precinct to its original base datum, with a 6-unit apron plus a smooth 6-unit
transition. The apron is wider than a rendered terrain-cell diagonal, preventing
interpolated triangles from cutting through foundations. Road/car/pedestrian
heights use the same graded surface. The terrain keeps indexed smooth normals
instead of being merged into faceted triangles.

For the cluttered central area, `rome-civic-plan.js` now owns eight connected
streets and five bounded housing groups (60 homes). Procedural streets and random
housing are excluded from this zone. Only explicit arterial/bridge entries may
connect into it; the automatic nearest-lane links remain outside. Street widths
are 3.4–4.2 units, with real forecourt clearance, no tiny jitter segments, and
explicit T-junctions. Random planting in central open space is restricted to
street-side pockets. Cart numbers scale with route length rather than placing
four carts even on a tiny clipped road fragment.

The palace, Circus Maximus, Capitoline precinct and Trajan precinct have been
slightly repositioned to reserve legible passages, especially the Sacred Way
between palace and Forum. Their detailed geometry and historical relative order
are retained; these are deliberate schematic design changes, not new claims of
measured historical positions. Current total: 1,394 residential footprints.
An optional “核心城区 / CIVIC CENTRE” view frames this district for review.

Tests cover the Forum burial regression, all 13 footprint/terrain-grid clearances,
unchanged base elevations, a connected eight-street civic network, no random core
shortcuts/houses, landmark clearance, bridge entries, and the existing urban/rural
layout regressions. No other experiment or cover image is changed.

## Civic infill and everyday life (2026-10-06)
- Extended the southeast aqueduct from roughly 114 to 171 scene units. Its 28 spans retain the previous opening proportions and 0.6% gravity gradient rather than stretching 18 arches. Added schematic settling/intake and city distribution structures; these are illustrative, not claimed excavated locations.
- Enlarged all five civic squares. The main market is now 44 × 28 scene units (about 2.3 times the previous courtyard area), with stalls, a fountain and a tree-lined perimeter. Kept the eight-street civic hierarchy and pedestrian-only plaza approaches.
- Added six reserved lawn/garden areas, with terrain-conforming monochrome turf. Turf is cut away at streets, landmarks and furniture. Expanded grouped civic housing to 119 homes; the city plan currently totals 1,447 homes. Lawns and squares are reserved before residential placement.
- City planting now contains 1,050 collision-checked trees/shrubs, including 398 in the civic precinct, 75 plaza-edge plants and 67 garden/grove plants. This excludes the existing rural planting.
- 660 instanced pedestrians, including soldiers with helmet/shield/spear, nobles in long robes, merchants with hats/baskets and residents. 480 or more are allocated to civic streets/squares. Continuous walk/rest cycles and smaller playful residents add variety; shared furniture/tree footprints keep plaza loops clear. This is ambient crowd animation, not agent-to-agent collision simulation or a reconstruction of the historical population.
- Retained all existing monuments, grayscale treatment, bilingual navigation, rotation, pause and the separate Vietnam experiment. No Next.js migration.
