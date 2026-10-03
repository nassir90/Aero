import json, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SKY = Image.open(os.path.join(HERE, "..", "..", "public", "games", "aero", "assets", "sky_wide.jpg")).convert("RGB")
W, H, FPS, BLUE = 1080, 1920, 30, (27, 117, 190)
ease = lambda u: 0 if u <= 0 else 1 if u >= 1 else u * u * (3 - 2 * u)


def save(name, frames, metas):
    d = os.path.join(HERE, "clips", name); os.makedirs(d, exist_ok=True)
    for i, im in enumerate(frames): im.save(os.path.join(d, f"f{i:05d}.jpg"), quality=90)
    json.dump({"fps": FPS, "w": W, "h": H, "frames": metas}, open(os.path.join(d, "meta.json"), "w"))
    print(name, len(frames))


def edge(dur=8):
    s = H / SKY.height; big = SKY.resize((round(SKY.width * s), H), Image.LANCZOS); span = big.width - W
    feats = [((300, 375), "L"), ((3075, 575), "R")]
    frames, metas = [], []
    for f in range(int(dur * FPS)):
        t = f / FPS; x0 = round(span * ease(t / dur)); frames.append(big.crop((x0, 0, x0 + W, H)))
        ann = []
        for (fx, fy), k in feats:
            x = fx - x0
            if 80 < x < W - 80: ann.append({"k": "call", "id": k, "x": x, "y": fy, "r": 34, "dx": 200 if x < W / 2 else -200, "dy": -200, "text": "cloud in the corner"})
        metas.append({"t": t, "ann": ann})
    return frames, metas


def band(masked, dur=8, top=700):
    ih = H - top; s = ih / SKY.height; img = SKY.resize((round(SKY.width * s), ih), Image.LANCZOS)
    a = np.ones((ih, 1), np.float32)
    if masked: ramp = int(ih * 0.32); a[:ramp, 0] = np.linspace(0, 1, ramp)
    frames, metas = [], []
    for f in range(int(dur * FPS)):
        t = f / FPS; x0 = round(150 * ease(t / dur)); crop = np.asarray(img.crop((x0, 0, x0 + W, ih))).astype(np.float32)
        out = np.empty((H, W, 3), np.float32); out[:] = BLUE
        out[top:] = crop * a[:, :, None] + np.array(BLUE, np.float32) * (1 - a[:, :, None])
        frames.append(Image.fromarray(out.astype(np.uint8)))
        fx = 200 - x0
        metas.append({"t": t, "ann": [{"k": "call", "id": "seam", "x": fx, "y": top + (40 if masked else 0), "r": 34, "dx": 220, "dy": -260, "text": "no seam" if masked else "seam"}]})
    return frames, metas


if __name__ == "__main__":
    which = sys.argv[1:] or ["sky_edge", "sky_seam", "sky_mask"]
    if "sky_edge" in which: save("sky_edge", *edge())
    if "sky_seam" in which: save("sky_seam", *band(False))
    if "sky_mask" in which: save("sky_mask", *band(True))
