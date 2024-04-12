import {Story} from "../models/story.js";
import {User} from "../models/user.js";

export const createStory = async(req,res)=>{
    try {
        const newStoryData ={
            image : {
                public_id:"req.body.public_id",
                url: req.body.image,
            },
            owner:req.user._id,

        }
        const newStory = await Story.create(newStoryData);

        const user = await User.findById(req.user._id);

        user.story.push(newStory._id);

        await user.save();

        res.status(201).json({
            success:true,
            story:newStory,
            message:"Story created successfully"
        });

    } catch (error) {
       res.status(500).json({
        success:false,
        message:error.message,
       }); 
    }
};

export const likeUnlikeStory = async(req,res)=>{
    try {

        const story = await Story.findById(req.params.id);

        if(!story)
        {
            return res.status(404).json({
                success:false,
                message:"story not found",
            });
        }

        if(story.likes.includes(req.user._id))
        {
            const index = story.likes.indexOf(req.user._id);
            story.likes.splice(index,1);
            await story.save();

            return res.status(200).json({
                success:true,
                message:"story unliked",
            });
        }
        else{
            story.likes.push(req.user._id);
            await story.save();

            return res.status(200).json({
                success:true,
                message:"story liked",
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const deleteStory = async(req,res)=>{
    try {
        const story = await Story.findById(req.params.id);

        if(!story)
        {
            return res.status(404).json({
                success:false,
                message:"story nott found",
            });
        }

        if(story.owner.toString() !== req.user._id.toString())
        {
            return res.status(401).json({
                success:false,
                message:"Unauthorized",
            });
        }

        await story.deleteOne();

        const user = await User.findById(req.user._id);

        const index = user.story.indexOf(req.params.id);
        user.story.splice(index,1);

        await user.save();

        res.status(200).json({
            success:true,
            message:"Story deleted",
        });

        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const getStoriesOfFollowing = async(req,res)=>{
    try {

        const user = await User.findById(req.user._id);
        // console.log(user);

        const story = await Story.find({
            owner:{
                $in : user.followings,
            },
            createdAt:{
                $lte : new Date(Date.now()+1*24*60*60*1000),
            }
        }).populate('owner');
        res.status(200).json({
            success:true,
            story:story.reverse(),
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

// export const getStory = async(req,res)=>{
//     try {
        
//         const user = await User.find({"stories.storyDate" : {"lte":new Date(Date.now()+1*24*60*60*1000)}});
//     } catch (error) {
//         res.status(500).json({
//             success:true,
//             message:error.message,
//         });
//     }
// }