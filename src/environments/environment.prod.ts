export const environment = {
  production: true,
  apiUrl: 'https://api.gym-tracker.com',
  api: {
    auth: '/api/v1/auth',
    exercises: '/exercises'
  },
  refreshTokenBuffer: 180000,
  maxImageSize: 2 * 1024 * 1024,
  allowedImageTypes: ['image/jpeg', 'image/png'],
}; 