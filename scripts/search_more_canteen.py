import urllib.request
import re
import ssl

ctx = ssl._create_unverified_context()
queries = [
    'MITS+Gwalior+canteen+inside',
    'MITS+Gwalior+cafeteria',
    'Madhav+Institute+of+Technology+Science+canteen',
    'MITS+canteen+Gwalior'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

all_murls = set()
for q in queries:
    url = f'https://www.bing.com/images/search?q={q}&form=HDRSC2&first=1'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            html = r.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            for m in murls:
                all_murls.add(m)
    except Exception as e:
        pass

print(f"Total unique images found across queries: {len(all_murls)}")
for m in list(all_murls)[:25]:
    print(m)
