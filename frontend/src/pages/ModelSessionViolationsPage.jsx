import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { detectApi } from '../api/detectApi'
import { modelApi } from '../api/modelApi'

const ModelSessionViolationsPage = () => {
  const { modelId, caThiId } = useParams()
  const navigate = useNavigate()

  const [model, setModel] = useState(null)
  const [cameras, setCameras] = useState([])
  const [selectedCameraCaThiId, setSelectedCameraCaThiId] = useState(null)

  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingViolations, setLoadingViolations] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      modelApi.getModelById(modelId),
      detectApi.getCamerasByCaThi(caThiId)
    ])
      .then(([modelData, camerasData]) => {
        setModel(modelData)
        setCameras(camerasData)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [modelId, caThiId])

  useEffect(() => {
    if (selectedCameraCaThiId) {
      setLoadingViolations(true)
      detectApi.getViolationsByCameraAndModel(selectedCameraCaThiId, modelId)
        .then(res => {
          setViolations(res || [])
          setLoadingViolations(false)
        })
        .catch(err => {
          console.error(err)
          setLoadingViolations(false)
        })
    }
  }, [selectedCameraCaThiId, modelId])

  if (loading) return (
    <div className="p-80 text-center">
      <div className="spinner-border text-primary"></div>
      <div className="mt-16 text-muted">Đang tải danh sách camera...</div>
    </div>
  )

  return (
    <div className="p-32 bg-light min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-32 bg-white p-24 rounded-16 shadow-sm border-0">
        <div className="flex items-center gap-20">
          <button
            className="btn btn-outline-secondary rounded-circle p-0 flex items-center justify-center"
            style={{ width: '40px', height: '40px' }}
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <div>
            <h1 className="text-22 font-800 text-dark mb-4">Tra cứu Bằng chứng Vi phạm</h1>
            <div className="flex items-center gap-12 text-sm">
              <span className="text-muted">Mô hình: <strong className="text-primary">{model?.tenMoHinh}</strong></span>
              <span className="text-muted border-start ps-12">Ca thi: <strong className="text-dark">#{caThiId.substring(0, 8)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-24">
        {/* Sidebar Chọn Camera */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-16 bg-white overflow-hidden">
            <div className="card-header bg-white border-bottom p-20 font-700 text-dark">
              <i className="bi bi-camera-video me-8 text-primary"></i>
              Danh sách Camera ({cameras.length})
            </div>
            <div className="list-group list-group-flush p-8">
              {cameras.map(cam => (
                <button
                  key={cam.id}
                  className={`list-group-item list-group-item-action border-0 rounded-12 mb-4 py-12 px-16 flex items-center justify-between transition-all ${selectedCameraCaThiId === cam.id ? 'bg-primary text-white shadow-sm' : 'hover-bg-light'}`}
                  onClick={() => setSelectedCameraCaThiId(cam.id)}
                >
                  <div className="overflow-hidden">
                    <div className={`font-700 text-sm mb-2 ${selectedCameraCaThiId === cam.id ? 'text-white' : 'text-dark'}`}>
                      {cam.camera?.tenCamera}
                    </div>
                    <div className={`text-10 uppercase tracking-tighter ${selectedCameraCaThiId === cam.id ? 'text-white-50' : 'text-muted'}`}>
                      ID: {cam.id.substring(0, 12)}...
                    </div>
                  </div>
                  {selectedCameraCaThiId === cam.id && <i className="bi bi-check-circle-fill text-white"></i>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nội dung bằng chứng */}
        <div className="col-md-9">
          <div className="card border-0 shadow-sm rounded-16 bg-white min-h-600">
            {!selectedCameraCaThiId ? (
              <div className="card-body flex flex-col items-center justify-center p-80 opacity-60">
                <div className="bg-light p-24 rounded-circle mb-24">
                  <i className="bi bi-cursor text-48 text-muted"></i>
                </div>
                <h4 className="text-18 font-700 text-dark mb-12">Sẵn sàng tra cứu</h4>
                <p className="text-muted text-sm text-center max-w-300">Hãy chọn một Camera từ danh sách bên trái để xem các bằng chứng vi phạm mà mô hình đã phát hiện.</p>
              </div>
            ) : (
              <>
                <div className="card-header bg-white border-bottom p-20 flex justify-between items-center">
                  <div className="font-700 text-dark">
                    <span className="text-primary me-8">#</span>
                    Bằng chứng phát hiện
                  </div>
                  <span className="badge bg-danger-soft text-danger px-12 py-6 rounded-pill font-700 text-xs">
                    {violations.length} Vi phạm
                  </span>
                </div>
                <div className="card-body p-24 bg-light-soft">
                  {loadingViolations ? (
                    <div className="p-80 text-center">
                      <div className="spinner-border spinner-border-sm text-primary mb-12"></div>
                      <div className="text-muted text-sm">Đang tải danh sách vi phạm...</div>
                    </div>
                  ) : violations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
                      {violations.map((v, idx) => (
                        <div key={idx} className="card border-0 shadow-sm rounded-16 overflow-hidden bg-white hover-up transition-all">
                          <div className="relative group overflow-hidden">
                            <img
                              src={v.hinhAnhMinhChungUrl ? (v.hinhAnhMinhChungUrl.startsWith('http') ? v.hinhAnhMinhChungUrl : `http://localhost:8000${v.hinhAnhMinhChungUrl}`) : ''}
                              className="card-img-top transition-transform duration-500 group-hover:scale-110"
                              alt="Violation"
                              style={{ height: '200px', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Loi+anh' }}
                            />
                            <div className="absolute top-12 left-12">
                              <span className="badge bg-danger shadow-sm px-10 py-6 font-700 uppercase" style={{ fontSize: '10px' }}>
                                {v.hanhViGianLan}
                              </span>
                            </div>
                          </div>
                          <div className="card-body p-16">
                            <div className="flex justify-between items-center mb-12">
                              <span className="text-xs font-700 text-muted uppercase tracking-wider">Thời điểm</span>
                              <span className="text-sm font-800 text-primary">
                                {v.thoiDiemPhatHien ? new Date(v.thoiDiemPhatHien).toLocaleTimeString('vi-VN') : 'N/A'}
                              </span>
                            </div>
                            {v.chiTiet && (
                              <div className="text-xs text-muted border-top pt-12 mt-4 bg-light p-8 rounded-8">
                                <strong className="text-dark">Mô tả:</strong> {v.chiTiet}
                              </div>
                            )}
                            <div className="text-10 text-muted mt-12 text-right italic">
                              {v.thoiDiemPhatHien ? new Date(v.thoiDiemPhatHien).toLocaleDateString('vi-VN') : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-100 text-center opacity-40">
                      <i className="bi bi-shield-check text-64 text-success mb-16"></i>
                      <h5 className="text-dark font-700">Mọi thứ đều ổn</h5>
                      <p className="text-muted text-sm">Không tìm thấy bất kỳ hành vi gian lận nào từ góc máy này.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelSessionViolationsPage
