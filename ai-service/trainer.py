import asyncio
import random
from typing import AsyncGenerator, Dict

training_sessions: Dict[str, "TrainingSession"] = {}


class TrainingSession:
    def __init__(self, model_id: str, sample_paths: list):
        self.model_id = model_id
        self.sample_paths = sample_paths
        self.is_running = False
        self._cancelled = False

    def cancel(self):
        self._cancelled = True
        self.is_running = False

    async def train(self, epochs: int = 5) -> AsyncGenerator[dict, None]:
        self.is_running = True
        self._cancelled = False

        # Giai đoạn tiền xử lý (0% → 20%)
        pre_stages = [
            (5,  "Đang tải dữ liệu..."),
            (12, "Tiền xử lý dữ liệu..."),
            (20, "Khởi tạo mô hình..."),
        ]
        for pct, msg in pre_stages:
            if self._cancelled:
                yield {"type": "cancelled", "message": "Huấn luyện đã bị huỷ"}
                self.is_running = False
                return
            yield {"type": "progress", "percent": pct, "message": msg}
            await asyncio.sleep(random.uniform(0.8, 1.5))

        # Giai đoạn huấn luyện epoch (20% → 85%)
        epoch_start = 20
        epoch_end   = 85
        for epoch in range(1, epochs + 1):
            if self._cancelled:
                yield {"type": "cancelled", "message": "Huấn luyện đã bị huỷ"}
                self.is_running = False
                return
            pct = int(epoch_start + (epoch / epochs) * (epoch_end - epoch_start))
            yield {
                "type":         "progress",
                "percent":      pct,
                "message":      f"Huấn luyện epoch {epoch}/{epochs}...",
                "currentEpoch": epoch,
                "totalEpochs":  epochs,
            }
            await asyncio.sleep(random.uniform(1.0, 2.2))

        # Giai đoạn hậu xử lý (85% → 100%)
        post_stages = [
            (90,  "Đánh giá mô hình..."),
            (95,  "Lưu mô hình..."),
            (100, "Hoàn thành!"),
        ]
        for pct, msg in post_stages:
            if self._cancelled:
                yield {"type": "cancelled", "message": "Huấn luyện đã bị huỷ"}
                self.is_running = False
                return
            yield {"type": "progress", "percent": pct, "message": msg}
            await asyncio.sleep(random.uniform(0.8, 1.5))

        if not self._cancelled:
            accuracy  = round(random.uniform(0.85, 0.97), 4)
            precision = round(random.uniform(0.83, 0.96), 4)
            recall    = round(random.uniform(0.84, 0.95), 4)
            f1        = round(2 * precision * recall / (precision + recall), 4)
            
            import os
            import time
            models_dir = os.path.join(os.path.dirname(__file__), "models")
            os.makedirs(models_dir, exist_ok=True)
            filename = f"{self.model_id}_retrained_{int(time.time())}.pkl"
            filepath = os.path.join(models_dir, filename)
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(f"Dữ liệu mô hình giả lập cho {self.model_id}\n")
                f.write(f"Accuracy: {accuracy}\nPrecision: {precision}\nRecall: {recall}\nF1: {f1}\n")
                
            yield {
                "type":      "completed",
                "accuracy":  accuracy,
                "precision": precision,
                "recall":    recall,
                "f1Score":   f1,
                "modelPath": f"/models/{filename}",
            }

        self.is_running = False
