const Simulation = require('../models/Simulation');

// Get all simulations
const getAllSimulations = async (req, res) => {
  try {
    const simulations = await Simulation.find({ isActive: true });
    res.json({ simulations });
  } catch (error) {
    console.error('Get simulations error:', error);
    res.status(500).json({ message: 'Failed to get simulations' });
  }
};

// Get simulation by ID
const getSimulationById = async (req, res) => {
  try {
    const { simulationId } = req.params;
    const simulation = await Simulation.findOne({ 
      simulationId, 
      isActive: true 
    });

    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    res.json({ simulation });
  } catch (error) {
    console.error('Get simulation error:', error);
    res.status(500).json({ message: 'Failed to get simulation' });
  }
};

// Initialize default simulations (for setup)
const initializeSimulations = async (req, res) => {
  try {
    // Check if simulations already exist
    const existingSimulations = await Simulation.countDocuments();
    if (existingSimulations > 0) {
      return res.status(400).json({ 
        message: 'Simulations already initialized' 
      });
    }

    const defaultSimulations = [
      {
        simulationId: 'pendulum',
        name: 'Simple Pendulum',
        description: 'Investigate harmonic motion by adjusting pendulum length, mass, and initial angle. See how parameters affect the period and energy conservation.',
        category: 'Mechanics',
        difficulty: 'beginner',
        estimatedTime: 30,
        parameters: [
          {
            name: 'length',
            type: 'slider',
            min: 0.5,
            max: 5.0,
            default: 1.0,
            unit: 'm',
            description: 'Length of the pendulum string'
          },
          {
            name: 'mass',
            type: 'slider',
            min: 0.1,
            max: 2.0,
            default: 1.0,
            unit: 'kg',
            description: 'Mass of the pendulum bob'
          },
          {
            name: 'angle',
            type: 'slider',
            min: 5,
            max: 60,
            default: 15,
            unit: '°',
            description: 'Initial angle from vertical'
          }
        ],
        learningObjectives: [
          'Understand simple harmonic motion',
          'Analyze the relationship between period and length',
          'Observe energy conservation in oscillatory motion'
        ],
        prerequisites: [
          'Basic trigonometry',
          'Understanding of force and acceleration'
        ],
        materials: [
          {
            title: 'Pendulum Theory Guide',
            url: 'https://www.physicsclassroom.com/class/waves/lesson-0/pendulum-motion',
            type: 'article'
          },
          {
            title: 'Lab Worksheet',
            url: 'https://physics.info/pendulum/practice.shtml',
            type: 'worksheet'
          },
          {
            title: 'Formula Reference',
            url: 'https://spoonfeedme.com.au/api/courses/250/cheatsheet.pdf',
            type: 'reference'
          }
        ]
      },
      {
        simulationId: 'circuit',
        name: 'Electrical Circuit',
        description: 'Visualize current flow with a racing car analogy. Experiment with voltage and resistance to understand Ohm\'s law fundamentals.',
        category: 'Electricity',
        difficulty: 'intermediate',
        estimatedTime: 45,
        parameters: [
          {
            name: 'voltage',
            type: 'slider',
            min: 1,
            max: 12,
            default: 9,
            unit: 'V',
            description: 'Applied voltage'
          },
          {
            name: 'resistance',
            type: 'slider',
            min: 10,
            max: 1000,
            default: 100,
            unit: 'Ω',
            description: 'Circuit resistance'
          }
        ],
        learningObjectives: [
          'Understand Ohm\'s Law (V = IR)',
          'Visualize current flow in circuits',
          'Analyze the relationship between voltage, current, and resistance'
        ],
        prerequisites: [
          'Basic understanding of electricity',
          'Knowledge of electrical units'
        ],
        materials: [
          {
            title: 'Circuit Analysis Guide',
            url: 'https://www.physicsclassroom.com/class/circuits',
            type: 'article'
          },
          {
            title: 'Ohm\'s Law Practice',
            url: 'https://www.circuitbread.com/study-guides/dc-circuits/circuit-analysis-methods',
            type: 'worksheet'
          },
          {
            title: 'Component Reference',
            url: 'https://cdn.prod.website-files.com/6634a8f8dd9b2a63c9e6be83/669d61268590a11dfa545fee_369492.image0.jpeg',
            type: 'reference'
          }
        ]
      },
      {
        simulationId: 'cannonball',
        name: 'Cannonball Trajectory',
        description: 'Explore projectile motion by adjusting initial velocity, angle, and air resistance. Observe the trajectory and understand the factors affecting its flight.',
        category: 'Mechanics',
        difficulty: 'intermediate',
        estimatedTime: 40,
        parameters: [
          {
            name: 'velocity',
            type: 'slider',
            min: 10,
            max: 100,
            default: 50,
            unit: 'm/s',
            description: 'Initial velocity'
          },
          {
            name: 'angle',
            type: 'slider',
            min: 15,
            max: 75,
            default: 45,
            unit: '°',
            description: 'Launch angle'
          },
          {
            name: 'airResistance',
            type: 'slider',
            min: 0,
            max: 1,
            default: 0.1,
            unit: '',
            description: 'Air resistance coefficient'
          }
        ],
        learningObjectives: [
          'Understand projectile motion principles',
          'Analyze trajectory optimization',
          'Study the effects of air resistance'
        ],
        prerequisites: [
          'Vector mathematics',
          'Basic kinematics',
          'Understanding of gravity'
        ],
        materials: [
          {
            title: 'Projectile Motion Theory',
            url: 'https://www.physicsclassroom.com/class/vectors/lesson-2/what-is-a-projectile',
            type: 'article'
          },
          {
            title: 'Trajectory Calculator',
            url: 'https://www.omnicalculator.com/physics/trajectory-projectile-motion',
            type: 'worksheet'
          },
          {
            title: 'Air Resistance Effects',
            url: 'https://www.physicsclassroom.com/class/newtlaws/Lesson-3/Free-Fall-and-Air-Resistance',
            type: 'reference'
          }
        ]
      }
    ];

    await Simulation.insertMany(defaultSimulations);

    res.status(201).json({
      message: 'Simulations initialized successfully',
      count: defaultSimulations.length
    });
  } catch (error) {
    console.error('Initialize simulations error:', error);
    res.status(500).json({ message: 'Failed to initialize simulations' });
  }
};

module.exports = {
  getAllSimulations,
  getSimulationById,
  initializeSimulations
};