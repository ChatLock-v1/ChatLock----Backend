import mongoose from "mongoose";

const consersatationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    message:[{
           type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

export const Conversation = mongoose.model("Conversation", consersatationSchema)