"""Compression WOFF2 sans retrait de caractères ni changement de dessin.
Outil de préparation uniquement : fonttools[woff]==4.66.1.
Les TTF sources et les licences restent conservés.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[1] / "src/app/fonts"
for name in ("DMSans", "DMSerifDisplay", "UbuntuSans"):
    source = root / f"{name}.ttf"
    target = root / f"{name}.woff2"
    font = TTFont(source, recalcTimestamp=False)
    original_characters = font.getBestCmap()
    original_glyphs = font.getGlyphOrder()
    # Le hero utilise uniquement Ubuntu Sans 600, largeur normale.
    if name == "UbuntuSans":
        font = instantiateVariableFont(font, {"wght": 600, "wdth": 100}, inplace=False)
    font.flavor = "woff2"
    font.save(target)
    compressed = TTFont(target)
    assert compressed.getBestCmap() == original_characters
    assert compressed.getGlyphOrder() == original_glyphs
    print(f"{name}: {source.stat().st_size} → {target.stat().st_size} octets")
