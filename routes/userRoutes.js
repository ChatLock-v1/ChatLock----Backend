// const express = require('express');
// const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword } = require('../controllers/user.controllers');
// const { protect } = require('../middleware/authorization');
import express from "express";
import { registerUser , loginUser ,logoutUser ,forgotPassword , resetPassword } from "../controllers/user.controllers.js";
import { protect } from "../middleware/authorization.js";

export const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', resetPassword);


