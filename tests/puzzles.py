import json, os, socket, subprocess, sys, time
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
with socket.socket() as _s:
    _s.bind(("127.0.0.1", 0)); PORT = _s.getsockname()[1]
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "-b", "127.0.0.1", "-d", ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(100):
    try: socket.create_connection(("127.0.0.1", PORT), .1).close(); break
    except OSError: time.sleep(.05)
results = []

def run(browser, name, fn):
    b = browser.new_context(viewport={"width": 1280, "height": 900}); pg = b.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(f"http://127.0.0.1:{PORT}/games/aero/index.html", wait_until="networkidle")
    pg.wait_for_function("typeof window.__aeroJump === 'function'")
    pg.evaluate("window.requestAnimationFrame = () => 0; document.documentElement.style.scrollBehavior = 'auto'; document.getElementById('frame').scrollIntoView({ block: 'center' })")
    G = Game(pg, name)
    try: ok, note = fn(G)
    except Exception as e: ok, note = False, f"exception: {e}"
    if errs: ok, note = False, note + f" | page errors: {errs[:2]}"
    results.append((name, ok, note)); print(("PASS" if ok else "FAIL"), name, "-", note, flush=True)
    b.close()

class Game:
    def __init__(s, pg, level):
        s.pg = pg; pg.evaluate(f"__aeroJump(__aeroSceneAt('{level}'))"); s.step(.6)
        s.level = s.pg.evaluate("__aeroActive().debug ? __aeroActive().debug().level : null")
    def scene_after(s, *names):
        try: s.pg.wait_for_function("names => names.includes(document.getElementById('sceneName').textContent)", arg=list(names), timeout=8000)
        except Exception: pass
        return s.pg.evaluate("document.getElementById('sceneName').textContent")
    def step(s, sec): s.pg.evaluate(f"__aeroStep({sec})")
    def dbg(s):
        d = s.pg.evaluate("__aeroActive().debug ? __aeroActive().debug() : {}")
        if s.level and d.get("level") != s.level: d["done"] = True
        return d
    def client(s, p):
        k = s.pg.evaluate("(() => { const f = document.getElementById('frame'), r = f.getBoundingClientRect(); return [r.left, r.top, r.width / f.clientWidth]; })()")
        return k[0] + p["x"] * k[2], k[1] + p["y"] * k[2]
    def proj(s, x, y, z): return s.client(s.pg.evaluate(f"__aeroActive().project({x}, {y}, {z})"))
    def hold(s, key, sec, every=.05, until=None):
        s.pg.keyboard.down(key); t = 0
        while t < sec:
            s.step(every); t += every
            if until and until(s.dbg()): break
        s.pg.keyboard.up(key); s.step(.05)
    def select(s, i):
        c = s.client(s.dbg()["crew"][i]["screen"]); m = s.pg.mouse
        m.move(c[0] - 45, c[1] - 70); m.down(); m.move(c[0], c[1], steps=4); m.move(c[0] + 45, c[1] + 70, steps=4); m.up(); s.step(.05)
    def clip(s, kind): s.pg.keyboard.press("Control+" + ("c" if kind == "copy" else "x")); s.step(.05)
    def paste(s, pad):
        p = s.client(s.dbg()["pads"][pad]["screen"]); s.pg.mouse.move(*p, steps=3); s.step(.05); s.pg.mouse.click(*p); s.step(.3)
    def head(s, key, x, y, z):
        s.pg.keyboard.down(key); s.step(.05)
        a = s.proj(x, y, z); s.pg.mouse.move(a[0] - 20, a[1] - 20); s.step(.05); s.pg.mouse.move(*a, steps=4); s.step(.1)
        s.pg.keyboard.up(key); s.step(2.0)

def z(d, i=0): return d["crew"][i]["pos"][2]






def every_scene(g):
    n = g.pg.evaluate("document.getElementById('sceneSel').options.length")
    for i in range(n): g.pg.evaluate(f"__aeroJump({i})"); g.step(.5)
    return True, f"stepped through {n} scenes"

