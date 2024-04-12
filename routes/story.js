import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { createStory, deleteStory, getStoriesOfFollowing, likeUnlikeStory } from "../controller/story.js";

const router = express.Router();

router.post("/story/upload",isAuthenticated,createStory);

router.get("/story/:id",isAuthenticated,likeUnlikeStory);

router.delete("/story/:id",isAuthenticated,deleteStory);

router.get("/stories",isAuthenticated,getStoriesOfFollowing);

export default router;

