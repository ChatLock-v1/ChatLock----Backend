
import { User } from '../Models/User.Model.js';
import { generateToken } from '../utils/generateToken.js';
import { generateResetToken } from '../utils/generateResetToken.js';
import dotenv from "dotenv"

dotenv.config()

import crypto from "crypto"
import bcrypt from 'bcryptjs';


export const registerUser = async (req, res) => {
  try {
    const { username, email, password, socketId } = req.body;

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
    await User.create({
      username,
      email,
      password: hashedPassword,
      socketId
    });

    // Respond with safe user info
    res.status(201).json({
      message: 'User registered successfully.',

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

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update device info if not already stored
    if (deviceInfo && !user.loginDevices.includes(deviceInfo)) {
      user.loginDevices.push(deviceInfo);
    }

    user.loginCount = user.loginDevices.length;

    // Store current socketId if provided
    if (socketId && socketId !== user.socketId) {
      user.socketId = socketId;
    }

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        following: user.following,
        follower: user.follower,
        bio: user.bio,
        post:user.post,
        bookmark:user.bookmark,
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







export const logoutUser = async (serverUrl, token, socket, navigate) => {
  try {
    // Call backend logout endpoint with token auth header
    await axios.post(
      `${serverUrl}/logout`,
      {}, // no body needed here
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Clear token from localStorage
    localStorage.removeItem('chatlock_token');

    // Clear socketId on client side if you want to disconnect socket
    if (socket) {
      socket.emit('logout');  // optional, if you want to notify server socket logout event
      socket.disconnect();
    }

    // Redirect to login page
    navigate('/login');

  } catch (error) {
    console.error('Logout failed:', error.response?.data || error.message);
    // You may still want to clear local data on failure depending on UX decision
    localStorage.removeItem('chatlock_token');
    if (socket) socket.disconnect();
    navigate('/login');
  }
};




export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const resetToken = generateResetToken(user._id);

    const resetLink = `http://:localhost:3000/user/reset-password/${resetToken}`
    console.log(resetLink);


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
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);

    const user = await User.findById(decoded.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('JWT Reset Password Error:', err);
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};
