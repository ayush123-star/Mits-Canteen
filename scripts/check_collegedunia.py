import urllib.request
import json
import re
import ssl

ctx = ssl._create_unverified_context()
req = urllib.request.Request(
    'https://collegedunia.com/college/13947-madhav-institute-of-technology-and-science-mits-gwalior/photos',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
try:
    with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
        html = r.read().decode('utf-8', errors='ignore')
        m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
        if m:
            data = json.loads(m.group(1))
            photos_str = json.dumps(data)
            imgs = re.findall(r'https://images\.collegedunia\.com/[^\s\"\'>\\]+', photos_str)
            print(f"Found images: {len(imgs)}")
            for img in set(imgs):
                print(img)
        else:
            print("No next data")
except Exception as e:
    print(f"Error: {e}")
