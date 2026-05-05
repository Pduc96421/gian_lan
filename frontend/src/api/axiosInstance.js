import axios from 'axios'

// Tất cả REST API đi qua API Gateway port 8080
export const gatewayAxios = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
})

// Tự động extract result từ ApiResponse { code, message, result }
const extractResult = (response) => {
  const body = response.data
  if (body?.code !== undefined && body.code !== 200) {
    return Promise.reject(new Error(body.message || 'Lỗi từ server'))
  }
  return body?.result ?? body
}

const handleError = (error) => {
  const msg = error.response?.data?.message || error.message || 'Lỗi không xác định'
  return Promise.reject(new Error(msg))
}

gatewayAxios.interceptors.response.use(extractResult, handleError)
