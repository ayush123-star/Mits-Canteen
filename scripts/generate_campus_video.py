import os, cv2, numpy as np

campus_dir = os.path.join('client', 'public', 'assets', 'campus')
video_dir = os.path.join('client', 'public', 'assets', 'videos')
out_video_path = os.path.join(video_dir, 'mits-campus-tour.mp4')
poster_path = os.path.join(video_dir, 'mits-campus-tour-poster.jpg')

scenes = [
    os.path.join(campus_dir, 'mits-main-gate.jpg'),
    os.path.join(campus_dir, 'mits-heritage-building.jpg'),
    os.path.join(campus_dir, 'mits-main-canteen.jpg'),
    os.path.join(campus_dir, 'mits-academic-block.jpg'),
    os.path.join(campus_dir, 'mits-gardens.jpg'),
    os.path.join(campus_dir, 'mits-central-library.jpg')
]

loaded_images = [(p, cv2.imread(p)) for p in scenes if cv2.imread(p) is not None]
print(f'Loaded {len(loaded_images)} scenes for video generation.')

# 960x540 at 20fps for optimal web speed and smoothness
width = 960
height = 540
fps = 20
frames_per_scene = 50
fade_frames = 12

fourcc = cv2.VideoWriter_fourcc(*'avc1')
writer = cv2.VideoWriter(out_video_path, fourcc, fps, (width, height))

def get_scene_frame(img, progress, motion_type=0):
    h, w = img.shape[:2]
    scale = 1.0 + 0.10 * progress
    crop_w = int(w / scale)
    crop_h = int(h / scale)
    if motion_type == 0:
        x1 = int((w - crop_w) * progress * 0.7)
        y1 = int((h - crop_h) * 0.5)
    elif motion_type == 1:
        x1 = int((w - crop_w) * 0.5)
        y1 = int((h - crop_h) * (1.0 - progress * 0.6))
    elif motion_type == 2:
        x1 = int((w - crop_w) * (1.0 - progress * 0.7))
        y1 = int((h - crop_h) * 0.5)
    else:
        x1 = int((w - crop_w) * 0.5)
        y1 = int((h - crop_h) * 0.5)

    x2 = min(w, x1 + crop_w)
    y2 = min(h, y1 + crop_h)
    crop = img[y1:y2, x1:x2]
    return cv2.resize(crop, (width, height), interpolation=cv2.INTER_LINEAR)

num_scenes = len(loaded_images)
total_frames = 0
for i in range(num_scenes):
    curr_img = loaded_images[i][1]
    next_img = loaded_images[(i + 1) % num_scenes][1]
    motion_curr = i % 4
    motion_next = (i + 1) % 4
    for f in range(frames_per_scene):
        prog = f / float(frames_per_scene)
        frame_curr = get_scene_frame(curr_img, prog, motion_curr)
        if f >= (frames_per_scene - fade_frames):
            fade_prog = (f - (frames_per_scene - fade_frames)) / float(fade_frames)
            frame_next = get_scene_frame(next_img, fade_prog * 0.2, motion_next)
            blended = cv2.addWeighted(frame_curr, 1.0 - fade_prog, frame_next, fade_prog, 0)
            writer.write(blended)
        else:
            writer.write(frame_curr)
        total_frames += 1

writer.release()
print(f'MITS tour MP4 with Main Canteen updated! Size: {os.path.getsize(out_video_path) / (1024*1024):.2f} MB')
