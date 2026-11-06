import urllib.request
import ssl
import os

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

urls = [
    ('https://www.mitsgwalior.in/gallery/298.JPG', 'mits_gallery_298.jpg'),
    ('https://image-static.collegedunia.com/public/reviewPhotos/1146073/IMG-20231009-WA0037.jpg', 'review_canteen_1.jpg'),
    ('https://image-static.collegedunia.com/public/reviewPhotos/1135051/1000260592.png', 'review_canteen_2.png'),
    ('https://universitykart.b-cdn.net/Content/upload/admin/xabjavux.nr5.jpeg', 'univkart.jpg'),
    ('https://image-static.collegedunia.com/public/college_data/images/campusimage/1767000109Campus%207.jpeg', 'campus7.jpg')
]

for u, name in urls:
    dest = os.path.join('scratch_images', name)
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            with open(dest, 'wb') as f:
                f.write(r.read())
        print(f"Saved {name}: {os.path.getsize(dest)} bytes")
    except Exception as e:
        print(f"Failed {name}: {e}")
