import urllib.request
import re
import json

url = 'https://www.youtube.com/watch?v=m-9cHrE-aF0'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

with urllib.request.urlopen(req, timeout=10) as r:
    html = r.read().decode('utf-8', errors='ignore')
    m = re.search(r'var ytInitialPlayerResponse\s*=\s*({.*?});', html)
    if m:
        data = json.loads(m.group(1))
        adaptive = data.get('streamingData', {}).get('adaptiveFormats', [])
        for f in adaptive:
            if 'video/mp4' in f.get('mimeType', ''):
                print(f.get('qualityLabel'), 'url present:', 'url' in f, 'cipher present:', 'signatureCipher' in f or 'cipher' in f)
                if 'url' in f:
                    print('DIRECT URL:', f['url'])
                    break
