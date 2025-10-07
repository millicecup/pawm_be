export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Mock simulations data
    const simulations = [
      {
        id: 'pendulum',
        title: 'Simple Pendulum',
        description: 'Study pendulum motion and oscillations',
        difficulty: 'Easy',
        duration: '15 min',
        category: 'Mechanics',
        thumbnail: '/images/pendulum.jpg'
      },
      {
        id: 'projectile',
        title: 'Projectile Motion',
        description: 'Analyze trajectory of projectiles',
        difficulty: 'Medium',
        duration: '20 min',
        category: 'Mechanics',
        thumbnail: '/images/projectile.jpg'
      },
      {
        id: 'waves',
        title: 'Wave Physics',
        description: 'Explore wave properties and behavior',
        difficulty: 'Hard',
        duration: '25 min',
        category: 'Waves',
        thumbnail: '/images/waves.jpg'
      }
    ];

    res.json(simulations);
  } catch (error) {
    console.error('Simulations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}