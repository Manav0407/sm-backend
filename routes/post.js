import express from "express";
import { commentOnPost, createPost, deleteComment, deletePost, getPostsOfFollowings, likeUnlikePost, updateCaption } from "../controller/post.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router =express.Router();

router.post("/post/upload",isAuthenticated,createPost);
router.get("/post/:id",isAuthenticated,likeUnlikePost);
router.put("/post/:id",isAuthenticated,updateCaption);
router.delete("/post/:id",isAuthenticated,deletePost);
router.get("/posts",isAuthenticated,getPostsOfFollowings);
router.put("/post/comment/:id",isAuthenticated,commentOnPost);
router.delete("/post/comment/:id",isAuthenticated,deleteComment);
export default router;