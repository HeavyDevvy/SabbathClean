module.exports = function handler(req: any, res: any) {
  return res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
