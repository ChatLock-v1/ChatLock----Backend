import express from "express";
import { registerUser , loginUser ,logoutUser, getProfile  } from "../controllers/user.controllers.js";
import { isAuth } from "../middleware/authorization.js";
// import isAuth from "../middleware/authorization.js"

export const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.post('/logout', , logoutUser);
router.get('/profile',isAuth , getProfile);
// router.get('/reset-password', resetPassword);


