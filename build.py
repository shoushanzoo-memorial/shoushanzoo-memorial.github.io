"""把 src/ 組成 index.html：python3 build.py"""
from pathlib import Path
root = Path(__file__).parent
t = (root/'src/template.html').read_text(encoding='utf-8')
scene = (root/'src/scene.js').read_text(encoding='utf-8')
scene = scene[:scene.index('/* ---------- 卡片貼圖')] if '/* ---------- 卡片貼圖' in scene else scene
t = t.replace('%%DATA%%', (root/'src/data.js').read_text(encoding='utf-8')).replace('%%SCEN%%', scene)
(root/'index.html').write_text(t, encoding='utf-8')
print('已產生 index.html')
