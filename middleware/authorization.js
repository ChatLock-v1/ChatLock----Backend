// const jwt = require('jsonwebtoken');
// const User = require('../models/User.js');

import jwt from "jsonwebtoken"
import { User } from "../Models/User.Model.js";
import dotenc from "dotenv";
dotenc.config()

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token failed or expired' });
  }
};


