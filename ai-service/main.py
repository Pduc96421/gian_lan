import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from trainer import TrainingSession, training_sessions
from monitor import router as monitor_router

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="AI Training Service", version="1.0.0")

# Mount thư mục chứa ảnh vi phạm để FE có thể truy cập
VIOLATIONS_DIR = os.path.join(os.path.dirname(__file__), "violations")
os.makedirs(VIOLATIONS_DIR, exist_ok=True)
app.mount("/violations", StaticFiles(directory=VIOLATIONS_DIR), name="violations")

app.include_router(monitor_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-service", "port": 8000}


@app.delete("/train/{model_id}")
async def cancel_training(model_id: str):
    """Huỷ phiên train đang chạy"""
    if model_id not in training_sessions:
        return JSONResponse(status_code=404, content={"error": "Không tìm thấy phiên train"})
    training_sessions[model_id].cancel()
    return {"message": "Đã gửi lệnh huỷ", "modelId": model_id}


@app.websocket("/ws/train/{model_id}")
async def websocket_train(websocket: WebSocket, model_id: str):
    """
    WebSocket endpoint để train mô hình và push tiến độ về FE.

    Client gửi JSON:
    { "samplePaths": ["/data/...", ...] }

    Server trả về:
    { "type": "progress",   "percent": 45, "message": "..." }
    { "type": "completed",  "accuracy": 0.92, ... }
    { "type": "cancelled",  "message": "..." }
    { "type": "error",      "message": "..." }
    """
    await websocket.accept()

    # Kiểm tra có phiên train đang chạy không
    if model_id in training_sessions and training_sessions[model_id].is_running:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Mô hình đang được huấn luyện bởi phiên khác"
        }))
        await websocket.close()
        return

    try:
        raw = await websocket.receive_text()
        data = json.loads(raw)
        sample_paths = data.get("samplePaths", [])
        epochs       = max(1, int(data.get("epochs", 5)))

        session = TrainingSession(model_id, sample_paths)
        training_sessions[model_id] = session

        async for event in session.train(epochs):
            await websocket.send_text(json.dumps(event))
            if event.get("type") in ("completed", "cancelled", "error"):
                break

    except WebSocketDisconnect:
        if model_id in training_sessions:
            training_sessions[model_id].cancel()
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
        except Exception:
            pass
    finally:
        training_sessions.pop(model_id, None)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
