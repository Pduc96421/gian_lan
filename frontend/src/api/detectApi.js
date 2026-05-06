import { gatewayAxios } from './axiosInstance'

export const detectApi = {
  getCaThiList:                  ()                          => gatewayAxios.get('/api/detect/ca-thi'),
  getCaThiByModel:               (modelId)                   => gatewayAxios.get(`/api/detect/ca-thi/by-model/${modelId}`),
  getCamerasByCaThi:             (caThiId)                   => gatewayAxios.get(`/api/detect/ca-thi/${caThiId}/cameras`),
  updateCaThiStatus:             (caThiId, status)           => gatewayAxios.put(`/api/detect/ca-thi/${caThiId}/status`, { trangThai: status }),
  getOperationalStats:           (modelId)                   => gatewayAxios.get(`/api/detect/operational-stats/${modelId}`),
  getViolations:                 (cameraId)                  => gatewayAxios.get(`/api/detect/cameras/${cameraId}/violations`),
  getViolationsByCameraAndModel: (cameraCaThiId, modelId)    => gatewayAxios.get(`/api/detect/camera-ca-thi/${cameraCaThiId}/violations?modelId=${modelId}`),
}
