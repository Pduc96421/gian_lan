import { gatewayAxios } from './axiosInstance'

export const datasetApi = {
  searchSamples: (tenHanhVi = '') => gatewayAxios.get(`/api/dataset/samples?tenHanhVi=${encodeURIComponent(tenHanhVi)}`),
  getSampleById: (id)             => gatewayAxios.get(`/api/dataset/samples/${id}`),
}
