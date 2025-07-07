const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
const register = async (req, res, next) => {
  const { firstname, lastname, username, email, password } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(203).json({ message: 'Email is already registered' });
    } 

    if (await User.findOne({ username })) {
      return res.status(203).json({ message: 'Username is already registered' });
    }

    const user = new User({ firstname, lastname, username, email, password });
    await user.save();

    // Include role in the JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.SECRET_KEY, 
      { expiresIn: '1 day' }
    );
    res.json({ 
      id: user._id,
      token: token,
      message: 'Registration successful.'
    });
  } catch (error) {
    next(error);
  }
};

// Login with an existing user
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Include role in the JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role , userFirstName: user.firstname}, 
      process.env.SECRET_KEY, 
      { expiresIn: '1 day' }
    );
    res.json({ 
      id: user._id,
      token: token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
