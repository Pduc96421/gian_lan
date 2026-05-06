import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { modelApi } from "../api/modelApi";
import { detectApi } from "../api/detectApi";

const ModelStatsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modelStats, setModelStats] = useState(null);
  const [caThiList, setCaThiList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([modelApi.getModelStats(id), detectApi.getCaThiByModel(id)])
      .then(([resStats, resCaThi]) => {
        setModelStats(resStats);
        setCaThiList(Array.isArray(resCaThi) ? resCaThi : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy chi tiết:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="p-80 text-center">
        <div className="spinner-border text-primary"></div>
        <div className="mt-16 text-muted">
          Đang truy xuất dữ liệu vận hành...
        </div>
      </div>
    );

  if (!modelStats)
    return (
      <div className="p-80 text-center text-muted font-600">
        Không tìm thấy dữ liệu mô hình
      </div>
    );

  return (
    <div className="p-32 bg-light min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-32 bg-white p-24 rounded-16 shadow-sm">
        <div className="flex items-center gap-20">
          <button
            className="btn btn-outline-secondary rounded-circle p-0 flex items-center justify-center"
            style={{ width: "40px", height: "40px" }}
            onClick={() => navigate("/models/stats")}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <div>
            <h1 className="text-24 font-800 text-dark mb-4">
              {modelStats.tenMoHinh}
            </h1>
            <div className="flex items-center gap-12">
              <span className="badge bg-primary-soft text-primary px-12 py-6 rounded font-700 text-xs uppercase tracking-wider">
                Chi tiết vận hành
              </span>
              <span className="text-sm text-muted font-500">
                ID: {modelStats.id}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted font-600 uppercase mb-4 tracking-wider">
            Độ chính xác (Train)
          </div>
          <div className="text-28 font-800 text-success">
            {(modelStats.accuracy * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-32">
        <div className="card border-0 shadow-sm rounded-16 bg-white overflow-hidden">
          <div className="card-body p-24 flex items-center gap-20">
            <div className="bg-primary-soft p-16 rounded-16">
              <i className="bi bi-calendar-check text-24 text-primary"></i>
            </div>
            <div>
              <div className="text-sm text-muted font-600 mb-4 uppercase">
                Số ca thi áp dụng
              </div>
              <div className="text-24 font-800 text-dark">
                {modelStats.soCaThiSuDung || 0}
              </div>
            </div>
          </div>
        </div>
        <div className="card border-0 shadow-sm rounded-16 bg-white overflow-hidden">
          <div className="card-body p-24 flex items-center gap-20">
            <div className="bg-danger-soft p-16 rounded-16">
              <i className="bi bi-exclamation-triangle text-24 text-danger"></i>
            </div>
            <div>
              <div className="text-sm text-muted font-600 mb-4 uppercase">
                Vi phạm phát hiện
              </div>
              <div className="text-24 font-800 text-danger">
                {modelStats.soPhatHienViPham || 0}
              </div>
            </div>
          </div>
        </div>
        <div className="card border-0 shadow-sm rounded-16 bg-white overflow-hidden">
          <div className="card-body p-24 flex items-center gap-20">
            <div className="bg-success-soft p-16 rounded-16">
              <i className="bi bi-database text-24 text-success"></i>
            </div>
            <div>
              <div className="text-sm text-muted font-600 mb-4 uppercase">
                Tập mẫu huấn luyện
              </div>
              <div className="text-24 font-800 text-dark">
                {modelStats.tongSoLuongMau || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table Section */}
      <div className="card border-0 shadow-sm rounded-16 bg-white">
        <div className="card-header bg-white border-bottom p-24">
          <div className="flex justify-between items-center">
            <h2 className="text-18 font-700 text-dark mb-0">
              Lịch sử vận hành theo ca thi
            </h2>
            <div className="text-sm text-muted font-500">
              Hiển thị {caThiList.length} kết quả gần nhất
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-24 py-16 text-muted font-600 uppercase text-xs">
                    Mã ca thi
                  </th>
                  <th className="py-16 text-muted font-600 uppercase text-xs">
                    Môn thi & Phòng
                  </th>
                  <th className="py-16 text-muted font-600 uppercase text-xs">
                    Thời gian bắt đầu
                  </th>
                  <th className="py-16 text-muted font-600 uppercase text-xs">
                    Trạng thái
                  </th>
                  <th className="pe-24 py-16 text-right text-muted font-600 uppercase text-xs">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {caThiList && caThiList.length > 0 ? (
                  caThiList.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-24 py-20 font-700 text-dark">
                        #{c.id.substring(0, 8)}
                      </td>
                      <td>
                        <div className="font-600 text-dark">
                          {c.mon?.tenMon || "N/A"}
                        </div>
                        <div className="text-xs text-muted mt-2">
                          <i className="bi bi-geo-alt me-4"></i>
                          {c.phong?.tenPhong || "N/A"}
                        </div>
                      </td>
                      <td className="text-sm font-500">
                        {c.thoiGianBatDau
                          ? new Date(c.thoiGianBatDau).toLocaleString("vi-VN")
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            c.trangThai === "DA_KET_THUC"
                              ? "bg-success-soft text-success"
                              : c.trangThai === "DANG_THI"
                                ? "bg-warning-soft text-warning"
                                : "bg-primary-soft text-primary"
                          } px-10 py-6 rounded font-700 text-xs`}
                        >
                          {c.trangThai === "DANG_THI"
                            ? "Đang thi"
                            : c.trangThai === "DA_KET_THUC"
                              ? "Đã kết thúc"
                              : "Chưa bắt đầu"}
                        </span>
                      </td>
                      <td className="pe-24 text-right">
                        <button
                          className="btn btn-primary btn-sm rounded-8 px-16 py-8 font-600 shadow-sm"
                          onClick={() =>
                            navigate(
                              `/models/${id}/sessions/${c.id}/violations`,
                            )
                          }
                        >
                          Xem bằng chứng
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-48">
                      <div className="text-48 opacity-10 mb-16">📂</div>
                      <div className="text-muted font-500">
                        Mô hình này chưa từng được vận hành trong thực tế.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelStatsDetailPage;
