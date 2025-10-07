const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://fisika-simulator.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, testPassword } = req.body;
    
    console.log('=== PASSWORD TEST ===');
    console.log('Testing password for:', email);
    console.log('Test password:', JSON.stringify(testPassword));
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found, testing password...');
    console.log('Stored hash:', user.password);
    
    // Test with original password
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password test result:', isValid);
    
    // Also test hashing the same password again
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log('New hash for same password:', newHash);
    
    const newComparison = await bcrypt.compare(testPassword, newHash);
    console.log('New hash comparison:', newComparison);
    
    res.json({
      message: 'Password test completed',
      originalComparison: isValid,
      newComparison: newComparison,
      storedHash: user.password.substring(0, 20) + '...'
    });
  } catch (error) {
    console.error('Password test error:', error);
    res.status(500).json({ message: 'Test failed' });
  }
}