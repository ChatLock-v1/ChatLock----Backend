
import { User } from '../Models/User.Model.js';
import {generateToken} from '../utils/generateToken.js';
import dotenv from "dotenv"
dotenv.config()




// const crypto = require('crypto');
import crypto from "crypto"
import bcrypt from 'bcryptjs';

// const bcrypt = require('bcryptjs');

export const registerUser = async (req, res) => {
  try {
    const { username, email, password  ,socketId} = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User already exists with this email or username.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      socketId: socketId || null,
    });

    // Respond with safe user info
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        loginCount: newUser.loginCount,
        loginDevices: newUser.loginDevices,
        friends: newUser.friends,
        groups: newUser.groups,
        socketId: newUser.socketId,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};






// login controller
export const loginUser = async (req, res) => {
  try {
    const { email, password, deviceInfo, socketId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user (with password included)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update login count and device tracking
    if (deviceInfo && !user.loginDevices.includes(deviceInfo)) {
      user.loginDevices.push(deviceInfo);
    }
    user.loginCount = user.loginDevices.length;
    if (socketId) {
      user.socketId = socketId;
    }

    await user.save();


    const token = generateToken(user._id);

    // Send safe user data back
    res.status(200).json({
       
      message: 'Login successful.',
       token,
      user: {
        id: user._id,
        username: user.username, 
        email: user.email,
        friends: user.friends,
        groups: user.groups,
        socketId: user.socketId,
        loginDevices: user.loginDevices,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};







export const logoutUser = async (req, res) => {
  try {
    // Optionally clear socketId or session info
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.socketId = null;
        await user.save();
      }
    }

    res.status(200).json({ message: 'User logged out successfully.' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Logout failed.' });
  }
};



export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const resetToken = user.generateResetToken();
    await user.save();

    // Here you'd send an email. For now, just return the token.
    res.status(200).json({
      message: 'Reset token generated.',
      resetToken, // send this via email in real app
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Error generating reset token.' });
  }
};




export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'Error resetting password.' });
  }
};
