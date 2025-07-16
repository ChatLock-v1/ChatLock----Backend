import express from "express";
import { registerUser , loginUser , getProfile, logOut, followORUnfollow, editProfile, getSuggestedUser  } from "../controllers/user.controllers.js";
import { isAuth } from "../middleware/authorization.js";
import { upload } from "../middleware/multer.js";

export const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout',  logOut);
router.get('/profile' ,isAuth , getProfile);
router.post('/editprofile',isAuth ,upload.single('profilePic') ,editProfile);

router.get('/suggestedUser',isAuth , getSuggestedUser);

router.post('/followorunfollow/:id',isAuth , followORUnfollow);