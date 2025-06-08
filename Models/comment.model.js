import mongoose from "mongoose";


const commentSchemea = new Schema({
    text:{
        type:String,
        require:true
    },
     author:{type:mongoose.Schema.Types.ObjectId ,ref:"User" ,required:true},
     post:{type:mongoose.Schema.Types.ObjectId ,ref:"Post" ,required:true}

})

export const Comment = mongoose.model("Comment" ,commentSchemea )