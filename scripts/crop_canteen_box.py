import cv2

img = cv2.imread('scratch_images/yt_canteen_1.jpg')
h, w = img.shape[:2]

# In the thumbnail:
# The yellow bar "MP's Best Infrastructure College" ends at around y = 0.68 * h
# The bottom canteen panel starts at around y = 0.685 * h and ends at h = 720
# x starts around 0.33 * w (422) and ends at around 0.665 * w (851)
y1 = int(h * 0.685)
y2 = int(h * 0.99)
x1 = int(w * 0.332)
x2 = int(w * 0.665)

crop1 = img[y1:y2, x1:x2]
cv2.imwrite('scratch_images/crop_clean_canteen.jpg', crop1)
print('Cropped clean canteen shape:', crop1.shape)
