const express = require('express');
const router = express.Router();
const { 
  getAllSimulations, 
  getSimulationById, 
  initializeSimulations 
} = require('../controllers/simulationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all simulations (public)
router.get('/', getAllSimulations);

// Get simulation by ID (public)
router.get('/:simulationId', getSimulationById);

// Initialize default simulations (admin only)
router.post('/initialize', authenticateToken, authorizeRoles('admin'), initializeSimulations);

module.exports = router;