import { allowCors } from '../../_cors';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try to import Prisma
    let prisma;
    try {
      const prismaModule = await import('../../../lib/prisma');
      prisma = prismaModule.prisma;
    } catch (err) {
      console.error('Prisma not available, using mock data:', err.message);
      // Return mock data if Prisma fails
      return res.status(200).json({
        totalSimulations: 0,
        completedSimulations: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        recentActivity: [],
        topScores: []
      });
    }

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

    // Total time spent
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
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
}

export default allowCors(handler);