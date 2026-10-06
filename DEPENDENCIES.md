# Dependencies

Checked on 7 October 2026. "Latest" is from `npm view` / `pip index`. "Active" means the GitHub repository is not archived and had commits in the last month (checked with the GitHub API).

## The game (`public/games/aero/index.html`)

| Dependency | Loaded from | Version | Latest | Notes |
|---|---|---|---|---|
| three.js | cdnjs `three.js/r128/three.min.js` | r128 (2021) | r186 | Upgrading means moving to ES modules / an import map (the global build was dropped around r160), `colorSpace` instead of `outputEncoding` / `sRGBEncoding`, and retuning the lights. |
| Silkscreen, Open Sans, IBM Plex Mono | Google Fonts | – | – | |

Everything else in the game is written in the file: physics, aiming, selection, audio, the sea, the runner.

## Site and deploy (`package.json`)

| Package | Declared | Installed | Latest | Used by |
|---|---|---|---|---|
| cf | `^1.0.0-beta.5` | 1.0.0-beta.8 | 1.0.0-beta.12 | `npx cf deploy` |
| @cloudflare/vite-plugin | `beta` (a moving tag) | 2.0.0-beta | 1.63.0 stable | the Worker build; pin it so builds repeat |
| vite | `^8.3.0` | 8.3.1 | 8.3.3 | the Worker build |
| typescript | `^7.0.2` | 7.0.2 | 7.0.2 | `npm run typecheck` |
| puppeteer-core | `^23.11.1` | 23.11.1 | 25.12.0 | only `studio/capture.mjs` (the square site clips) |

## Videos and tests

| Tool | Where | Version | Notes |
|---|---|---|---|
| TapaTab | `~/projects/TapaTab` | 1.0.0 | records `promo/takes.mjs`; Node 22+, no npm dependencies |
| ShadowKit | `~/projects/ShadowKit` | – | builds `promo/videos/*` |
| Python + Playwright | ShadowKit's `.venv` | Python 3.9.6, playwright 1.60.0 | runs `tests/puzzles.py`; Python 3.9 has been end-of-life since October 2025 |
| Google Chrome | `/Applications/Google Chrome.app` | 154 | used by TapaTab, the tests and `studio/capture.mjs` |
| ffmpeg / ffprobe | Homebrew | 9.0.2 | encoding, mixing, loudness |
| Gemini TTS | Vertex AI, through ShadowKit `voice.py` | gemini-3.8-flash-tts | narration |

## Written here, with maintained alternatives

| What | Where | Alternative | Recommendation |
|---|---|---|---|
| Character controller (box push-out, coyote time, jump cut) | `stepKinematic` | [Rapier](https://github.com/dimforge/rapier) (Apache-2.0, active; the JavaScript bindings now live in its `typescript` folder, as the old rapier.js repository is archived) | Keep. Rapier is about 1.5 MB of WASM for about 25 lines, and the feel is tuned by hand. |
| Head throw and roll arcs, aim beads | `headTravel`, `aimGuide` | [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) (MIT, active) only speeds up raycasts | Keep |
| Easing and smoothing | `smooth`, lerps | [tween.js](https://github.com/tweenjs/tween.js) (MIT), GSAP | Keep: they are one-liners |
| Box selection, context menu, copy/cut/paste | `marquee`, `screenBounds`, `placeBeside` | three's `SelectionBox` addon | Keep |
| Follow and drag camera | climb and puzzle scenes | [camera-controls](https://github.com/yomotsu/camera-controls) (MIT, active) | Keep, unless you want free orbit, zoom or camera collision later |
| Chord pad and chimes (Web Audio) | `chime`, the pad | [ZzFX](https://github.com/KilledByAPixel/ZzFX) (MIT, about 1 KB, active) | Consider, if you want jump, land and throw sounds |
| Pixel look (low-resolution render, CSS upscale) | `fit`, renderer size | pmndrs [postprocessing](https://github.com/pmndrs/postprocessing) PixelationEffect | Keep: rendering small is cheaper and sharper |
| Text on canvas textures | signs, tape, panels | [troika-three-text](https://github.com/protectwise/troika) (MIT, active) | Keep: smooth text would fight the pixel look |
| Word timings for subtitles (silence detection and syllable counting) | ShadowKit `align.py`, `words.py` | [whisperX](https://github.com/m-bain/whisperX) (BSD-2, active), which aligns words with a phoneme model | Adopt whisperX when the venv moves to a newer Python: the cut-out spoken word depends on these timings. Not stable-ts: its repository is archived and development is paused. |
| Loudness (single-pass `loudnorm`) | ShadowKit `build.py` | [ffmpeg-normalize](https://github.com/slhck/ffmpeg-normalize) (MIT, active) | Consider: one pass misses the target on short clips |
| Frame capture | TapaTab | Playwright video recording (not frame-exact) | Keep TapaTab, and port `studio/capture.mjs` to it so puppeteer-core can go |
