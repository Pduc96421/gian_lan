import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { modelApi } from '../api/modelApi'
import { detectApi } from '../api/detectApi'
import { useMonitorWs } from '../hooks/useMonitorWs'

export default function MonitorPage() {
  // Selectors
  const [models, setModels] = useState([])
  const [caThiList, setCaThiList] = useState([])
  const [cameras, setCameras] = useState([])

  const [selectedModel, setSelectedModel] = useState('')
  const [selectedCaThi, setSelectedCaThi] = useState('')
  const [selectedCameraCaThi, setSelectedCameraCaThi] = useState('')

  // App state
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Monitoring data
  const [stats, setStats] = useState({ persons: 0, phones: 0 })
  const [timeLeft, setTimeLeft] = useState(0) // Giây còn lại
  const [elapsedTime, setElapsedTime] = useState(0) // Giây đã trôi qua
  const [violations, setViolations] = useState([])

  // Hooks
  const { connect, sendFrame, disconnect } = useMonitorWs()

  // Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const captureInterval = useRef(null)
  const pollInterval = useRef(null)

  // Load models and caThiList
  useEffect(() => {
    modelApi.getModels('').then(setModels).catch(() => { })
    detectApi.getCaThiList().then(setCaThiList).catch(() => { })
  }, [])

  // Load cameras when caThi changes
  useEffect(() => {
    if (selectedCaThi) {
      detectApi.getCamerasByCaThi(selectedCaThi).then(setCameras).catch(() => { })
      setSelectedCameraCaThi('')
    } else {
      setCameras([])
    }
  }, [selectedCaThi])

  // Turn on local webcam
  const handleTurnOnCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(e => console.error("Video play error:", e))
        streamRef.current = stream
        setIsCameraOn(true)
      }
    } catch (e) {
      alert('Không thể truy cập camera: ' + e.message)
    }
  }

  // Turn off local webcam
  const handleTurnOffCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
      setIsCameraOn(false)
    }
  }

  const fetchViolations = useCallback(async () => {
    if (!selectedCameraCaThi) return
    try {
      const data = await detectApi.getViolations(selectedCameraCaThi)
      setViolations(data)
    } catch (e) { console.error('Lỗi tải vi phạm:', e) }
  }, [selectedCameraCaThi])

  // Start monitoring (WebSocket)
  const handleStartMonitor = async () => {
    if (!selectedModel || !selectedCameraCaThi) {
      alert('Vui lòng chọn mô hình và camera')
      return
    }
    if (!isCameraOn) {
      alert('Vui lòng bật camera trước khi giám sát')
      return
    }

    // Update status to DANG_THI
    try {
      await detectApi.updateCaThiStatus(selectedCaThi, 'DANG_THI')
    } catch (e) {
      console.warn("Không thể cập nhật trạng thái ca thi", e)
    }

    // Lấy thông tin model để có đường dẫn
    const modelObj = models.find(m => String(m.id) === String(selectedModel))
    const modelPath = modelObj?.duongDan || ''

    connect(selectedCameraCaThi, selectedModel, modelPath, {
      onOpen: () => {
        setIsMonitoring(true)

        // Bắt đầu đếm ngược và đếm thời gian trôi qua
        const caThiObj = caThiList.find(c => String(c.id) === String(selectedCaThi))
        const durationSec = (caThiObj?.thoiLuongPhut || 60) * 60
        setTimeLeft(durationSec)
        setElapsedTime(0)

        // Start capturing frames
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        captureInterval.current = setInterval(() => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
            const frameB64 = canvas.toDataURL('image/jpeg', 0.9)
            sendFrame(frameB64)
          }
        }, 200) // ~5 fps

        // Timer đếm ngược
        const timer = setInterval(() => {
          setTimeLeft(prev => Math.max(0, prev - 1))
          setElapsedTime(prev => prev + 1)
        }, 1000)

        // Poll vi phạm (Đã chuyển sang dùng WebSocket để lấy vi phạm Real-time cho phiên này)
        // pollInterval.current = [timer] 

        pollInterval.current = [timer]
      },
      onResult: (data) => {
        setStats({ persons: data.persons || 0, phones: data.phones || 0 })

        // Nếu có vi phạm mới từ AI gửi về
        if (data.violations && data.violations.length > 0) {
          setViolations(prev => {
            // Chuyển đổi dữ liệu từ AI sang định dạng FE cần hiển thị
            const newViolations = data.violations.map(v => ({
              id: Date.now() + Math.random(), // ID tạm thời
              hanhViGianLan: v.type,
              chiTiet: v.details,
              hinhAnhMinhChungUrl: v.image_url, // Lấy trực tiếp từ AI gửi về
              thoiDiemPhatHien: new Date().toISOString()
            }))

            // Chỉ thêm những cái chưa có (tránh trùng lặp trong một đợt gửi)
            return [...newViolations, ...prev]
          })
        }
      },
      onClose: () => {
        stopMonitorInternal()
      },
      onError: ({ message }) => {
        console.error(message)
        stopMonitorInternal()
      }
    })
  }

  const stopMonitorInternal = () => {
    setIsMonitoring(false)
    if (captureInterval.current) clearInterval(captureInterval.current)
    if (pollInterval.current) {
      if (Array.isArray(pollInterval.current)) {
        pollInterval.current.forEach(id => clearInterval(id))
      } else {
        clearInterval(pollInterval.current)
      }
    }
    disconnect()
  }

  // Stop monitoring
  const handleStopMonitor = async () => {
    stopMonitorInternal()

    try {
      await detectApi.updateCaThiStatus(selectedCaThi, 'DA_KET_THUC')
    } catch (e) {
      console.warn("Không thể cập nhật trạng thái ca thi", e)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleTurnOffCamera()
      stopMonitorInternal()
    }
  }, [])

  return (
    <>
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Giám Sát Thi Cử</h1>
          <p className="page-sub">Nhận dạng hành vi gian lận qua camera thời gian thực</p>
        </div>
      </div>

      <div className="flex gap-16" style={{ alignItems: 'flex-start' }}>
        {/* Cột trái: Thiết lập & Video */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Card thiết lập */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Cấu hình giám sát</span>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label>Mô hình AI</label>
                  <select className="form-control" value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={isMonitoring}>
                    <option value="">-- Chọn mô hình --</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.tenMoHinh}</option>)}
                  </select>
                </div>
                <div>
                  <label>Ca thi</label>
                  <select className="form-control" value={selectedCaThi} onChange={e => setSelectedCaThi(e.target.value)} disabled={isMonitoring}>
                    <option value="">-- Chọn ca thi --</option>
                    {caThiList.map(s => <option key={s.id} value={s.id}>{s.mon?.tenMon} - {s.phong?.tenPhong} ({s.thoiLuongPhut} phút)</option>)}
                  </select>
                </div>
                <div>
                  <label>Camera</label>
                  <select className="form-control" value={selectedCameraCaThi} onChange={e => setSelectedCameraCaThi(e.target.value)} disabled={isMonitoring || !selectedCaThi}>
                    <option value="">-- Chọn camera --</option>
                    {cameras.map(c => <option key={c.id} value={c.id}>{c.camera?.tenCamera} - {c.camera?.viTri}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-8 mt-12">
                {!isCameraOn ? (
                  <button className="btn btn-primary" onClick={handleTurnOnCamera}>Bật Camera</button>
                ) : (
                  <button className="btn btn-ghost" onClick={handleTurnOffCamera} disabled={isMonitoring}>Tắt Camera</button>
                )}

                {!isMonitoring ? (
                  <button className="btn btn-success" onClick={handleStartMonitor} disabled={!isCameraOn || !selectedModel || !selectedCaThi || !selectedCameraCaThi}>Bắt đầu giám sát</button>
                ) : (
                  <button className="btn btn-danger" onClick={handleStopMonitor}>Dừng giám sát</button>
                )}
              </div>
            </div>
          </div>

          {/* Card Video Streaming */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Luồng Video Trực tiếp</span>
              {isMonitoring && (
                <div className="flex gap-16 text-sm font-600">
                  <span style={{ color: 'var(--primary)' }}>Còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                  <span style={{ color: 'var(--success)' }}>Người: {stats.persons}</span>
                  <span style={{ color: 'var(--danger)' }}>Điện thoại: {stats.phones}</span>
                </div>
              )}
            </div>
            <div className="card-body" style={{ padding: 0, position: 'relative', background: '#000', minHeight: 400, borderRadius: '0 0 8px 8px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
              {/* Nguồn Video ẩn (để capture) */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%', maxHeight: 600, objectFit: 'contain',
                  background: '#000'
                }}
              />

              {!isCameraOn && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  Camera đang tắt
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Lịch sử vi phạm */}
        <div style={{ flex: 1, minWidth: 350 }}>
          <div className="card" style={{ height: '100%', minHeight: 600 }}>
            <div className="card-hdr">
              <span className="card-title">Lịch sử vi phạm phiên này</span>
              <span className="badge badge-danger">{violations.length}</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {violations.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                  Chưa có vi phạm nào được ghi nhận.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {violations.map(v => (
                    <div key={v.id} style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                      {v.hinhAnhMinhChungUrl && (
                        <a
                          href={v.hinhAnhMinhChungUrl.startsWith('http') ? v.hinhAnhMinhChungUrl : `http://localhost:8000${v.hinhAnhMinhChungUrl}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={v.hinhAnhMinhChungUrl.startsWith('http') ? v.hinhAnhMinhChungUrl : `http://localhost:8000${v.hinhAnhMinhChungUrl}`}
                            alt="Bằng chứng"
                            style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }}
                          />
                        </a>
                      )}
                      <div style={{ flex: 1 }}>
                        <div className="font-600 text-danger">{v.hanhViGianLan}</div>
                        <div className="text-sm mt-4">{v.chiTiet}</div>
                        <div className="text-xs text-muted mt-4">{new Date(v.thoiDiemPhatHien).toLocaleString('vi-VN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
