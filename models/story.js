import mongoose from "mongoose";

const storySchema = new mongoose.Schema({

    image: {
        public_id : String,
        url : String,
    },

    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User", 
    },

    createdAt:{
        type:Date,
        default: Date.now,
    },

    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User", 
        }, 
    ],

    comments:[
        {
            user:{
                type : mongoose.Schema.Types.ObjectId,
                ref : "User", 
            },
            comment:{
                type:String,
                require:true,
            },
        },
    ],
});

storySchema.index({createdAt:Date.now()},{expireAfterSeconds:86400});

export const Story = mongoose.model("Story",storySchema);