def lvcopy(g):
    g.hold("KeyW", .3); d = g.dbg()
    if "copy" not in d["abilities"]: return False, f"crystal not picked up, at z {z(d)}"
    g.select(0); g.clip("copy"); g.paste(0); d = g.dbg()
    if len(d["crew"]) != 2: return False, f"copy not pasted (crew {len(d['crew'])}, carry {d['carry']})"
    g.hold("KeyW", 4, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"crew {[c['pos'] for c in d['crew']]}, gates {d['gates']}"

def lvcopy_without_copy(g):
    g.hold("KeyW", 4); d = g.dbg()
    return not d["done"], f"walking straight ahead: done={d['done']} (expected False), z {z(d)}"

def lvsync(g):
    g.select(0); g.clip("copy"); g.paste(0); d = g.dbg()
    if len(d["crew"]) != 2: return False, "copy not pasted"
    g.pg.keyboard.down("KeyW"); jumped = False
    for _ in range(140):
        g.step(.05); d = g.dbg()
        if not jumped and z(d) < -3.5: g.pg.keyboard.down("Space"); g.step(.3); g.pg.keyboard.up("Space"); jumped = True
        if d["done"]: break
    g.pg.keyboard.up("KeyW"); d = g.dbg()
    return d["done"], f"gates {d['gates']}, crew {[c['pos'] for c in d['crew']]}"

def lvsync_one_body(g):
    g.pg.keyboard.down("KeyW"); jumped = False
    for _ in range(140):
        g.step(.05); d = g.dbg()
        if not jumped and z(d) < -3.5: g.pg.keyboard.down("Space"); g.step(.3); g.pg.keyboard.up("Space"); jumped = True
    g.pg.keyboard.up("KeyW"); d = g.dbg()
    return not d["done"] and not d["gates"][0], f"alone: gate open={d['gates'][0]}, done={d['done']} (both expected False)"

def lvcut(g):
    g.hold("KeyW", .3); d = g.dbg()
    if "cut" not in d["abilities"]: return False, "cut crystal not picked up"
    g.select(0); g.clip("cut"); g.paste(0); g.step(.8); d = g.dbg()
    if abs(z(d) + 12.5) > .3: return False, f"first cut did not move, z {z(d)}"
    g.select(0); g.clip("cut"); g.paste(1); g.step(.8); d = g.dbg()
    if d["crew"][0]["pos"][1] < 3: return False, f"second cut did not reach the high block, pos {d['crew'][0]['pos']}"
    g.hold("KeyW", 2, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"pos {d['crew'][0]['pos']}"

def lvcut_jump(g):
    g.hold("KeyW", .3); g.pg.keyboard.down("KeyW"); g.pg.keyboard.down("Space"); g.step(.4); g.pg.keyboard.up("Space"); g.step(2.6); g.pg.keyboard.up("KeyW"); g.step(.5); d = g.dbg()
    return not d["done"] and d["crew"][0]["pos"][1] < -1, f"jumping for the island: done {d['done']}, pos {d['crew'][0]['pos']} (expected falling short)"

def lvboth(g):
    g.select(0); g.clip("copy"); g.paste(0); d = g.dbg()
    if len(d["crew"]) != 2: return False, "first copy failed"
    g.select(1); g.clip("cut"); g.paste(1); g.step(.6); d = g.dbg()
    if d["crew"][1]["pos"][0] < 8: return False, f"cut to P failed {d['crew'][1]['pos']}"
    g.select(0); g.clip("copy"); g.paste(0); d = g.dbg()
    if len(d["crew"]) != 3: return False, f"second copy failed, crew {len(d['crew'])}"
    g.hold("KeyW", 4, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"plates {d['plates']}, gates {d['gates']}, crew {[c['pos'] for c in d['crew']]}"

def lvboth_two_bodies(g):
    g.select(0); g.clip("copy"); g.paste(0); g.hold("KeyW", 4); d = g.dbg()
    return not d["gates"][0], f"with two of you: gate open={d['gates'][0]} (expected False), plates {d['plates']}"

def lvhead(g):
    g.head("Digit2", 0, 0, -6.5); d = g.dbg()
    if z(d) > -4: return False, f"throw over the wall failed, z {z(d)}"
    g.hold("KeyW", 1.5, until=lambda d: z(d) < -10.6); d = g.dbg()
    if z(d) < -11.7: return False, f"walked through the bar, z {z(d)}"
    g.head("Digit1", 0, 0, -17); d = g.dbg()
    if z(d) > -12.5: return False, f"roll under the bar failed, z {z(d)}"
    g.hold("KeyW", 3, until=lambda d: z(d) < -26.6); g.head("Digit2", 0, 2.8, -30); d = g.dbg()
    if d["crew"][0]["pos"][1] < 2.7: return False, f"throw up to the last block failed, pos {d['crew'][0]['pos']}"
    g.hold("KeyW", 1.5, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"pos {d['crew'][0]['pos']}"

def lvhead_no_throw_past_bar(g):
    g.head("Digit2", 0, 0, -6.5); g.hold("KeyW", 1.5, until=lambda d: z(d) < -10.6); before = z(g.dbg())
    g.head("Digit2", 0, 0, -16); d = g.dbg()
    return z(d) > -12, f"throwing past the barrier from z {before}: now z {z(d)} (expected still in front of it, > -12)"

def lvhead_beads_stop_at_wall(g):
    g.hold("KeyW", 1.2); g.pg.keyboard.down("Digit2"); g.step(.05); a = g.proj(0, 0, -6.5); g.pg.mouse.move(a[0] - 20, a[1] - 20); g.step(.05); g.pg.mouse.move(*a, steps=4); g.step(.2)
    d = g.dbg(); g.pg.keyboard.press("Escape"); g.pg.keyboard.up("Digit2")
    if not d["aim"]: return False, "no aim guide"
    inside = [q for q in d["aim"]["path"] if abs(q[0]) < 3 and -2.9 < q[2] < -2.5 and q[1] < 3.2]
    far = min(q[2] for q in d["aim"]["path"])
    return not d["aim"]["ok"] and not inside and far > -3.2, f"close to the wall at z {z(d)}: aim ok={d['aim']['ok']} (expected False), beads inside the wall {len(inside)}, furthest bead z {far} (expected to stop before -2.9)"

def lvhead_beads_clear_from_back(g):
    g.pg.keyboard.down("Digit2"); g.step(.05); a = g.proj(0, 0, -6.5); g.pg.mouse.move(a[0] - 20, a[1] - 20); g.step(.05); g.pg.mouse.move(*a, steps=4); g.step(.2)
    d = g.dbg(); g.pg.keyboard.up("Digit2"); far = min(q[2] for q in d["aim"]["path"])
    return d["aim"]["ok"] and far < -5, f"from the start: aim ok={d['aim']['ok']} (expected True), furthest bead z {far}"

def lvboth_jump(g):
    g.pg.keyboard.down("KeyD"); g.step(.25); g.pg.keyboard.down("Space"); g.step(.5); g.pg.keyboard.up("Space"); g.step(1.2); g.pg.keyboard.up("KeyD"); d = g.dbg()
    return d["crew"][0]["pos"][1] < -1, f"running jump toward the cut island: pos {d['crew'][0]['pos']} (expected to fall short)"

def chain_climb(g):
    g.pg.evaluate("""(() => { const A = __aero, L = A.boxes[12], M = A.mouth; A.collectAll(); A.pos.set(M.x + .2, L.top + .01, M.z + 3.2); A.vel.set(0, 0, 0); })()""")
    g.step(.5); g.pg.keyboard.down("Digit1"); g.step(.1)
    a = g.client(g.pg.evaluate("(() => { const A = __aero, L = A.boxes[12], M = A.mouth, S = __aeroActive(), v = new THREE.Vector3(M.x, L.top + .4, M.z - .4).project(S.cam), f = document.getElementById('frame'); return { x: (v.x * .5 + .5) * f.clientWidth, y: (-v.y * .5 + .5) * f.clientHeight }; })()"))
    g.pg.mouse.move(a[0] - 30, a[1] - 30); g.step(.1); g.pg.mouse.move(*a, steps=5); g.step(.2); g.pg.keyboard.up("Digit1")
    for _ in range(20): g.step(.5)
    name = g.scene_after("Copy crystal")
    return name == "Copy crystal", f"after the pipe the scene is {name!r} (expected 'Copy crystal')"

def chain_end(g):
    ok, note = lvhead(g)
    if not ok: return False, note
    name = g.scene_after("Relay")
    return name == "Relay", f"after Heads up the scene is {name!r} (expected 'Relay')"

def shot(g, name):
    d = os.environ.get("SHOTS")
    if d: g.step(.05); g.pg.screenshot(path=os.path.join(d, name + ".png"), clip={"x": g.pg.evaluate("document.getElementById('frame').getBoundingClientRect().left"), "y": g.pg.evaluate("document.getElementById('frame').getBoundingClientRect().top"), "width": 1088, "height": 796})

def shots(g):
    lv = g.pg.evaluate("document.getElementById('sceneName').textContent")
    g.step(1.0); shot(g, lv + "-1-start")
    if lv == "Copy crystal": g.hold("KeyW", .3); g.select(0); g.clip("copy"); p = g.client(g.dbg()["pads"][0]["screen"]); g.pg.mouse.move(*p, steps=3); g.step(.3); shot(g, lv + "-2-pasting"); g.pg.mouse.click(*p); g.step(.6); g.hold("KeyW", .9); shot(g, lv + "-3-bridge")
    if lv == "In sync": g.select(0); g.clip("copy"); g.paste(0); g.step(.6); shot(g, lv + "-2-two")
    if lv == "Cut": g.hold("KeyW", .3); g.select(0); g.clip("cut"); p = g.client(g.dbg()["pads"][0]["screen"]); g.pg.mouse.move(*p, steps=3); g.step(.3); shot(g, lv + "-2-cutting")
    if lv == "Copy and cut": g.select(0); g.clip("copy"); g.paste(0); g.select(1); g.clip("cut"); g.paste(1); g.select(0); g.clip("copy"); g.paste(0); g.step(.6); shot(g, lv + "-2-three"); g.hold("KeyW", 1.0); shot(g, lv + "-3-open")
    if lv == "Heads up":
        g.hold("KeyW", .45); g.pg.keyboard.down("Digit2"); g.step(.05); a = g.proj(0, 0, -6.5); g.pg.mouse.move(a[0] - 20, a[1] - 20); g.step(.05); g.pg.mouse.move(*a, steps=4); g.step(.3); shot(g, lv + "-1b-blocked")
        g.pg.keyboard.press("Escape"); g.pg.keyboard.up("Digit2"); g.hold("KeyS", .45); g.step(.3)
    if lv == "Heads up": g.pg.keyboard.down("Digit2"); g.step(.05); a = g.proj(0, 0, -6.5); g.pg.mouse.move(*a, steps=4); g.step(.3); shot(g, lv + "-2-aim"); g.pg.keyboard.up("Digit2"); g.step(2); g.hold("KeyW", 1.5, until=lambda d: z(d) < -10.6); g.step(.3); shot(g, lv + "-3-barrier")
    return True, "shots"

def x(d, i=0): return d["crew"][i]["pos"][0]
def y(d, i=0): return d["crew"][i]["pos"][1]
def jump_when(g, test, until, secs=8):
    jumped = False
    for _ in range(int(secs / .05)):
        g.step(.05); d = g.dbg()
        if not jumped and test(d): g.pg.keyboard.down("Space"); g.step(.3); g.pg.keyboard.up("Space"); jumped = True
        if until(d): break
    return g.dbg()
def delete(g, i): g.select(i); g.pg.keyboard.press("Delete"); g.step(.6)

def relay(g):
    g.select(0); g.clip("copy"); g.paste(0); g.hold("KeyD", 5, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"crew {[c['pos'] for c in d['crew']]}"
def relay_alone(g):
    g.hold("KeyD", 4); d = g.dbg()
    return not d["done"], f"walking across alone: done={d['done']} (expected False)"

def chain(g):
    g.select(0); g.clip("cut"); g.paste(0); g.step(.8); d = g.dbg()
    if abs(z(d) + 12) > .3: return False, f"first ring missed, at {d['crew'][0]['pos']}"
    g.select(0); g.clip("cut"); g.paste(1); g.step(.8); d = g.dbg()
    if abs(x(d) - 8) > .3: return False, f"second ring missed, at {d['crew'][0]['pos']}"
    g.hold("KeyW", 4, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"pos {d['crew'][0]['pos']}, gates {d['gates']}"
def chain_jump(g):
    g.pg.keyboard.down("KeyW"); g.pg.keyboard.down("Space"); g.step(.4); g.pg.keyboard.up("Space"); g.step(2.6); g.pg.keyboard.up("KeyW"); g.step(.4); d = g.dbg()
    return not d["done"] and z(d) > -3, f"jumping for the first island: pos {d['crew'][0]['pos']} (expected to fall and respawn on the start island)"

def hops(g):
    g.head("Digit2", 0, 0, -6.5); d = g.dbg()
    if z(d) > -4.5: return False, f"wall throw failed, z {z(d)}"
    g.head("Digit2", 0, 0, -15); d = g.dbg()
    if z(d) > -13: return False, f"gap throw failed, z {z(d)}"
    g.hold("KeyW", 3, until=lambda d: z(d) < -19.6); g.head("Digit1", 0, 0, -24); d = g.dbg()
    if z(d) > -22: return False, f"first roll failed, z {z(d)}"
    g.hold("KeyW", 3, until=lambda d: z(d) < -25.6); g.head("Digit1", 0, 0, -30); d = g.dbg()
    if z(d) > -28: return False, f"second roll failed, z {z(d)}"
    g.hold("KeyW", 3, until=lambda d: z(d) < -31.2); g.head("Digit2", 0, 2.4, -36); d = g.dbg()
    if y(d) < 2.3: return False, f"last throw failed, pos {d['crew'][0]['pos']}"
    g.hold("KeyW", 2, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"pos {d['crew'][0]['pos']}"
def hops_skip(g):
    g.head("Digit2", 0, 0, -6.5); g.head("Digit2", 0, 0, -15); g.hold("KeyW", 3, until=lambda d: z(d) < -19.6); g.head("Digit2", 0, 0, -24); d = g.dbg()
    return z(d) > -21, f"throwing past the first barrier: z {z(d)} (expected still in front of it)"

def aim(g):
    g.hold("KeyW", 1.2); g.head("Digit1", 0, 0, -12.6); g.step(1.2); d = g.dbg()
    if not d["gates"][0]: return False, f"roll did not stop on the plate: pos {d['crew'][0]['pos']}"
    g.hold("KeyW", 5, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"pos {d['crew'][0]['pos']}"
def aim_overshoot(g):
    g.hold("KeyW", 1.2); g.pg.keyboard.down("Digit1"); g.step(.1); g.pg.keyboard.up("Digit1"); g.step(4); d = g.dbg()
    return not d["gates"][0] and z(d) > -1, f"full-speed roll: gate {d['gates'][0]}, pos {d['crew'][0]['pos']} (expected off the edge and back at the start)"

def cutcopy(g):
    g.select(0); g.clip("copy"); g.paste(0); g.select(1); g.clip("cut"); g.paste(1); g.step(.6); d = g.dbg()
    if not d["gates"][0]: return False, f"copy not on the plate: {[c['pos'] for c in d['crew']]}"
    g.hold("KeyW", 4, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"crew {[c['pos'] for c in d['crew']]}"
def cutcopy_self(g):
    g.select(0); g.clip("cut"); g.paste(1); g.step(.6); g.hold("KeyW", 3); d = g.dbg()
    return not d["done"], f"cutting yourself to the plate: done={d['done']} (expected False)"

def lanes(g, jump=True):
    g.select(0); g.clip("copy"); g.paste(0); g.select(0); g.clip("copy"); g.paste(1); d = g.dbg()
    if len(d["crew"]) != 3: return False, f"crew {len(d['crew'])}"
    g.pg.keyboard.down("KeyW"); d = jump_when(g, (lambda d: z(d) < -1.7) if jump else (lambda d: False), lambda d: d["done"], 8); g.pg.keyboard.up("KeyW")
    return (d["done"], f"plates {d['plates']}, crew {[c['pos'] for c in d['crew']]}") if jump else (not d["gates"][0], f"without the jump: gate {d['gates'][0]} (expected False)")
def lanes_nojump(g): return lanes(g, False)

def lineup(g, align=True):
    g.select(0); g.clip("copy"); g.paste(0)
    if align:
        g.hold("KeyW", 2, until=lambda d: z(d) < -1.4); g.hold("KeyD", .3); d = g.dbg()
        if x(d, 1) < 3.95: return False, f"copy still behind the stub: {d['crew'][1]['pos']}"
    g.pg.keyboard.down("KeyW"); d = jump_when(g, (lambda d: z(d) < -5.6) if align else (lambda d: len(d["crew"]) > 1 and z(d, 1) < -5.6), lambda d: d["done"] or len(d["crew"]) < 2, 6)
    d = jump_when(g, lambda d: False, lambda d: d["done"] or d["gates"][0], 4); g.pg.keyboard.up("KeyW")
    if align:
        g.pg.keyboard.down("KeyA")
        for _ in range(30):
            g.step(.1); d = g.dbg()
            if os.environ.get("TRACE"): print([c["pos"] for c in d["crew"]], d["gates"], d["done"])
            if d["done"]: break
        g.pg.keyboard.up("KeyA"); d = g.dbg()
    return (d["done"], f"gates {d['gates']}, crew {[c['pos'] for c in d['crew']]}") if align else (not d["gates"][0], f"without lining up: gate {d['gates'][0]}, crew {len(d['crew'])} (expected gate closed)")
def lineup_skip(g): return lineup(g, False)

def leap(g):
    g.select(0); g.clip("copy"); g.paste(0); g.hold("KeyW", 3, until=lambda d: z(d) < -10.2); d = g.dbg()
    if z(d) > -9: return False, f"did not cross the first bridge: {d['crew'][0]['pos']}"
    g.hold("KeyA", .25); g.select(1); g.clip("cut"); g.paste(1); g.step(.6); d = g.dbg()
    if not d["gates"][1]: return False, f"second bridge closed: {[c['pos'] for c in d['crew']]}"
    g.hold("KeyW", 4, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"crew {[c['pos'] for c in d['crew']]}"
def leap_alone(g):
    g.hold("KeyW", 3); d = g.dbg()
    return not d["done"] and z(d) > -8, f"walking alone: pos {d['crew'][0]['pos']} (expected to fall and respawn)"

def back_to_one(g, delete_copy=True):
    g.head("Digit2", 0, 0, -6.5); d = g.dbg()
    if z(d) > -4: return False, f"wall throw failed {d['crew'][0]['pos']}"
    g.select(0); g.clip("copy"); g.paste(0); g.hold("KeyW", 5, until=lambda d: z(d) < -24.8); d = g.dbg()
    if z(d) > -24: return False, f"did not cross the long bridge: {d['crew'][0]['pos']}"
    if delete_copy:
        delete(g, 1); d = g.dbg()
        if len(d["crew"]) != 1: return False, f"copy not deleted, crew {len(d['crew'])}"
    g.head("Digit2", 0, 1.5, -32); d = g.dbg()
    if not delete_copy: return y(d) < 1, f"throwing with a copy still around: pos {d['crew'][0]['pos']} (expected no throw)"
    if y(d) < 1.4: return False, f"last throw failed {d['crew'][0]['pos']}"
    g.hold("KeyW", 2, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"pos {d['crew'][0]['pos']}"
def back_to_one_two(g): return back_to_one(g, False)

def final(g):
    g.select(0); g.clip("copy"); g.paste(0); g.select(1); g.clip("cut"); g.paste(1); g.step(.4); g.select(0); g.clip("copy"); g.paste(0); d = g.dbg()
    if len(d["crew"]) != 3: return False, f"crew {len(d['crew'])}"
    g.hold("KeyW", 5, until=lambda d: z(d) < -15.6); d = g.dbg()
    if z(d) > -15: return False, f"bridge not crossed: {d['crew'][0]['pos']}, gates {d['gates']}"
    delete(g, 1); delete(g, 1); d = g.dbg()
    if len(d["crew"]) != 1: return False, f"copies not deleted: crew {len(d['crew'])}"
    g.head("Digit2", 0, 0, -23); d = g.dbg()
    if z(d) > -21: return False, f"wall throw failed {d['crew'][0]['pos']}"
    g.hold("KeyW", 2, until=lambda d: z(d) < -25.6); g.head("Digit1", 0, 0, -31); d = g.dbg()
    if z(d) > -28: return False, f"roll failed {d['crew'][0]['pos']}"
    g.hold("KeyW", 2, until=lambda d: d["done"]); d = g.dbg()
    return d["done"], f"pos {d['crew'][0]['pos']}"

def chain_final(g):
    ok, note = final(g)
    if not ok: return False, note
    try: g.pg.wait_for_function("document.getElementById('end').classList.contains('on')", timeout=8000); shown = True
    except Exception: shown = False
    return shown, f"after All together the end screen is {'shown' if shown else 'not shown'}"

def lvhead_walls(g):
    g.hold("KeyW", 2); d = g.dbg(); a = z(d)
    g.pg.keyboard.down("KeyW"); g.pg.keyboard.down("Space"); g.step(.6); g.pg.keyboard.up("Space"); g.step(.6); g.pg.keyboard.up("KeyW"); d = g.dbg(); b = z(d)
    g.head("Digit1", 0, 0, -7); d = g.dbg(); c = z(d)
    return a > -2.9 and b > -2.9 and c > -2.9, f"walk z {a}, jump z {b}, roll z {c} (all expected to stop at the wall, > -2.9)"

TESTS = [("title", "every_scene"), ("lvcopy", "lvcopy"), ("lvcopy", "lvcopy_without_copy"), ("lvsync", "lvsync"), ("lvsync", "lvsync_one_body"), ("lvcut", "lvcut"), ("lvcut", "lvcut_jump"),
         ("lvboth", "lvboth"), ("lvboth", "lvboth_two_bodies"), ("lvhead", "lvhead"), ("lvhead", "lvhead_walls"), ("lvhead", "lvhead_no_throw_past_bar"), ("lvboth", "lvboth_jump"), ("lvhead", "lvhead_beads_stop_at_wall"), ("lvhead", "lvhead_beads_clear_from_back"), ("climb", "chain_climb"), ("lvhead", "chain_end"), ("lvrelay", "relay"), ("lvrelay", "relay_alone"), ("lvchain", "chain"), ("lvchain", "chain_jump"), ("lvhops", "hops"), ("lvhops", "hops_skip"), ("lvaim", "aim"), ("lvaim", "aim_overshoot"), ("lvcutcopy", "cutcopy"), ("lvcutcopy", "cutcopy_self"), ("lvlanes", "lanes"), ("lvlanes", "lanes_nojump"), ("lvlineup", "lineup"), ("lvlineup", "lineup_skip"), ("lvleap", "leap"), ("lvleap", "leap_alone"), ("lvdelete", "back_to_one"), ("lvdelete", "back_to_one_two"), ("lvfinal", "final"), ("lvfinal", "chain_final"), ("lvcopy", "shots"), ("lvsync", "shots"), ("lvcut", "shots"), ("lvboth", "shots"), ("lvhead", "shots"), ("lvrelay", "shots"), ("lvchain", "shots"), ("lvhops", "shots"), ("lvaim", "shots"), ("lvcutcopy", "shots"), ("lvlanes", "shots"), ("lvlineup", "shots"), ("lvleap", "shots"), ("lvdelete", "shots"), ("lvfinal", "shots")]
only = sys.argv[1:]
try:
  with sync_playwright() as pw:
    browser = pw.chromium.launch(channel="chrome", headless=True, args=["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"])
    for name, fn in [(n, globals()[f]) for n, f in TESTS if not only or f in only]:
        run(browser, name, lambda g, fn=fn: fn(g))
    browser.close()
finally:
  srv.terminate()
print(json.dumps({"passed": sum(1 for r in results if r[1]), "of": len(results)}))
