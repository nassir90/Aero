# Aero

A short three.js game about a network nobody logged out of. It renders at 400×300 and scales up with hard pixels. Play it at https://mpts.ie/games/aero/.

![Title: a sea of ones and zeros](docs/title.jpg)

## Scenes

The bar under the game steps through each scene. You can also jump straight to one with `#s0` to `#s9`.

| | |
|---|---|
| ![Copy, before logging in](docs/copy_login.jpg) | ![Copying the crew](docs/copy_crew.jpg) |
| **1. Copy.** The room starts empty; Log in spawns the runner. Drag a box around him and pick Copy, Cut or Delete. The dashed box follows the selection as it moves and resizes with depth. | Copies walk together. While you carry a copy, grey ghosts preview where it will land. Delete everyone and Log in comes back. Hold Shift while aiming heads and the crew keeps its formation. |
| ![Title](docs/title.jpg) | ![A drop leaving the sea](docs/title_drop.jpg) |
| **2. Title.** Hover to stir the sea of digits. | Click to drop a ripple. The centre sinks, rebounds into a peak, and throws off a blob of digits. The blob falls back in and sends out one smaller ripple. |
| ![Arrival, sunset and daffodil](docs/arrival_1.jpg) | ![Arrival, hands and penguin](docs/arrival_2.jpg) |
| **3. Arrival.** A glass walkway between "welcome back." and "We Missed You", with blocks flying along its whole length. | Photos float beside it at different heights. They are generated, then reduced to 128 px and a 48-colour palette before the game loads them. |
| ![Arrival, glacier and dunes](docs/arrival_3.jpg) | ![Arrival, green hill and butterfly](docs/arrival_4.jpg) |
| A blue glacier, sand dunes, | a green hill and a golden butterfly. |
| ![Arrival, the end of the path](docs/arrival_5.jpg) | ![Cold open](docs/cold_open.jpg) |
| The path ends at a blue "We Missed You" sign. | **4. Cold open.** Text cards. |
| ![Halcyon](docs/halcyon.jpg) | ![The lake](docs/lake_tape.jpg) |
| **5. Halcyon.** The cloud warden, low-poly and turning. | **7. The lake.** A found tape: square, blown out, with a pixel subtitle. |
| ![Memory player](docs/memory_player.jpg) | ![The climb](docs/climb.jpg) |
| **8. Memory player.** A draggable media player window over the level. | **10. The climb.** Pillars fading into white, four memories to collect, and a pipe home. |
| ![Aiming a head throw](docs/climb_aim.jpg) | ![Rolling into the pipe](docs/climb_pipe_in.jpg) |
| Tap **2** to throw your head to the next platform. Hold 2 and move the mouse to aim at a spot, then release the key or click. The path shows as silver beads ending at a ring; pink beads mean the head would fall. | The pipe lies on the top plaza. Once all four memories are found, roll your head into it with **1**. |

## Controls

| Key | Action |
|---|---|
| WASD / arrows | Walk (Shift runs) |
| Space | Jump |
| 1 | Roll your head forward |
| 2 | Throw your head to the next platform |
| Hold 1 / 2 + move the mouse | Aim at the spot under the cursor; release the key (or click) to send the head there |
| Hold 1 / 2 + WASD | Go back to aiming along your facing |
| Hold 1 / 2 + Shift (Copy scene) | Formation: the runner nearest the middle of the crew aims, and everyone else copies its direction and distance |
| Drag (Copy scene) | Select, then Copy / Cut / Delete and click to paste. Cmd/Ctrl+C, Cmd/Ctrl+X and Delete also work. |
| Drag (Climb) | Look around |

## Layout

- `public/games/aero/` is the game. Run `python3 -m http.server` in `public/` and open `/games/aero/`.
- `studio/` renders the promo and dev-log videos frame by frame from the running game. `videos/capsrv.py` receives the frames and `videos/mux.sh` adds the voiceover and music.
- `docs/` holds the screenshots above.
- `cloudflare.config.ts` and `src/index.ts` define the Cloudflare Worker that serves `public/`. Run `npm install`, then `npx cf deploy`.
