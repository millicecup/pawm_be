// api/_cors.js
export function allowCors(fn) {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://fisika-simulator.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return fn(req, res);
  };
}
