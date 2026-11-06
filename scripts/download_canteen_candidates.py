import urllib.request
import ssl
import os

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

downloads = [
    ('https://10619-2.s.cdn12.com/rests/small/w550/h367/110_511685050.jpg', 'canteen_rest_guru.jpg'),
    ('https://10619-2.s.cdn12.com/rests/original/110_511685050.jpg', 'canteen_rest_guru_orig.jpg'),
    ('https://i.ytimg.com/vi/m-9cHrE-aF0/maxresdefault.jpg', 'yt_canteen_1.jpg'),
    ('https://i.ytimg.com/vi/udsGHcCt8-Q/maxresdefault.jpg', 'yt_canteen_2.jpg'),
    ('https://image-static.collegedunia.com/public/college_data/images/campusimage/1767000109Campus%205.jpeg', 'collegedunia_campus5.jpg'),
    ('https://image-static.collegedunia.com/public/college_data/images/campusimage/1767000109Campus%206.jpeg', 'collegedunia_campus6.jpg')
]

for u, name in downloads:
    dest = os.path.join('scratch_images', name)
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            with open(dest, 'wb') as f:
                f.write(r.read())
        print(f"Saved {name}: {os.path.getsize(dest)} bytes")
    except Exception as e:
        print(f"Failed {name}: {e}")
