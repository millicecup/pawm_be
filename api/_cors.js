export function allowCors(fn) {
  return async (req, res) => {
    // Set headers FIRST
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Return 204 for OPTIONS
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    return await fn(req, res);
  };
}