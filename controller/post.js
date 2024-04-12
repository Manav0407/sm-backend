import {Post} from "../models/post.js";
import {User} from "../models/user.js";
import cloudinary from "cloudinary";
export const createPost = async(req,res)=>{
    try {

        // const myCloud = await cloudinary.v2.uploader.upload(req.body.image,{
        //     folder : "posts",
        // });
        
        const newPostData = {
            caption : req.body.caption,
            image:{
                public_id:"public_id",
                url : req.body.image,
            },
            owner:req.user._id,
        };

        const newPost = await Post.create(newPostData);

        const user = await User.findById(req.user._id);

        user.posts.unshift(newPost._id);

        await user.save();

        res.status(201).json({
            success:true,
            post:newPost,
            message:"post created",
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    };
};

export const likeUnlikePost = async(req,res)=>{
    try {

        const post = await Post.findById(req.params.id);

        if(!post)
        {
            return res.status(404).json({
                success:true,
                message:"Post not found",
            })
        }

        if(post.likes.includes(req.user._id))
        {
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index,1);
            await post.save();

            return res.status(200).json({
                success:true,
                message:"post Unliked",
            });
        
        }
        else{
            post.likes.push(req.user._id);
            await post.save();

            return res.status(200).json({
                success:true,
                message:"post liked",
            });

        }
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const deletePost = async(req,res)=>{
    try {
        
        const post = await Post.findById(req.params.id);

        if(!post)
        {
            return res.status(404).json({
                success:false,
                message:"post not found",
            });
        }
        
        if(post.owner.toString() !== req.user._id.toString())
        {
            return res.status(401).json({
                success:false,
                message:"Unauthorized",
            });
        }

        await post.deleteOne();

        const user = await User.findById(req.user._id);

        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index,1);
        await user.save();

        res.status(200).json({
            success:true,
            message:"Post deleted",
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const getPostsOfFollowings = async(req,res)=>{

    try {
        
        const user = await User.findById(req.user._id);

        const posts = await Post.find({
            owner:{
                $in:user.followings,
            },
        }).populate("owner likes comments.user");

        // console.log(posts);

        res.status(200).json({
            success:true,
            posts : posts.reverse(),
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

export const updateCaption = async(req,res)=>{
    try {

        const post = await Post.findById(req.params.id).populate("comments.user");

        if(!post)
        {
            return res.status(404).json({
                success:false,
                message:"post not found",
            });
        }

        if(post.owner.toString() !== req.user._id.toString())
        {
            return res.status(401).json({
                success:false,
                message:"Unauthorized",
            });
        }
        post.caption = req.body.caption;
        await post.save();

        res.status(200).json({
            success:true,
            message:"caption updated",
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const commentOnPost = async(req,res)=>{

    try {

        const post = await Post.findById(req.params.id);

        if(!post)
        {
            return res.status(404).json({
                success:false,
                message:"Post not found",
            });
        }

        let commentIndex=-1

        post.comments.forEach((item,index)=>{
            if(item.user.toString() === req.user._id.toString())
            {
                commentIndex=index;
            }
        });

        if(commentIndex !=-1)
        {
            post.comments[commentIndex].comment = req.body.comment;

            await post.save();

            return res.status(200).json({
                success:true,
                message:"comment updated",
            });
        }
        else{
            post.comments.push({
                user:req.user._id,
                comment:req.body.comment,
                
            });

            await post.save();

            res.status(200).json({
                success:true,
                message:"comment added",
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });

       
    }
};

export const deleteComment = async(req,res)=>{

    try {

        const post = await Post.findById(req.params.id);

        if(!post)
        {
            return res.status(404).json({
                success:false,
                message:"Post not found",
            });
        }

        //checking if owner wants to delete
        if(post.owner.toString() === req.user._id.toString())
        {
            if(req.body.commentId == undefined )
            {
                return res.status(400).json({
                    success:false,
                    message:"comment Id is required",
                });
            }

            post.comments.forEach((item,index)=>{
                if(item._id.toString() === req.body.commentId.toString())
                {
                   return post.comments.splice(index,1);
                }
            });

            await post.save();

            return res.status(200).json({
                success:true,
                message:"Selected comment has been deleted",
            });

        }
        else{

            post.comments.forEach((item,index)=>{
                if(item.user.toString() === req.user._id.toString())
                {
                   return post.comments.splice(index,1);
                }
            });

            await post.save();

            return res.status(200).json({
                success:true,
                message:"Your comment has been deleted",
            });

        }
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};

