// @ts-ignore
module.exports = function handler(req: any, res: any) {
  res.status(200).json({ 
    message: 'API is working!',
    endpoint: '/api/test-simple',
    timestamp: new Date().toISOString()
  });
}
