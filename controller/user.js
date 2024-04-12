import { User } from "../models/user.js";
import { Post } from "../models/post.js";
import bcrypt from "bcrypt";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { sendEmail } from "../middlewares/sendEmail.js";
import crypto, { checkPrime } from "crypto";
import nodemailer from "nodemailer";

export const Register = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    // console.log(username,email,password);

    let user = await User.findOne({ email });

    const name = await User.findOne({ username });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "user already exists",
      });
    } else if (name) {
      return res.status(400).json({
        success: false,
        message: "user already exist",
      });
    } else if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "password must be atleast 6 characters.",
      });
    }

    // const hashpsw = await argon2.hash(password);

    // console.log(req.body.avatar.url);
    user = await User.create({
      username,
      email,
      password,
      avatar: { public_id: "sample_id", url: req.body.avatar},
    });

    // const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.status(201)
    // localStorage.setItem("token",token)
      // .cookie("token", token, {
      //   httpOnly: true,
      //   maxAge: 90 * 24 * 60 * 60 * 1000,
      //   sameSite: "none",
      //   secure:true,
      // })
      .json({
        success: true,
        message: "Registered successfully",
        // token : token,
        user,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  // console.log("thay che");
};

// Login

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req)

    const user = await User.findOne({ email })
      .select("+password")
      .populate("posts followers followings story");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Register First",
      });
    }

    // const isMatch = await bcrypt.compare(user.password,password);
    const isMatch = user.password === password;
    // console.log(user.password,password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res
      .status(201)
      // .cookie("token", token, {
      //   httpOnly: true,
      //   maxAge: 90 * 24 * 60 * 60 * 1000,
      //   sameSite:process.env.NODE_ENV === "Development" ? "lax" : "none",
      //   secure:process.env.NODE_ENV === "Development" ? false : true,
      // })
    // localStorage.setItem("token",token)
      .json({
        success: true,
        message: "Logged-In successfully",
        token:token,
        user,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }

  // console.log(req.headers);
 
};

export const Logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()),
         httpOnly: true,
         sameSite:process.env.NODE_ENV === "Development" ? "lax" : "none",
         secure:process.env.NODE_ENV === "Development" ? false : true, 
        })
      .json({
        success: true,
        message: "Logged out",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (loggedInUser.followings.includes(userToFollow._id)) {
      const indexfollowing = loggedInUser.followings.indexOf(userToFollow._id);
      const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);

      loggedInUser.followings.splice(indexfollowing, 1);
      userToFollow.followers.splice(indexfollowers, 1);

      await userToFollow.save();
      await loggedInUser.save();

      res.status(200).json({
        success: true,
        message: "User unfollowed",
      });
    } else {
      loggedInUser.followings.push(userToFollow._id);
      userToFollow.followers.push(loggedInUser._id);

      await userToFollow.save();
      await loggedInUser.save();

      res.status(200).json({
        success: true,
        message: "started following",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    // console.log(user);

    // const data = req.body;
    const { oldpassword, newpassword } = req.body;

    console.log(oldpassword);
    console.log(newpassword);

    if (!oldpassword || !newpassword) {
      return res.status(400).json({
        success: false,
        message: "Enter old-password and new-password",
      });
    }

    const isMatch = user.password === oldpassword;

    // console.log(isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old Password",
      });
    }

    user.password = newpassword;
    user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatedProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { username, email, avatar } = req.body;

    if (username) {
      user.username = username;
    }
    if (email) {
      user.email = email;
    }

    if (avatar) {
      user.avatar = null;
      user.avatar = { public_id: "sample_id", url: req.body.avatar };
    }
    // User avatar baki...
    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile Updated succesfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = user.posts;
    const followers = user.followers;
    const followings = user.followings;

    const userId = user._id;

    await user.deleteOne();

    // Logout after deleting user

    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });

    // delete user from followers following

    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);

      const index = follower.followings.indexOf(userId);
      follower.followings.splice(index, 1);
      await follower.save();
    }

    // delete user from following's followers

    for (let i = 0; i < followings.length; i++) {
      const follows = await User.findById(followings[i]);

      const index = follows.followers.indexOf(userId);
      follows.followers.splice(index, 1);
      await follows.save();
    }

    // delete all posts of the user

    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.deleteOne();
    }

    //delete all comments of the user

    const postsArr = await Post.find();

    for (let i = 0; i < postsArr.length; i++) {
      const post = await Post.findById(postsArr[i]._id);

      for (let j = 0; j < post?.comments?.length; j++) {
        // console.log(post.comments[j].user.toString() == userId.toString());
        // console.log(post.comments[j].user.toString());
        // console.log(userId.toString())
        if (post.comments[j].user.toString() == userId.toString()) {
          post.comments.splice(j, 1);
          // console.log("thay che");
        }
      }
      await post.save();
    }

    //delete all likes of the user

    //  const likesArr = await Post.find();

    for (let i = 0; i < postsArr.length; i++) {
      const post = await Post.findById(postsArr[i]._id);

      for (let j = 0; j < post?.likes?.length; j++) {
        if (post?.likes[j].toString() === userId.toString()) {
          post.likes.splice(j, 1);
        }
      }

      await post.save();
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "posts followers followings story"
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "posts followers followings"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.query.username, $options: "i" },
    }).populate("story");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = [];

    for (let i = 0; i < user.posts.length; i++) {
      const post = await Post.findById(user.posts[i]).populate(
        "likes comments.user"
      );

      posts.push(post);
    }

    res.status(200).json({
      success: true,
      posts: posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllFollowings = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const followings = [];
  
      for (let i = 0; i < user?.followings?.length; i++) {
        const following = await User.findById(user.followings[i]).populate(
          "story"
        );
        followings.push(following);
      }
  
      res.status(200).json({
        success: true,
        followings: followings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getUserPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const posts = [];

    for (let i = 0; i < user.posts.length; i++) {
      const post = await Post.findById(user.posts[i]).populate(
        "likes comments.user"
      );

      posts.push(post);
    }

    res.status(200).json({
      success: true,
      posts: posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const ForgotPassword = (req, res) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "1415567140701e",
        pass: "879187f1d7f118",
      },
    });

    crypto.randomBytes(20, (err, buffer) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "token invalid",
        });
      }

      const token = buffer.toString("hex");
      User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "user not found",
          });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        user.save().then((result) => {
          transporter.sendMail({
            to: user.email,
            from: "manav@gmail.com",
            subject: "reset password",
            html: `
                        <h4>Reset password using this link: 
                            <a href="${req.protocol}://${req.get(
              "host"
            )}/password/reset/${token}">Link</a>
                        </h4>
                        `,
          });
          res.status(200).json({
            success: true,
            message: "Check your email",
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = req.params.id;
    // console.log(resetPasswordToken);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    // console.log(user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
