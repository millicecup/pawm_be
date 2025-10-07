const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ 
        message: 'Validation error', 
        details: errorMessage 
      });
    }
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const progressSchema = Joi.object({
  simulationId: Joi.string().valid('pendulum', 'circuit', 'cannonball').required(),
  simulationName: Joi.string().required(),
  timeSpent: Joi.number().min(0).default(0),
  parameters: Joi.object().default({}),
  results: Joi.object().default({}),
  score: Joi.number().min(0).max(100).default(0)
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  email: Joi.string().email(),
  role: Joi.string().valid('student', 'teacher', 'admin')
}).min(1);

module.exports = {
  validateRequest,
  registerSchema,
  loginSchema,
  progressSchema,
  updateUserSchema
};