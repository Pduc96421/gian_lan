import asyncio
import base64
import time
import os
from typing import Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import cv2
import numpy as np
import httpx
from ultralytics import YOLO
from detectors import ObjectDetector, ViolationDetector

import traceback
import torch

original_torch_load = torch.load
def patched_torch_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_torch_load(*args, **kwargs)
torch.load = patched_torch_load

router = APIRouter()

# Bộ nhớ đệm mô hình
detectors_cache = {}

def get_object_detector(model_path: str = None):
    # Nếu không có path hoặc path mặc định
    if not model_path or model_path == "yolov8n.pt":
        model_path = "yolov8n.pt"
    
    if model_path not in detectors_cache:
        path = model_path.lstrip("/")
        full_path = os.path.join(os.path.dirname(__file__), path)
        
        # Nếu file không tồn tại, dùng file mặc định ở gốc ai-service
        if not os.path.exists(full_path):
            full_path = os.path.join(os.path.dirname(__file__), "yolov8n.pt")

        try:
            print(f"[{time.strftime('%H:%M:%S')}] Nạp mô hình: {full_path}")
            detectors_cache[model_path] = ObjectDetector(YOLO(full_path))
        except Exception as e:
            print(f"Lỗi nạp mô hình {full_path}: {e}")
            return None
            
    return detectors_cache[model_path]

# Khởi tạo mặc định
get_object_detector()

# Thư mục lưu ảnh vi phạm và video
VIOLATIONS_DIR = os.path.join(os.path.dirname(__file__), "violations")
os.makedirs(VIOLATIONS_DIR, exist_ok=True)

VIDEOS_DIR = os.path.join(os.path.dirname(__file__), "videos")
os.makedirs(VIDEOS_DIR, exist_ok=True)

DETECT_SERVICE_URL = "http://localhost:5002/api/detect/violations"
DETECT_VIDEO_URL = "http://localhost:5002/api/detect/cameras/{}/video-source"

async def process_frame(frame_b64: str, camera_ca_thi_id: str, model_id: str, violation_detector: ViolationDetector, model_path: str = None, start_time: float = None):
    # Lấy base64 phần data
    if "," in frame_b64:
        frame_b64 = frame_b64.split(",")[1]
    
    img_data = base64.b64decode(frame_b64)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        print(f"[{camera_ca_thi_id}] Lỗi decode ảnh từ base64")
        return None, 0, 0, None

    detector = get_object_detector(model_path)
    if not detector:
        return None, 0, 0, img, []

    objects = detector.detect_objects(img)
    
    current_time_sec = time.time()
    violations = violation_detector.check_violations(objects, img, current_time_sec)
    
    if violations:
        img_drawn = detector.draw_detections(img.copy(), objects)
        
        # Tính timestamp từ video (nếu có start_time)
        timestamp_str = "00:00"
        if start_time:
            elapsed = time.time() - start_time
            mins = int(elapsed // 60)
            secs = int(elapsed % 60)
            timestamp_str = f"{mins:02d}:{secs:02d}"

        cv2.putText(img_drawn, f"VI PHAM @ {timestamp_str}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
        cv2.rectangle(img_drawn, (0, 0), (img.shape[1], img.shape[0]), (0, 0, 255), 10)
        
        # Lưu ảnh vi phạm
        filename = f"violation_{camera_ca_thi_id}_{int(current_time_sec)}.jpg"
        filepath = os.path.join(VIOLATIONS_DIR, filename)
        cv2.imwrite(filepath, img_drawn)
        
        # Gửi cảnh báo
        for v in violations:
            violation_url = f"/violations/{filename}"
            # Thêm thông tin ảnh để FE hiển thị trực tiếp
            v['image_url'] = violation_url
            details_with_time = f"[{timestamp_str}] {v['details']}"
            asyncio.create_task(send_violation_alert(camera_ca_thi_id, model_id, violation_url, v['type'], details_with_time))

    person_count = sum(1 for obj in objects if obj['class_name'] == 'person')
    phone_count = sum(1 for obj in objects if obj['class_name'] == 'cell phone')

    return None, person_count, phone_count, img, violations

async def send_violation_alert(camera_ca_thi_id: str, model_id: str, img_url: str, v_type: str, details: str):
    payload = {
        "cameraCaThiId": camera_ca_thi_id,
        "chiTiet": details,
        "hinhAnhMinhChungUrl": img_url,
        "hanhViGianLan": v_type,
        "moHinhId": model_id
    }
    try:
        async with httpx.AsyncClient() as client:
            print(f"==> [AI -> Detect] Đang gửi báo cáo vi phạm [{v_type}] cho Camera: {camera_ca_thi_id}")
            await client.post(DETECT_SERVICE_URL, json=payload, timeout=5.0)
            print(f"<== [AI <- Detect] Đã lưu vi phạm thành công.")
    except Exception as e:
        print(f"<!= [AI x Detect] Lỗi gửi báo cáo vi phạm: {e}")


async def update_video_source(camera_ca_thi_id: str, video_url: str):
    url = DETECT_VIDEO_URL.format(camera_ca_thi_id)
    try:
        async with httpx.AsyncClient() as client:
            print(f"==> [AI -> Detect] Đang cập nhật link video ca thi cho Camera: {camera_ca_thi_id}")
            await client.put(url, json={"duongDanVideo": video_url}, timeout=5.0)
            print(f"<== [AI <- Detect] Cập nhật video thành công.")
    except Exception as e:
        print(f"<!= [AI x Detect] Lỗi cập nhật đường dẫn video: {e}")

@router.websocket("/ws/monitor/{camera_ca_thi_id}/{model_id}")
async def websocket_monitor(websocket: WebSocket, camera_ca_thi_id: str, model_id: str, path: str = None):
    await websocket.accept()
    print(f"[{camera_ca_thi_id}] Mở kết nối WebSocket giám sát. Model: {model_id}, Path: {path}")
    
    violation_detector = ViolationDetector()
    session_id = f"session_{camera_ca_thi_id}_{int(time.time())}"
    video_path = os.path.join(VIDEOS_DIR, f"{session_id}.mp4")
    writer = None
    start_time = time.time()

    try:
        while True:
            try:
                data = await websocket.receive_json()
            except Exception as e:
                print(f"[{camera_ca_thi_id}] Lỗi nhận JSON hoặc ngắt kết nối: {e}")
                break

            if "frame" in data:
                frame_b64 = data["frame"]
                out_b64, persons, phones, processed_img, current_violations = await process_frame(frame_b64, camera_ca_thi_id, model_id, violation_detector, path, start_time)
                
                # Khởi tạo VideoWriter nếu chưa có
                if writer is None and processed_img is not None:
                    h, w, _ = processed_img.shape
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    writer = cv2.VideoWriter(video_path, fourcc, 5.0, (w, h)) # Giả định ~5 fps
                
                if writer is not None and processed_img is not None:
                    writer.write(processed_img)

                await websocket.send_json({
                    "type": "result",
                    "frame": out_b64,
                    "persons": persons,
                    "phones": phones,
                    "violations": current_violations
                })
    except WebSocketDisconnect:
        print(f"[{camera_ca_thi_id}] Ngắt kết nối giám sát.")
    except Exception as e:
        print(f"[{camera_ca_thi_id}] Lỗi WebSocket: {e}")
        try:
            await websocket.close()
        except:
            pass
    finally:
        if writer is not None:
            writer.release()
            print(f"[{camera_ca_thi_id}] Đã lưu video: {video_path}")
            # Gọi API cập nhật video source
            asyncio.create_task(update_video_source(camera_ca_thi_id, f"/videos/{session_id}.mp4"))
