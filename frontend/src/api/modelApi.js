import { gatewayAxios } from './axiosInstance'

export const modelApi = {
  getModels:     (keyword = '') => gatewayAxios.get(`/api/models?keyword=${encodeURIComponent(keyword)}`),
  getModelById:  (id)           => gatewayAxios.get(`/api/models/${id}`),
  startTraining: (id)           => gatewayAxios.put(`/api/models/${id}/status`),
  cancelTraining:(id)           => gatewayAxios.put(`/api/models/${id}/cancel`),
  saveTrained:   (id, payload)  => gatewayAxios.put(`/api/models/${id}/save-trained`, payload),
  getAllStats:   ()             => gatewayAxios.get('/api/models/statistics'),
  getModelStats: (id)           => gatewayAxios.get(`/api/models/${id}/statistics`),
}
