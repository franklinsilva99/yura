"""Genera fotos ilustradas de suculentas para los datos demo (webp)."""
import math, random, sys
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1]
S = 900

def leaf(d, cx, cy, ang, length, width, fill, outline):
    pts = []
    for i in range(41):
        t = i / 40
        r = math.sin(math.pi * t) * width * (1 - 0.35 * t)
        pts.append((t * length, r))
    pts += [(x, -y) for x, y in reversed(pts)]
    ca, sa = math.cos(ang), math.sin(ang)
    d.polygon([(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in pts], fill=fill, outline=outline, width=3)

def plant(name, scale, palette, bg, seed, rings=4):
    random.seed(seed)
    img = Image.new('RGB', (S, S), bg)
    d = ImageDraw.Draw(img)
    # luz suave
    glow = Image.new('L', (S, S), 0)
    ImageDraw.Draw(glow).ellipse((S*0.1, S*0.05, S*0.9, S*0.75), fill=70)
    img = Image.composite(Image.new('RGB', (S, S), (255, 250, 240)), img, glow.filter(ImageFilter.GaussianBlur(120)))
    d = ImageDraw.Draw(img)
    cx, cy = S / 2, S * 0.47
    # maceta
    d.polygon([(cx - 230, cy + 150), (cx + 230, cy + 150), (cx + 180, S - 60), (cx - 180, S - 60)], fill=(191, 160, 130))
    d.rectangle((cx - 250, cy + 120, cx + 250, cy + 175), fill=(176, 145, 115))
    d.ellipse((cx - 235, cy + 105, cx + 235, cy + 150), fill=(110, 85, 65))
    for r in range(rings, 0, -1):
        n = 7 + r * 2
        length = (70 + r * 55) * scale
        width = (26 + r * 7) * scale
        col = palette[min(r - 1, len(palette) - 1)]
        off = random.random() * math.pi
        for i in range(n):
            a = off + i * 2 * math.pi / n
            leaf(d, cx, cy, a, length, width, col, (47, 74, 61))
    d.ellipse((cx - 12 * scale, cy - 12 * scale, cx + 12 * scale, cy + 12 * scale), fill=(47, 74, 61))
    img.save(f"{OUT}/{name}.webp", 'WEBP', quality=82)

green = [(94, 125, 105), (126, 154, 134), (150, 178, 158), (168, 188, 173)]
blue = [(90, 120, 125), (120, 150, 150), (150, 178, 176), (175, 198, 195)]
aloe = [(80, 120, 85), (105, 145, 105), (130, 165, 125)]
plant('pepita-1', 0.55, green, (232, 224, 212), 1, 3)
plant('pepita-2', 0.75, green, (228, 222, 210), 2, 3)
plant('pepita-3', 0.95, green, (236, 228, 214), 3, 4)
plant('donaloe', 0.9, aloe, (220, 229, 221), 4, 3)
plant('lunita', 0.8, blue, (238, 232, 222), 5, 4)
