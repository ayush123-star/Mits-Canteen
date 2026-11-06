import cv2
import numpy as np
import os

img = cv2.imread('scratch_images/canteen_inpainted.jpg')
h, w = img.shape[:2]

# Upscale cleanly to 960x540
upscaled = cv2.resize(img, (960, 540), interpolation=cv2.INTER_CUBIC)

# Gentle unsharp mask for crisp dining hall & counter details
gaussian = cv2.GaussianBlur(upscaled, (0, 0), 2.0)
sharpened = cv2.addWeighted(upscaled, 1.35, gaussian, -0.35, 0)

# Save to assets/campus and images/mits
target_1 = os.path.join('client', 'public', 'assets', 'campus', 'mits-main-canteen.jpg')
target_2 = os.path.join('client', 'public', 'images', 'mits', 'mits-main-canteen.jpg')

cv2.imwrite(target_1, sharpened, [cv2.IMWRITE_JPEG_QUALITY, 92])
cv2.imwrite(target_2, sharpened, [cv2.IMWRITE_JPEG_QUALITY, 92])

print('Saved MITS Main Canteen photo successfully to:')
print(target_1, os.path.getsize(target_1), 'bytes')
print(target_2, os.path.getsize(target_2), 'bytes')
