"""
Capture the images used in README.md from the real production build.

Usage (from the project root, after `npm run build`):
    python tools/readme_media.py

Output: docs/media/*.png (committed, so the README shows them on GitHub)
Needs: playwright (with Chromium) and Pillow.
"""

import os
import socket
import subprocess
import time
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "media"
PORT = 4199
URL = f"http://127.0.0.1:{PORT}/#"


def start_server():
    server = subprocess.Popen(
        f"npx vite preview --host 127.0.0.1 --port {PORT} --strictPort",
        cwd=ROOT, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    for _ in range(80):
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", PORT)) == 0:
                return server
        time.sleep(0.25)
    raise RuntimeError("preview server did not start")


def context(browser, width, height, theme, scale=1, touch=False):
    ctx = browser.new_context(
        viewport={"width": width, "height": height},
        device_scale_factor=scale,
        has_touch=touch,
        is_mobile=touch and width < 768,
        reduced_motion="reduce",  # screenshots of settled screens, not mid-animation
    )
    ctx.add_init_script(
        f"try{{localStorage.setItem('astera-theme','{theme}');localStorage.setItem('astera-sidebar','open')}}catch(e){{}}"
    )
    return ctx


def tap(page, locator):
    """Click through JS so Playwright never scrolls the page to reach a sticky control."""
    locator.first.evaluate("e => e.click()")


def rounded(image, radius):
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([(0, 0), image.size], radius=radius, fill=255)
    out = Image.new("RGBA", image.size)
    out.paste(image, mask=mask)
    return out


def strip(paths, target, gap=40, pad=48):
    """Phone screenshots side by side with rounded corners, on a transparent background."""
    shots = [rounded(Image.open(p).convert("RGBA"), 56) for p in paths]
    w = sum(s.width for s in shots) + gap * (len(shots) - 1) + pad * 2
    h = max(s.height for s in shots) + pad * 2
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = pad
    for s in shots:
        canvas.alpha_composite(s, (x, pad))
        x += s.width + gap
    canvas = canvas.resize((w // 2, h // 2), Image.LANCZOS)
    canvas.save(target, optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = OUT / "_tmp"
    tmp.mkdir(exist_ok=True)
    server = start_server()
    try:
        with sync_playwright() as p:
            # Full Chromium: it renders backdrop-filter (the glass); headless shell doesn't.
            browser = p.chromium.launch(channel="chromium")

            # Desktop, light: the dashboard with the stale-data warning
            ctx = context(browser, 1440, 900, "light")
            page = ctx.new_page()
            page.goto(URL + "/dashboard")
            page.wait_for_timeout(1500)
            page.screenshot(path=OUT / "desktop-dashboard-light.png")
            ctx.close()

            # Desktop, dark: the failed pipeline with the plain-language fix
            ctx = context(browser, 1440, 900, "dark")
            page = ctx.new_page()
            page.goto(URL + "/pipelines/regional-sales?step=join")
            page.wait_for_timeout(1500)
            page.screenshot(path=OUT / "desktop-pipeline-dark.png")
            ctx.close()

            # iPad landscape: split view (step spine + inspector)
            ctx = context(browser, 1180, 820, "light", scale=1, touch=True)
            page = ctx.new_page()
            page.goto(URL + "/pipelines/regional-sales?step=join")
            page.wait_for_timeout(1500)
            page.screenshot(path=OUT / "ipad-pipeline.png")
            ctx.close()

            # iPhone: the trust story in four screens
            ctx = context(browser, 390, 844, "light", scale=2, touch=True)
            page = ctx.new_page()
            page.goto(URL + "/dashboard")
            page.wait_for_timeout(1500)
            page.screenshot(path=tmp / "1.png")
            page.goto(URL + "/pipelines/regional-sales?step=join")
            page.wait_for_timeout(1500)
            page.screenshot(path=tmp / "2.png")
            tap(page, page.get_by_role("button", name="Approve fix"))
            page.wait_for_timeout(400)
            tap(page, page.locator("[data-sonner-toast] button", has_text="Re-run now"))
            page.wait_for_timeout(300)
            page.evaluate("location.hash = '/pipelines/regional-sales'")
            page.wait_for_timeout(1900)
            page.screenshot(path=tmp / "3.png")
            page.wait_for_timeout(6000)
            page.evaluate("location.hash = '/dashboard'")
            page.wait_for_timeout(1500)
            page.screenshot(path=tmp / "4.png")
            ctx.close()
            strip([tmp / f"{i}.png" for i in range(1, 5)], OUT / "iphone-fix-story.png")

            browser.close()
    finally:
        if os.name == "nt":  # shell=True on Windows: kill the whole process tree
            subprocess.run(f"taskkill /F /T /PID {server.pid}", shell=True, capture_output=True)
        else:
            server.terminate()
        for f in tmp.glob("*.png"):
            f.unlink()
        tmp.rmdir()
    for f in sorted(OUT.glob("*.png")):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
