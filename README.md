# Aero

A small three.js game, served at https://mpts.ie/games/aero/.

- `public/games/aero/` is the game: open `index.html` or run `python3 -m http.server` from `public/` and visit `/games/aero/`.
- `studio/` renders the promo and dev-log videos frame by frame from the running game. `videos/capsrv.py` receives the frames and `videos/mux.sh` adds the voiceover and music.
- `npm install`, then `npx cf deploy` to publish the Cloudflare Worker.
