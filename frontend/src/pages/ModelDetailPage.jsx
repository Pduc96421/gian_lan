import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { modelApi } from "../api/modelApi";
import { datasetApi } from "../api/datasetApi";
import { useTrainingWs } from "../hooks/useTrainingWs";

const fmt = (v) => (v * 100).toFixed(1) + "%";

function StatusBadge({ status }) {
  if (status === "HOAN_THANH")
    return <span className="badge badge-success">Hoàn thành</span>;
  return <span className="badge badge-warning">Đang huấn luyện</span>;
}

function MetricGrid({ model }) {
  return (
    <div className="metric-grid">
      {[
        ["Accuracy", model.accuracy],
        ["Precision", model.precision],
        ["Recall", model.recall],
        ["F1-Score", model.f1Score],
      ].map(([l, v]) => (
        <div key={l} className="metric-item">
          <div className="metric-label">{l}</div>
          <div className="metric-val">{fmt(v)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Phases ──────────────────────────────────────────────
const PHASE = { DATASET: "dataset", TRAINING: "training", RESULT: "result" };

export default function ModelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connect, disconnect } = useTrainingWs();

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dataset
  const [trainedSamples, setTrainedSamples] = useState([]);
  const [samples, setSamples] = useState([]);
  const [dsLoading, setDsLoading] = useState(false);
  const [dsKeyword, setDsKeyword] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [epochs, setEpochs] = useState(5);

  // Training progress
  const [phase, setPhase] = useState(PHASE.DATASET);
  const [progress, setProgress] = useState({
    percent: 0,
    message: "",
    currentEpoch: null,
    totalEpochs: null,
  });

  // Result
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load model
  useEffect(() => {
    setLoading(true);
    modelApi
      .getModelById(id)
      .then(async (m) => {
        setModel(m);
        if (m.moHinhMaus && m.moHinhMaus.length > 0) {
          try {
            const promises = m.moHinhMaus.map(async (mm) => {
              try {
                const s = await datasetApi.getSampleById(mm.mauHanhViId);
                return s ? { ...s, usedType: mm.type } : null;
              } catch {
                return null;
              }
            });
            const results = await Promise.all(promises);
            setTrainedSamples(results.filter(Boolean));
          } catch (err) {
            console.error("Lỗi khi tải tập dữ liệu:", err);
          }
        } else {
          setTrainedSamples([]);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Load samples
  const loadSamples = useCallback(async (kw) => {
    if (!kw || kw.trim() === "") {
      setSamples([]);
      return;
    }
    setDsLoading(true);
    try {
      setSamples(await datasetApi.searchSamples(kw));
    } catch {
      setSamples([]);
    } finally {
      setDsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSamples("");
  }, [loadSamples]);

  useEffect(() => {
    const t = setTimeout(() => loadSamples(dsKeyword), 350);
    return () => clearTimeout(t);
  }, [dsKeyword, loadSamples]);

  const toggleSample = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Start training ──
  const handleStartTrain = async () => {
    try {
      await modelApi.startTraining(id);
      setModel((m) => ({ ...m, trangThai: "DANG_TRAIN" }));
      setPhase(PHASE.TRAINING);
      setProgress({
        percent: 0,
        message: "Đang kết nối AI Service...",
        currentEpoch: null,
        totalEpochs: null,
      });

      connect(id, [...selected], epochs, {
        onProgress: (evt) =>
          setProgress({
            percent: evt.percent,
            message: evt.message,
            currentEpoch: evt.currentEpoch ?? null,
            totalEpochs: evt.totalEpochs ?? null,
          }),
        onCompleted: (evt) => {
          disconnect();
          setResult(evt);
          setPhase(PHASE.RESULT);
        },
        onCancelled: () => {
          disconnect();
          setModel((m) => ({ ...m, trangThai: "HOAN_THANH" }));
          setPhase(PHASE.DATASET);
        },
        onError: ({ message }) => {
          disconnect();
          alert("Lỗi huấn luyện: " + message);
          setModel((m) => ({ ...m, trangThai: "HOAN_THANH" }));
          setPhase(PHASE.DATASET);
        },
      });
    } catch (e) {
      alert(e.message);
    }
  };

  // ── Cancel training ──
  const handleCancelTrain = async () => {
    disconnect();
    try {
      await fetch(`http://localhost:8000/train/${id}`, { method: "DELETE" });
    } catch {}
    try {
      await modelApi.cancelTraining(id);
    } catch {}
    setModel((m) => ({ ...m, trangThai: "HOAN_THANH" }));
    setPhase(PHASE.DATASET);
  };

  // ── Save result ──
  const handleSave = async () => {
    setShowModal(false);
    try {
      const allSelected = Array.from(selected);
      const shuffled = [...allSelected].sort(() => 0.5 - Math.random());
      const splitIdx = Math.round(shuffled.length * 0.8);
      const trainIds = shuffled.slice(0, splitIdx);
      const testIds = shuffled.slice(splitIdx);

      const mauHanhVis = [
        ...trainIds.map((id) => ({ id, type: "TRAIN" })),
        ...testIds.map((id) => ({ id, type: "TEST" })),
      ];

      const updated = await modelApi.saveTrained({
        id,
        accuracy: result.accuracy,
        precision: result.precision,
        recall: result.recall,
        f1Score: result.f1Score,
        duongDanMoHinh: result.modelPath,
        mauHanhVis,
      });
      setModel(updated);

      if (updated.moHinhMaus && updated.moHinhMaus.length > 0) {
        const promises = updated.moHinhMaus.map(async (mm) => {
          try {
            const s = await datasetApi.getSampleById(mm.mauHanhViId);
            return s ? { ...s, usedType: mm.type } : null;
          } catch {
            return null;
          }
        });
        const results = await Promise.all(promises);
        setTrainedSamples(results.filter(Boolean));
      } else {
        setTrainedSamples([]);
      }

      setResult(null);
      setSelected(new Set());
      setPhase(PHASE.DATASET);
      alert("Lưu mô hình thành công!");
    } catch (e) {
      alert("Lỗi khi lưu: " + e.message);
    }
  };

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" /> Đang tải...
      </div>
    );
  if (error)
    return <div style={{ padding: 40, color: "var(--danger)" }}>{error}</div>;
  if (!model) return null;

  return (
    <>
      {/* Page header */}
      <div className="page-hdr">
        <div>
          <div className="breadcrumb">
            <Link to="/models">Quản lý Mô hình</Link>
            <span style={{ color: "var(--border)" }}>/</span>
            <span>Chi tiết</span>
          </div>
          <h1 className="page-title">{model.tenMoHinh}</h1>
          <p className="page-sub">Cập nhật và huấn luyện lại mô hình</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/models")}>
          ← Quay lại
        </button>
      </div>

      {/* Model info */}
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">Thông tin Mô hình</span>
          <StatusBadge status={model.trangThai} />
        </div>
        <div className="card-body">
          <MetricGrid model={model} />
          <p className="text-sm text-muted">
            Đường dẫn: <code>{model.duongDanMoHinh || "—"}</code>
          </p>
        </div>
      </div>

      {/* Trained Datasets Info */}
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">Tập dữ liệu đã huấn luyện</span>
          <span className="text-sm text-muted">
            {trainedSamples.length} mẫu
          </span>
        </div>
        <div className="card-body">
          {trainedSamples.length === 0 ? (
            <p className="text-sm text-muted" style={{ margin: 0 }}>
              Không có thông tin tập dữ liệu đã huấn luyện.
            </p>
          ) : (
            <div className="dataset-grid" style={{ marginTop: 0 }}>
              {trainedSamples.map((s) => (
                <div
                  key={s.id}
                  className="ds-card"
                  style={{ cursor: "default", opacity: 0.9 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div className="ds-name">
                      {s.hanhViGianLan?.tenHanhVi || "—"}
                    </div>
                    <span
                      className={`badge ${s.usedType === "TEST" ? "badge-info" : "badge-primary"}`}
                      style={{ fontSize: "0.7rem", padding: "2px 6px" }}
                    >
                      {s.usedType}
                    </span>
                  </div>
                  <div className="ds-path">{s.duongDanDuLieu}</div>
                  <div className="ds-date">{s.ngayTao}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dataset picker */}
      {phase === PHASE.DATASET && (
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Chọn tập dữ liệu</span>
            <span className="text-sm text-muted">
              {selected.size
                ? `Đã chọn ${selected.size} mẫu`
                : "Chưa chọn mẫu nào"}
            </span>
          </div>
          <div className="card-body">
            <div className="search-wrap">
              <span className="s-icon"></span>
              <input
                placeholder="Tìm theo tên hành vi gian lận..."
                value={dsKeyword}
                onChange={(e) => setDsKeyword(e.target.value)}
              />
            </div>

            {dsLoading ? (
              <div className="loading-center">
                <div className="spinner" />
              </div>
            ) : dsKeyword.trim() === "" ? (
              <div className="empty">
                <p>Nhập từ khoá để tìm kiếm tập dữ liệu...</p>
              </div>
            ) : samples.length === 0 ? (
              <div className="empty">
                <p>Không tìm thấy mẫu phù hợp</p>
              </div>
            ) : (
              <div className="dataset-grid">
                {samples.map((s) => (
                  <div
                    key={s.id}
                    className={`ds-card${selected.has(s.id) ? " selected" : ""}`}
                    onClick={() => toggleSample(s.id)}
                  >
                    <div className="ds-name">
                      {s.hanhViGianLan?.tenHanhVi || "—"}
                    </div>
                    <div className="ds-path">{s.duongDanDuLieu}</div>
                    <div className="ds-date">{s.ngayTao}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="epoch-config">
              <label>Số epoch huấn luyện:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={epochs}
                onChange={(e) =>
                  setEpochs(Math.max(1, parseInt(e.target.value) || 5))
                }
                className="epoch-input"
              />
              <span className="text-sm text-muted">epoch (1 – 100)</span>
              <div style={{ flex: 1 }} />
              <button
                className="btn btn-primary"
                disabled={selected.size === 0}
                onClick={handleStartTrain}
              >
                Bắt đầu huấn luyện lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Training progress */}
      {phase === PHASE.TRAINING && (
        <div className="card">
          <div className="card-body">
            <div className="prog-hdr">
              <span className="prog-title">Đang huấn luyện mô hình...</span>
              <span className="prog-pct">{progress.percent}%</span>
            </div>
            <div className="prog-track">
              <div
                className="prog-fill"
                style={{ width: progress.percent + "%" }}
              />
            </div>
            <div className="prog-msg">{progress.message}</div>
            {progress.currentEpoch && (
              <div className="prog-epoch">
                Epoch {progress.currentEpoch} / {progress.totalEpochs}
              </div>
            )}
            <div className="flex gap-8 mt-12">
              <button className="btn btn-danger" onClick={handleCancelTrain}>
                Huỷ huấn luyện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Training result */}
      {phase === PHASE.RESULT && result && (
        <div className="card">
          <div className="card-body">
            <div className="result-box">
              <div className="result-title">Huấn luyện hoàn tất!</div>
              <div className="metric-grid">
                {[
                  ["Accuracy", result.accuracy],
                  ["Precision", result.precision],
                  ["Recall", result.recall],
                  ["F1-Score", result.f1Score],
                ].map(([l, v]) => (
                  <div key={l} className="metric-item">
                    <div className="metric-label">{l}</div>
                    <div className="metric-val">{fmt(v)}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted">
                Đường dẫn mới: <code>{result.modelPath}</code>
              </p>
            </div>
            <div className="flex gap-8 justify-end">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setResult(null);
                  setPhase(PHASE.DATASET);
                }}
              >
                Bỏ kết quả
              </button>
              <button
                className="btn btn-success"
                onClick={() => setShowModal(true)}
              >
                Xác nhận lưu mô hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Xác nhận lưu mô hình</div>
            <div className="modal-body">
              Bạn có chắc muốn cập nhật mô hình với kết quả huấn luyện mới?
              <br />
              Thao tác này sẽ ghi đè các chỉ số hiện tại.
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button className="btn btn-success" onClick={handleSave}>
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
