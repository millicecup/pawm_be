// api/health.js
export default function handler(req, res) {
  return res.status(200).json({
    status: "ok",
    message: "Serverless backend running on Vercel yay!"
  });
}
