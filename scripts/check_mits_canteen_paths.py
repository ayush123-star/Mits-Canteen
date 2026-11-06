import urllib.request
import ssl

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

base_urls = [
    'https://web.mitsgwalior.in/images/canteen.jpg',
    'https://web.mitsgwalior.in/images/canteen.jpeg',
    'https://web.mitsgwalior.in/images/cafeteria.jpg',
    'https://web.mitsgwalior.in/images/cafeteria.jpeg',
    'https://web.mitsgwalior.in/images/slider2/canteen.jpg',
    'https://web.mitsgwalior.in/images/slider2/canteen.jpeg',
    'https://web.mitsgwalior.in/images/mainmenu/canteen.jpg',
    'https://web.mitsgwalior.in/images/facilities/canteen.jpg',
    'https://web.mitsgwalior.in/images/facilities/cafeteria.jpg',
    'https://web.mitsgwalior.in/images/facilities/cafeteria.png',
    'https://web.mitsgwalior.in/images/canteen_img.jpg',
    'https://web.mitsgwalior.in/images/canteen_img1.jpg',
    'https://web.mitsgwalior.in/images/canteen1.jpg',
    'https://web.mitsgwalior.in/images/canteen2.jpg',
    'https://web.mitsgwalior.in/images/infrastructure/canteen.jpg',
    'https://web.mitsgwalior.in/images/infrastructure/cafeteria.jpg',
]

for u in base_urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=4) as r:
            if r.status == 200:
                print('FOUND 200:', u, r.headers.get('content-length'))
    except Exception:
        pass
print('Done checking direct names.')
