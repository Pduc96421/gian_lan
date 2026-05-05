import cv2
import numpy as np
import time
from collections import defaultdict, deque

class ObjectDetector:
    def __init__(self, model):
        self.model = model
        self.confidence_threshold = 0.4
    
    def detect_objects(self, frame):
        if self.model is None:
            return []
        
        try:
            results = self.model(frame, verbose=False)
            detected_objects = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        confidence = float(box.conf[0])
                        class_id = int(box.cls[0])
                        class_name = self.model.names[class_id].lower()
                        
                        if confidence >= self.confidence_threshold:
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                            
                            obj_info = {
                                'class_name': class_name,
                                'class_id': class_id,
                                'confidence': confidence,
                                'bbox': (int(x1), int(y1), int(x2-x1), int(y2-y1)),
                                'center': (int((x1+x2)/2), int((y1+y2)/2)),
                                'area': int((x2-x1) * (y2-y1))
                            }
                            detected_objects.append(obj_info)
            return detected_objects
        except Exception as e:
            print(f"Error in object detection: {e}")
            return []

    def draw_detections(self, frame, objects):
        for obj in objects:
            x, y, w, h = obj['bbox']
            class_name = obj['class_name']
            confidence = obj['confidence']
            
            if class_name == 'cell phone':
                color = (0, 0, 255)  # Đỏ
            elif class_name == 'person':
                color = (0, 255, 0)  # Xanh lá
            else:
                color = (0, 255, 255)  # Vàng
            
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            label = f"{class_name}: {confidence:.2f}"
            cv2.putText(frame, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        return frame

class ViolationDetector:
    def __init__(self):
        self.violation_cooldowns = defaultdict(float)
        self.cooldown_duration = 5.0  # seconds
    
    def check_violations(self, objects, frame, current_time_sec):
        violations = []
        
        # 1. Kiểm tra camera bị che (Chuyển từ monitor.py sang)
        avg_color = np.mean(frame)
        if avg_color < 15 and self._is_cooldown_expired('camera_covered', current_time_sec):
            self.violation_cooldowns['camera_covered'] = current_time_sec
            violations.append({
                'type': 'camera_covered',
                'details': 'Cảnh báo: Camera có thể đã bị che hoặc quá tối!'
            })

        # 2. Kiểm tra điện thoại
        phones = [obj for obj in objects if obj['class_name'] == 'cell phone']
        if phones and self._is_cooldown_expired('phone_detected', current_time_sec):
            self.violation_cooldowns['phone_detected'] = current_time_sec
            violations.append({
                'type': 'phone_detected',
                'details': f"Phát hiện {len(phones)} điện thoại"
            })
            
        return violations

    def _is_cooldown_expired(self, violation_type, current_time):
        last_time = self.violation_cooldowns.get(violation_type, 0)
        return current_time - last_time >= self.cooldown_duration
