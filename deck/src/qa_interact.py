"""Smoke test for the HTML deck: navigation, links, TOC, lightbox, notes, no JS errors.
    python deck/src/qa_interact.py out/deck/Yujen_Lan_Interview_Deck.html [shots_dir]"""
import asyncio, os, sys, pathlib
from playwright.async_api import async_playwright
H = pathlib.Path(sys.argv[1]).resolve().as_uri()
O = (sys.argv[2] if len(sys.argv) > 2 else "out/deck/_build/qa") + "/"
os.makedirs(O, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1400,"height":800})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(H+"#1"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=O+"i-ctx-0.png")
        for k in range(4): await pg.keyboard.press("ArrowRight")
        await pg.wait_for_timeout(500); await pg.screenshot(path=O+"i-ctx-4.png")
        # TOC
        await pg.keyboard.press("t"); await pg.wait_for_timeout(200); await pg.screenshot(path=O+"i-toc.png"); await pg.keyboard.press("Escape")
        # cover chip link: Redfish cover is p.7 ; click 3rd chip
        await pg.evaluate("go(7)"); await pg.wait_for_timeout(200)
        n = await pg.evaluate("document.querySelectorAll('.slide.active .chip-link').length")
        await pg.click(".slide.active .chip-link >> nth=2"); await pg.wait_for_timeout(200)
        cur = await pg.evaluate("cur")
        # page link on projects slide
        await pg.evaluate("go(3)"); await pg.wait_for_timeout(200)
        links = await pg.evaluate("document.querySelectorAll('.slide.active a.go').length")
        await pg.click(".slide.active a.go >> nth=0"); await pg.wait_for_timeout(200)
        cur2 = await pg.evaluate("cur")
        # typed page number
        await pg.keyboard.type("34"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        cur3 = await pg.evaluate("cur")
        await pg.keyboard.press("ArrowRight"); await pg.keyboard.press("ArrowRight"); await pg.keyboard.press("ArrowRight")
        await pg.wait_for_timeout(500); await pg.screenshot(path=O+"i-tls-3.png")
        # lightbox
        await pg.evaluate("go(10)"); await pg.wait_for_timeout(200)
        await pg.click(".slide.active .pic.zoom >> nth=0"); await pg.wait_for_timeout(200); await pg.screenshot(path=O+"i-lightbox.png")
        await pg.keyboard.press("Escape")
        await pg.evaluate("go(17)"); await pg.keyboard.press("n"); await pg.wait_for_timeout(400); await pg.screenshot(path=O+"i-notes.png")
        print("chips", n, "chip->", cur, "| p-links", links, "link->", cur2, "| typed 34 ->", cur3, "| errors", errs)
        if errs or n == 0 or links == 0 or cur3 != 34:
            sys.exit(1)
        await b.close()
asyncio.run(main())
