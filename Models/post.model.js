import mongoose from "mongoose";


const postSchema = new Schema({
    caption:{type:String , default:''},
    image:{type:String , required:true},
    author:{type:mongoose.Schema.Types.ObjectId ,ref:"User" ,required:true},
    likes:[{type:mongoose.Schema.Types.ObjectId ,ref:"User" ,required:true}],
    comments:[{type:mongoose.Schema.Types.ObjectId ,ref:"comment"}]

})


export const POST = mongoose.model("Post" ,postSchema )