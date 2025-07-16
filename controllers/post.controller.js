import sharp from "sharp";
import cloudinary from "../middleware/cloudinary.js";
import { Post } from "../Models/post.model.js";
import { User } from "../Models/User.Model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;

        const image = req.file;

        const authorId = req.id;

        if (!image) return res.status(401).json({ message: "Image error during post" })

        //image upload

        const optimeImageBuffer = await sharp(image.buffer).resize({ width: 800, fit: 'inside' }).toFormat('jpeg', { quality: 90 }).toBuffer();

        // buffer to data uri
        const fileUri = `data:image/jpeg;base64 , ${optimeImageBuffer.toString('base64')}`


        const cloudnaryResponse = await cloudinary.uploader(fileUri)
        const post = await Post.create({
            caption,
            image: cloudnaryResponse.secure_url,
            author: authorId
        })

        const user = User.findById(authorId);
        if (user) {
            user.post.push(post._id)
            await user.save()
        }

        await post.populate({ path: 'author', select: '-password' })

        res.status(200).json({ post, success: true })
    } catch (error) {
        console.log(error);
    }
}



export const getAllPost = async (req, res) => {
    try {
         const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })

    } catch (error) {
        console.log(error);

    }

}

export const getuserPost = async (req, res) => {
    try {
        const post  = await Post.find({author:req.id});
    } catch (error) {
        console.log(error);

    }
}