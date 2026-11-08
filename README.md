# Aero

Three.js game about a network nobody logged out of, rendered at 400×300 and scaled up with hard pixels. Style taken from [a reel by @snaptic_](https://www.instagram.com/reel/Dd4YWXbojO4/).

**Live:** [mpts.ie/games/aero](https://mpts.ie/games/aero/)

| Title | Ripple |
|---|---|
| ![Title](docs/title.jpg) | ![Ripple](docs/title_drop.jpg) |

| Tutorial | Copy |
|---|---|
| ![Tutorial](docs/cold_open.jpg) | ![Copy](docs/copy_login.jpg) |

| Crew | Arrival, sunset |
|---|---|
| ![Crew](docs/copy_crew.jpg) | ![Arrival, sunset](docs/arrival_1.jpg) |

| Arrival, hands | Arrival, glacier |
|---|---|
| ![Arrival, hands](docs/arrival_2.jpg) | ![Arrival, glacier](docs/arrival_3.jpg) |

| Arrival, hill | Arrival, end of the path |
|---|---|
| ![Arrival, hill](docs/arrival_4.jpg) | ![Arrival, end of the path](docs/arrival_5.jpg) |

| Lake | Memory player |
|---|---|
| ![Lake](docs/lake_tape.jpg) | ![Memory player](docs/memory_player.jpg) |

| Climb | Aiming |
|---|---|
| ![Climb](docs/climb.jpg) | ![Aiming](docs/climb_aim.jpg) |

| Pipe | |
|---|---|
| ![Pipe](docs/climb_pipe_in.jpg) | |

## Controls

The Controls button in the bar lists these, with the on-screen pad instead on touch screens.

| Key | Action |
|---|---|
| WASD / arrows | Walk (Shift runs) |
| Space | Jump |
| 1 | Roll your head forward |
| 2 | Throw your head to the next platform |
| Hold 1 / 2 + move the mouse | Aim at the spot under the cursor; release the key (or click) to send the head there |
| Hold 1 / 2 + WASD | Go back to aiming along your facing |
| Hold 1 / 2 + Shift (Copy, Arrival) | Formation: the runner nearest the middle of the crew aims, and everyone else copies its direction and distance |
| Drag (Copy, Arrival, puzzle levels) | Select, then Copy / Cut / Delete and click to paste. Cmd/Ctrl+C, Cmd/Ctrl+X and Delete also work. |
| Drag (Climb) | Look around |

Jump to a scene with `#s0` to `#s22`.

## Running it

```bash
cd public && python3 -m http.server   # then open /games/aero/
npm install && npm run deploy          # deploy the Cloudflare Worker
python3 tests/puzzles.py               # play every puzzle level in headless Chrome
```

## License

The code is [MIT](LICENSE). The visual style is after [@snaptic_](https://www.instagram.com/snaptic_/)'s reel.
