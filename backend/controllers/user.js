
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Get user profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateUserProfile = async (req, res, next) => {
  try {
    const { firstname, lastname, username, email, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Input validation
    if (!firstname || !lastname || !username || !email) {
      return res.status(400).json({ 
        message: 'First name, last name, username, and email are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Find the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is taken by another user
    if (username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Check if email is taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
    }

    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Current password is required to change password' 
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: 'New password must be at least 6 characters long' 
        });
      }

      // Hash and update password
      user.password = newPassword;
    }

    // Update user fields
    user.firstname = firstname.trim();
    user.lastname = lastname.trim();
    user.username = username.trim();
    user.email = email.trim().toLowerCase();

    // Save updated user
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken` 
      });
    }
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};