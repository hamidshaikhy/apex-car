# Campaign image prompts

Mode: built-in `image_gen` tool. No external image API or API key.

Final assets are saved in `public/assets/editorial/` as WebP. The original generated PNGs remain in the Codex generated-images directory.

Shared brief: a single photorealistic automotive campaign photograph, landscape 16:9; low front three-quarter view facing left; whole car on the right 70% of the image; left dark negative space for website copy; monumental charcoal concrete architecture; warm amber opening at far right; polished dark concrete floor, real reflections and grounded tire contact shadows; detailed materials, glass, tires and brakes; no typography, interface, collage or watermarks.

- `revuelto-hero.webp`: orange Lamborghini Revuelto with Y-shaped LED headlights, black carbon aero and black engineered wheels. Crisp metallic paint with expensive softbox reflections; dramatic warm side light and deep blacks.
- `mustang-hero.webp`: Performance Blue 2020 Shelby GT500, S550 generation, white twin racing stripes, cobra grille, large hood vent, black forged wheels.
- `amg-hero.webp`: metallic silver 2016 Mercedes-AMG GT C190 silhouette, pre-facelift single-bar grille and large three-pointed star, long bonnet and dark multi-spoke wheels. No Black Series wing.
- `bmw-hero.webp`: 2021 BMW M4 Competition G82 in Sao Paulo Yellow, large vertical double kidney grilles, black 19/20-inch multi-spoke wheels and carbon roof. No CSL red accents.

The final prompt for each asset combined its subject description above with the shared brief. The earlier generated grey CSL image is superseded by the yellow Competition image.

## Extended collection and fixed background

All additions used the built-in image generation tool. The shared vehicle brief was a photorealistic automotive campaign in a monumental dark concrete garage, restrained amber daylight at far right, reflective dark stone floor, complete car on the right 70–75%, nose pointing left, dark empty left quarter, no UI/text/watermark.

Final subjects: amethyst McLaren Senna; pearl white Nissan GT-R R35; ice blue Porsche 992 911 Targa 4S; red Audi RS5 B9 coupe; burgundy modern Dodge Challenger (2009 reference); French blue Bugatti Tourbillon; British racing green Aston Martin One-77; midnight black Rolls-Royce Ghost. These are concept illustrations, not inventory photographs. Most gallery crops reuse their corresponding illustration.

Final Challenger prompt: Photoreal premium automotive campaign photograph, wide 16:9. A modern 2009 Dodge Challenger SRT8 two-door muscle coupe in pure deep burgundy metallic paint, black wheels and tires, four round headlights inside the wide rectangular dark grille, unmistakable 2008–2010 modern third-generation Challenger silhouette, wide muscular body, low planted stance, subtle factory hood vents and small rear lip spoiler. Front-left three-quarter view, nose left. Complete car on the right 72%, leftmost 25% dark and empty. Monumental dark concrete luxury garage with columns and amber daylight from an opening at far right; polished stone reflections, high-end photographic realism. No text, UI, watermark or toy appearance.

Final background prompt: Ultra-photorealistic architectural photograph, wide 16:9, for the fixed background behind frosted glass automotive cards. Empty monumental luxury atelier, no vehicles, people, words or logos. Charcoal sculptural concrete walls and vertical ribs, polished near-black stone floor, narrow amber light at a distant opening on the right, otherwise neutral soft photographic lighting. Quiet tactile realism, balanced subtle texture, generous central negative space. No furniture, screens, decorative neon or excessive highlights.

New final assets: `public/assets/editorial/atelier-background.png` (original PNG) and `challenger-2009.webp` (lossless conversion). Generated originals remain in `C:/Users/hamid/.codex/generated_images/01a198fc-eb06-7f20-9cc6-a8e995b081c2/`: background `exec-dded7161-d7a5-49cd-b5bd-6e74b5f63513.png`, Challenger `exec-27683423-c491-4f3a-99f3-0f939996a5ef.png`.
