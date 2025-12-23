export default defineEventHandler(async () => {
  // Simple health check endpoint for Docker healthcheck
  return {
    status: 'ok',
    timestamp: new Date().toISOString()
  }
})
