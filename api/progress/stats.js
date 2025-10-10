import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  // CORS headers - use specific origin in production
  const allowedOrigins = [
    'http://localhost:3002',
    'http://localhost:3001',
    'https://fisika-simulator.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Total simulations
    const totalSimulations = await prisma.simulation.count();

    // Completed simulations
    const completedSimulations = await prisma.simulation.count({
      where: { status: 'COMPLETED' }
    });

    // Average score
    const avgScoreResult = await prisma.simulation.aggregate({
      _avg: { score: true }
    });
    const averageScore = avgScoreResult._avg.score || 0;

    // Total time spent (assuming 'duration' field in minutes)
    const totalTimeResult = await prisma.simulation.aggregate({
      _sum: { duration: true }
    });
    const totalTimeSpent = totalTimeResult._sum.duration || 0;

    // Recent activity (last 3 days)
    const recentActivity = await prisma.simulation.groupBy({
      by: ['date'],
      _count: { _all: true },
      _avg: { score: true },
      orderBy: { date: 'desc' },
      take: 3
    });

    // Top scores (top 3)
    const topScores = await prisma.simulation.findMany({
      orderBy: { score: 'desc' },
      take: 3,
      select: { simulation: true, score: true, date: true }
    });

    const stats = {
      totalSimulations,
      completedSimulations,
      averageScore,
      totalTimeSpent,
      recentActivity: recentActivity.map(item => ({
        date: item.date,
        simulations: item._count._all,
        score: item._avg.score
      })),
      topScores
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Progress stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}