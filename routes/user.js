import express from "express";
import {
  ForgotPassword,
  Login,
  Logout,
  Register,
  deleteProfile,
  followUser,
  getAllUsers,
  getUser,
  myProfile,
  resetPassword,
  updatePassword,
  updatedProfile,
  getMyPosts,
  getUserPosts,
  getAllFollowings,
} from "../controller/user.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", Register);

router.post("/login", Login);

router.get("/logout", Logout);

router.get("/follow/:id", isAuthenticated, followUser);

router.put("/update/password", isAuthenticated, updatePassword);

router.put("/update/profile", isAuthenticated, updatedProfile);

router.delete("/delete/profile", isAuthenticated, deleteProfile);

router.get("/me", isAuthenticated, myProfile);

router.get("/user/:id", isAuthenticated, getUser);

router.get("/users", isAuthenticated, getAllUsers);

router.get("/my/posts", isAuthenticated, getMyPosts);

router.get("/my/followings", isAuthenticated, getAllFollowings);

router.get("/userposts/:id",isAuthenticated,getUserPosts);

router.post("/forgot/password", ForgotPassword);

router.put("/password/reset/:id", resetPassword);

export default router;
