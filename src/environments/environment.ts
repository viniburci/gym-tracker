export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  api: {
    auth: '/api/v1/auth',
    exercises: '/exercises'
  },
  refreshTokenBuffer: 180000, // 3 minutes
  maxImageSize: 2 * 1024 * 1024, // 2MB in bytes
  allowedImageTypes: ['image/jpeg', 'image/png'],
}; 