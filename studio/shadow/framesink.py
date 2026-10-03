import base64, http.server, mimetypes, os, subprocess, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(ROOT))
GAME = os.path.join(REPO, "public", "games", "aero")
SITE = os.path.join(REPO, "public")


def safe(base, rel):
    p = os.path.normpath(os.path.join(base, rel.lstrip("/")))
    if not p.startswith(base): raise ValueError(rel)
    return p


def at_rev(rev, path="public/games/aero/index.html"):
    if rev in ("", "now", "HEAD-work"): return open(os.path.join(REPO, path), "rb").read()
    return subprocess.run(["git", "-C", REPO, "show", f"{rev}:{path}"], capture_output=True, check=True).stdout


class H(http.server.BaseHTTPRequestHandler):
    def cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self): self.send_response(204); self.cors(); self.end_headers()

    def write(self, rel, data):
        p = safe(ROOT, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "wb").write(data)

    def do_POST(self):
        rel = self.path.split("?")[0]
        data = self.rfile.read(int(self.headers["Content-Length"]))
        if rel == "/batch":
            for line in data.decode().split("\n"):
                if line: name, b64 = line.split(" ", 1); self.write(name, base64.b64decode(b64))
        else: self.write(rel, data)
        self.send_response(200); self.cors(); self.end_headers(); self.wfile.write(b"ok")

    def send(self, body, ctype):
        self.send_response(200); self.cors()
        self.send_header("Content-Type", ctype); self.send_header("Cache-Control", "no-store"); self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        rel = self.path.split("?")[0]
        try:
            parts = rel.strip("/").split("/")
            if parts[0] == "src":
                return self.send(at_rev(parts[1] if len(parts) > 1 else "now"), "text/plain; charset=utf-8")
            if parts[0] == "old" and len(parts) > 2:
                rev, rest = parts[1], "/".join(parts[2:])
                if rest in ("games/aero/", "games/aero/index.html"): return self.send(at_rev(rev), "text/html; charset=utf-8")
                p = safe(SITE, rest)
            elif parts[0] == "games": p = safe(SITE, rel)
            elif parts[0] == "studio": p = safe(os.path.dirname(ROOT), "/".join(parts[1:]))
            else: p = safe(ROOT, rel)
            if os.path.isdir(p): p = os.path.join(p, "index.html")
        except (ValueError, subprocess.CalledProcessError):
            p = None
        if not p or not os.path.isfile(p): self.send_response(404); self.cors(); self.end_headers(); return
        self.send(open(p, "rb").read(), mimetypes.guess_type(p)[0] or "application/octet-stream")

    def log_message(self, *a): pass


http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8781), H).serve_forever()
