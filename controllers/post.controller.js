import sharp from "sharp";
import cloudinary from "../middleware/cloudinary.js";
import {Post} from "../Models/post.model.js";

export const addNewPost = async (req, res) => {
    const { caption } = req.body;

    const image = req.file;

    const authorId = req.id;

    if (!image) return res.status(401).json({ message: "Image error during post" })

    //image upload

    const optimeImageBuffer = await sharp(image.buffer).resize({ width: 800, fit: 'inside' }).toFormat('jpeg', { quality: 90 })
        .toBuffer();


    // buffer to data uri

    const fileUri = `data:image/jpeg;base64 , ${optimeImageBuffer.toString('base64')}`


    const cloudnaryResponse = await cloudinary.uploader(fileUri)
    const post = await Post.create({
        caption,
        image:cloudnaryResponse.secure_url,
        author:authorId
    })



}