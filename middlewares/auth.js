import {User} from "../models/user.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async(req,res,next)=>{

    // console.log(req.headers.authorization)
    try {
        const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({
            message:"Login first",
        });


    }
    const decode = await jwt.verify(token,process.env.JWT_SECRET)
    req.user = await User.findById(decode._id);
    // console.log(req.headers)
    next();
    } catch (error) {
        next();
    }  
};