import urllib.request
import re
import ssl

ctx = ssl._create_unverified_context()
query = 'MITS+Gwalior+canteen'
url = f'https://www.bing.com/images/search?q={query}&form=HDRSC2&first=1'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
        html = r.read().decode('utf-8', errors='ignore')
        # Bing image URLs are in murl="http..."
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        print(f"Found {len(murls)} image URLs from Bing search:")
        for u in murls[:10]:
            print(u)
except Exception as e:
    print("Error:", e)
