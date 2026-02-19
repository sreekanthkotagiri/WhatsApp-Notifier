// Vercel API wrapper: import compiled app and forward requests to Nest app
const mod = require('../dist/main');
const vercelHandler = mod.default;

module.exports = async (req, res) => {
  try {
    return await vercelHandler(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
};
