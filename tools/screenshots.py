"""
Screenshot every screen at the brief's device sizes, as a touch device where relevant,
and report any browser console errors.

Usage (from the project root, after `npm run build`):
    python tools/screenshots.py                 # all routes
    python tools/screenshots.py chat dashboard  # only these routes

Output: .screenshots/<route>-<device>.png  (git-ignored)
"""

import socket
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / ".screenshots"
PORT = 4173

DEVICES = {
    # name: (width, height, is_touch)
    "iphone": (375, 812, True),
    "ipad-portrait": (768, 1024, True),
    "ipad-landscape": (1024, 768, True),
    "desktop": (1440, 900, False),
}

ROUTES = {
    "chat": "#/chat",
    "dashboard": "#/dashboard",
    "pipelines": "#/pipelines",
    "pipeline-detail": "#/pipelines/regional-sales",
}



def tall_shot(pg, path):
    """Full-page screenshot without the chart-resize artifact: grow the window to the
    page height, let charts re-measure, then take a normal screenshot."""
    size = pg.viewport_size
    h = pg.evaluate("document.documentElement.scrollHeight")
    pg.set_viewport_size({"width": size["width"], "height": h})
    pg.wait_for_timeout(500)
    pg.screenshot(path=path)
    pg.set_viewport_size(size)

def wait_for_port(port, timeout=20):
    start = time.time()
    while time.time() - start < timeout:
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", port)) == 0:
                return
        time.sleep(0.3)
    raise RuntimeError(f"Preview server did not start on port {port}")


def main():
    wanted = sys.argv[1:] or list(ROUTES)
    OUT.mkdir(exist_ok=True)

    server = subprocess.Popen(
        f"npx vite preview --host 127.0.0.1 --port {PORT} --strictPort",
        cwd=ROOT,
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    errors = []
    try:
        wait_for_port(PORT)
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for device, (w, h, touch) in DEVICES.items():
                context = browser.new_context(
                    reduced_motion="reduce",  # charts render instantly, so screenshots are never mid-animation
                    viewport={"width": w, "height": h},
                    device_scale_factor=2 if touch else 1,
                    has_touch=touch,
                    is_mobile=touch and w < 768,
                )
                page = context.new_page()
                page.on(
                    "console",
                    lambda msg, d=device: msg.type in ("error", "warning")
                    and errors.append(f"[{d}] {msg.type}: {msg.text}"),
                )
                page.on("pageerror", lambda e, d=device: errors.append(f"[{d}] pageerror: {e}"))
                for name in wanted:
                    page.goto(f"http://127.0.0.1:{PORT}/{ROUTES[name]}")
                    page.wait_for_load_state("networkidle")
                    page.wait_for_timeout(300)
                    path = OUT / f"{name}-{device}.png"
                    tall_shot(page, str(path))
                    print(f"saved {path.relative_to(ROOT)}")
                context.close()
            browser.close()
    finally:
        # shell=True on Windows: kill the whole process tree
        subprocess.run(f"taskkill /F /T /PID {server.pid}", shell=True, capture_output=True)

    print("\nconsole: clean" if not errors else "\nconsole problems:\n" + "\n".join(errors))


if __name__ == "__main__":
    main()
