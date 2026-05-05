import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { modelApi } from '../api/modelApi'

const ModelStatsPage = () => {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    modelApi.getAllStats()
      .then(res => {
        setStats(Array.isArray(res) ? res : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Lỗi lấy thống kê:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-20 text-center">Đang tải dữ liệu thống kê...</div>

  return (
    <div className="p-24">
      <div className="flex justify-between items-center mb-24">
        <h1 className="text-24 font-700">Thống kê mô hình</h1>
      </div>

      <div className="card">
        <div className="card-header font-600">Danh sách hiệu suất vận hành</div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên mô hình</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Số mẫu huấn luyện</th>
                  <th className="text-center">Số ca thi sử dụng</th>
                  <th className="text-center">Số vi phạm phát hiện</th>
                  <th className="text-center">Độ chính xác (Acc)</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {stats && stats.length > 0 ? stats.map(m => (
                  <tr key={m.id}>
                    <td className="font-600">{m.tenMoHinh}</td>
                    <td>
                      <span className={`badge badge-${m.trangThai === 'HOAN_THANH' ? 'success' : 'warning'}`}>
                        {m.trangThai}
                      </span>
                    </td>
                    <td className="text-center">{m.tongSoLuongMau || 0}</td>
                    <td className="text-center">{m.soCaThiSuDung || 0}</td>
                    <td className="text-center text-danger font-600">{m.soPhatHienViPham || 0}</td>
                    <td className="text-center">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="text-right">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => navigate(`/models/${m.id}/stats`)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center p-24 text-muted">Chưa có dữ liệu thống kê mô hình nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelStatsPage
