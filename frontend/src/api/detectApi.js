import { gatewayAxios } from './axiosInstance'

export const detectApi = {
  getCaThiList:      () => gatewayAxios.get('/api/detect/ca-thi'),
  getCamerasByCaThi: (caThiId) => gatewayAxios.get(`/api/detect/ca-thi/${caThiId}/cameras`),
  getViolations:     (cameraId) => gatewayAxios.get(`/api/detect/cameras/${cameraId}/violations`),
  updateCaThiStatus: (caThiId, status) => gatewayAxios.put(`/api/detect/ca-thi/${caThiId}/status`, { trangThai: status }),
}
