# APEX verification

The production build completed successfully with `npm run build`. The asset suite passed all 14 tests, decoding all twelve supplied models and checking their original triangle counts, paint materials, image availability, sources and distinct paint options. Total retained geometry: 4,962,791 triangles; model files total approximately 267.1 MB. No extra geometry simplification was applied.

`scripts/verify-persian.mjs` exercised the experience in Brave with software WebGL. Its completed regression run passed 20 checks with no browser errors. It covered Persian/RTL layout, English names and numbers, the four-slide autoplay hero and timeline, laptop viewport sizes, scroll reveals, filtering, saved cars, specification tabs, gallery and enquiry dialogs, all twelve 3D models, the horizontally scrolling and mouse-draggable vehicle rail, day mode, paint changes, presentation mode, mobile navigation and restoring document scrolling after leaving the studio. Front and rear captures for all twelve cars are saved in `docs/qa/`.

Visual inspection identified and corrected shared cabin/lamp glazing, rear LED material colors, Audi's shared detail atlas being recolored as paint, and invisible helper geometry affecting Challenger framing. Original meshes and downloaded GLBs remain intact. Material inspection metadata is in `docs/light-material-audit.json`.

The final follow-up changes added the approved glass cards and fixed architectural background, dark About styling, distinct GT-R/Ghost colors and an always-visible presentation return button with Escape support. The user reviewed the resulting site and explicitly requested completion without further verification. No additional browser run was performed after that instruction.

These checks do not measure physical GPU frame rate. Existing user development server on port 5173 was preserved; the agent-owned production preview on port 4180 was stopped.
