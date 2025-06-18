import express from "express";
import { registerUser , loginUser , getProfile, logOut, followORUnfollow, editProfile, getSuggestedUser  } from "../controllers/user.controllers.js";
import { isAuth } from "../middleware/authorization.js";
import { upload } from "../middleware/multer.js";
// import isAuth from "../middleware/authorization.js"

export const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout',  logOut);
router.get('/:id/profile',isAuth , getProfile);
router.post('/edit-profile',isAuth ,upload.single('profilePicture') ,editProfile);

router.post('/suggestedUser',isAuth , getSuggestedUser);

router.post('/followorunfollow/:id',isAuth , followORUnfollow);
// router.get('/reset-password', resetPassword);


