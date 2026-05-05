import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { modelApi } from '../api/modelApi'

function StatusBadge({ status }) {
  if (status === 'HOAN_THANH') return <span className="badge badge-success">Hoàn thành</span>
  if (status === 'DANG_TRAIN')  return <span className="badge badge-warning">Đang huấn luyện</span>
  return <span className="badge">{status}</span>
}

export default function ModelListPage() {
  const navigate = useNavigate()
  const [models, setModels]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [keyword, setKeyword] = useState('')

  const load = useCallback(async (kw) => {
    setLoading(true); setError(null)
    try { setModels(await modelApi.getModels(kw)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load('') }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(keyword), 350)
    return () => clearTimeout(t)
  }, [keyword, load])

  const total    = models.length
  const done     = models.filter(m => m.trangThai === 'HOAN_THANH').length
  const training = models.filter(m => m.trangThai === 'DANG_TRAIN').length

  return (
    <>
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Quản lý Mô hình</h1>
          <p className="page-sub">Danh sách các mô hình phát hiện hành vi gian lận</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card"><span className="stat-icon"></span><div className="stat-label">Tổng mô hình</div><div className="stat-val">{total}</div></div>
        <div className="stat-card"><span className="stat-icon"></span><div className="stat-label">Hoàn thành</div><div className="stat-val">{done}</div></div>
        <div className="stat-card"><span className="stat-icon"></span><div className="stat-label">Đang huấn luyện</div><div className="stat-val">{training}</div></div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <span className="card-title">Danh sách Mô hình</span>
          <div className="search-wrap" style={{ width: 320 }}>
            <span className="s-icon"></span>
            <input
              placeholder="Tìm theo tên mô hình..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="tbl-wrap">
          {loading ? (
            <div className="loading-center"><div className="spinner" /> Đang tải...</div>
          ) : error ? (
            <div style={{ padding: 24, color: 'var(--danger)' }}>{error}</div>
          ) : models.length === 0 ? (
            <div className="empty"><p>Không tìm thấy mô hình phù hợp</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Tên mô hình</th><th>Accuracy</th>
                  <th>Precision</th><th>Recall</th><th>F1-Score</th>
                  <th>Trạng thái</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <tr key={m.id}>
                    <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                    <td><span className="font-600">{m.tenMoHinh}</span></td>
                    <td>{(m.accuracy  * 100).toFixed(1)}%</td>
                    <td>{(m.precision * 100).toFixed(1)}%</td>
                    <td>{(m.recall    * 100).toFixed(1)}%</td>
                    <td>{(m.f1Score   * 100).toFixed(1)}%</td>
                    <td><StatusBadge status={m.trangThai} /></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/models/${m.id}`)}>
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
