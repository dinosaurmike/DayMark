# Composites the recorded app frames (frames/f###.png, 390x844 phone screenshots at 2x) into the phone screen
# of banner.png (a 960x560 screenshot of banner.html) and writes composite/c###.png, ready for ffmpeg (see record.js).
import glob, os, sys
from PIL import Image, ImageDraw
bg = Image.open(sys.argv[1] if len(sys.argv) > 1 else 'banner.png').convert('RGB')
src = sys.argv[2] if len(sys.argv) > 2 else 'frames'
out = sys.argv[3] if len(sys.argv) > 3 else 'composite'
X, Y, W, H, R = 676, 30, 232, 502, 26
mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, H - 1], R, fill=255)
os.makedirs(out, exist_ok=True)
for i, f in enumerate(sorted(glob.glob(os.path.join(src, 'f*.png')))):
    fr = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
    c = bg.copy(); c.paste(fr, (X, Y), mask); c.save(os.path.join(out, 'c%03d.png' % i))
print('ok', i + 1)
