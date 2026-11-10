import os, re, sys
from urllib.parse import urlsplit

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, "index.html"), encoding="utf-8").read()

refs = re.findall(r'(?:src|href)="([^"]+)"', html)
missing = []
for r in refs:
    if r.startswith(("http", "data:", "#")):
        continue
    clean = urlsplit(r).path
    p = os.path.join(root, clean.lstrip("./"))
    if not os.path.exists(p):
        missing.append(r)
print("asset refs:", len(refs), "missing:", missing)

# 标签配对粗查
for tag in ["div", "button", "span", "p", "img", "script", "style", "body", "html"]:
    opens = len(re.findall(r"<" + tag + r"\b", html))
    closes = len(re.findall(r"</" + tag + ">", html))
    if tag in ("img",):
        continue
    if opens != closes:
        print(f"TAG MISMATCH {tag}: open={opens} close={closes}")

# app.js 引用的 DOM id 是否都存在于 index.html
app = open(os.path.join(root, "js", "app.js"), encoding="utf-8").read()
ids = set(re.findall(r'getElementById\("([^"]+)"\)', app))
missing_ids = sorted(i for i in ids if f'id="{i}"' not in html)
print("app.js dom ids:", len(ids), "missing:", missing_ids)

# index 内联脚本引用的 id
inline = "\n".join(re.findall(r"<script>(.*?)</script>", html, re.S))
inl_ids = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", inline))
print("inline script missing ids:", sorted(i for i in inl_ids if f'id="{i}"' not in html))
