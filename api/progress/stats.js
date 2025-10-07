export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mock data for now - replace with actual logic later
    const stats = {
      totalSimulations: 15,
      completedSimulations: 12,
      averageScore: 87.5,
      totalTimeSpent: 340, // in minutes
      recentActivity: [
        { date: '2025-10-07', simulations: 3, score: 92 },
        { date: '2025-10-06', simulations: 2, score: 85 },
        { date: '2025-10-05', simulations: 4, score: 90 }
      ],
      topScores: [
        { simulation: 'Pendulum', score: 95, date: '2025-10-07' },
        { simulation: 'Projectile Motion', score: 90, date: '2025-10-06' },
        { simulation: 'Wave Physics', score: 88, date: '2025-10-05' }
      ]
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Progress stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}