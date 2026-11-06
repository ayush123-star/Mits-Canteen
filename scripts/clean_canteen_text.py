import cv2
import numpy as np

img = cv2.imread('scratch_images/crop_clean_canteen.jpg')
h, w = img.shape[:2]

# Option A: Focus on the vibrant canteen counter, seating, pillars, and dining hall (crop above text)
# The text "Canteen" starts around y = int(h * 0.65)
crop_top = img[0:int(h * 0.75), :]
cv2.imwrite('scratch_images/canteen_focus_counter.jpg', crop_top)

# Option B: Inpaint the text mask
# Detect white/bright text "Canteen" with colored outlines
mask = np.zeros((h, w), dtype=np.uint8)
# The text is in the lower region: y from int(h*0.65) to h, x from int(w*0.22) to int(w*0.88)
roi_y1, roi_y2 = int(h * 0.64), h
roi_x1, roi_x2 = int(w * 0.20), int(w * 0.90)

roi = img[roi_y1:roi_y2, roi_x1:roi_x2]
# White interior of letters
gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
text_mask = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)[1]
# Dilate to cover colored outlines
kernel = np.ones((5, 5), np.uint8)
dilated = cv2.dilate(text_mask, kernel, iterations=2)
mask[roi_y1:roi_y2, roi_x1:roi_x2] = dilated

inpainted = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
cv2.imwrite('scratch_images/canteen_inpainted.jpg', inpainted)
print('Saved both versions!')
