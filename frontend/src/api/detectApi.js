import { gatewayAxios } from './axiosInstance'

export const detectApi = {
  getCaThiList: () => gatewayAxios.get('/api/detect/ca-thi'),
  getCamerasByCaThi: (caThiId) => gatewayAxios.get(`/api/detect/ca-thi/${caThiId}/cameras`),
  getViolations: (cameraId) => gatewayAxios.get(`/api/detect/cameras/${cameraId}/violations`),
  updateCaThiStatus: (caThiId, status) => gatewayAxios.put(`/api/detect/ca-thi/${caThiId}/status`, { trangThai: status }),
  getCaThiByModel: (modelId) => gatewayAxios.get(`/api/detect/ca-thi/by-model/${modelId}`),
  getOperationalStats: (modelId) => gatewayAxios.get(`/api/detect/operational-stats/${modelId}`),
  getViolationsByCameraAndModel: (cameraCaThiId, modelId) => gatewayAxios.get(`/api/detect/camera-ca-thi/${cameraCaThiId}/violations?modelId=${modelId}`),
}
