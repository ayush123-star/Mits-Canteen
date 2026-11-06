import urllib.request
import re
import ssl

ctx = ssl._create_unverified_context()
req = urllib.request.Request(
    'https://collegedunia.com/college/13506-madhav-institute-of-technology-and-science-mits-gwalior/gallery',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
        html = r.read().decode('utf-8', errors='ignore')
        matches = list(set(re.findall(r'https://images\.collegedunia\.com/[^\s\"\'>]+\.(?:jpg|jpeg|png|webp)', html)))
        print(f"Found {len(matches)} images")
        for m in matches:
            if 'canteen' in m.lower() or 'cafeteria' in m.lower() or 'food' in m.lower() or 'mess' in m.lower():
                print("MATCH:", m)
            else:
                print("OTHER:", m)
except Exception as e:
    print("Error:", e)
