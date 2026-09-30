import os, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
ROOT = sys.argv[1]
class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_PUT(self):
        parts = [p for p in self.path.split('/') if p and '..' not in p]
        if len(parts) != 2: self.send_response(400); self._cors(); self.end_headers(); return
        d = os.path.join(ROOT, parts[0]); os.makedirs(d, exist_ok=True)
        n = int(self.headers.get('Content-Length', 0))
        with open(os.path.join(d, parts[1]), 'wb') as f: f.write(self.rfile.read(n))
        self.send_response(200); self._cors(); self.end_headers(); self.wfile.write(b'ok')
    def log_message(self, *a): pass
ThreadingHTTPServer(('127.0.0.1', 8792), H).serve_forever()
