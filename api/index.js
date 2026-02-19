// Vercel API wrapper: import compiled app and forward requests
const mod = require('../dist/main');
const handler = mod.default || mod;

module.exports = async (req, res) => {
  try {
    return await handler(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    res.status(500).send('Internal Server Error');
  }
};
