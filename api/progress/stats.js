export default function handler(req, res) {
  // CRITICAL: Set headers before ANY other response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Must return 204 for OPTIONS (not 200)
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ test: 'working' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}