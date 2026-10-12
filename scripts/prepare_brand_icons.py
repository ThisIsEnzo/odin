"""Derive transparent app icons from official relief artwork (requires Pillow).

No redraw, background, tint or geometry changes. Premultiplied-alpha resampling
prevents hidden RGB in transparent source pixels from producing colored halos.
"""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / "public/images/brand/on-ground-horse-relief.webp").convert("RGBA")
source = source.crop(source.getchannel("A").getbbox())


def icon(size):
    margin = max(1, round(size * 0.04))
    available = size - margin * 2
    scale = available / max(source.size)
    dimensions = tuple(max(1, round(value * scale)) for value in source.size)
    mark = source.convert("RGBa").resize(dimensions, Image.Resampling.LANCZOS).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    position = ((size - mark.width) // 2, (size - mark.height) // 2)
    # Carry the brand's restrained earth shadow into browser chrome. It follows
    # the official alpha silhouette and improves cream legibility on light tabs.
    shadow = Image.new("RGBA", mark.size, (56, 38, 31, 0))
    shadow.putalpha(mark.getchannel("A").filter(ImageFilter.GaussianBlur(max(0.25, size * 0.004)))
                    .point(lambda alpha: round(alpha * 0.28)))
    canvas.alpha_composite(shadow, (position[0], position[1] + max(1, round(size * 0.007))))
    canvas.alpha_composite(mark, position)
    return canvas


out = ROOT / "public/images/brand/icons"
out.mkdir(parents=True, exist_ok=True)
for size in (16, 32, 48, 192, 512):
    icon(size).save(out / f"horse-{size}.png")
icon(32).save(ROOT / "src/app/icon.png")
icon(180).save(ROOT / "src/app/apple-icon.png")
icon(48).save(ROOT / "src/app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)],
              append_images=[icon(16), icon(32)])
