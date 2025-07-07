const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  // Accept both 'Authorization: Bearer <token>' and just 'Authorization: <token>'
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Remove 'Bearer ' if present
  if (token.startsWith('Bearer ')) token = token.slice(7);

  try {
    // This assumes your JWT payload is: { userId, role, ... }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Optionally: check the user actually exists in DB
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Attach only needed info, not whole user
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: user.email, // Optional, add more if needed
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
