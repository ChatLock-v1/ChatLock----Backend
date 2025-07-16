import express from "express";
import { addNewPost } from "../controllers/post.controller.js";
import { isAuth } from "../middleware/authorization.js";
export const router = express.Router();

router.post("/post" ,isAuth ,addNewPost)