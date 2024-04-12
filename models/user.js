import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({

    username:{
        type:String,
        require:[true,"Please enter name"],
        unique:[true,"Username is taken"],
    },
    avatar:{
        public_id:String,
        url: String,
    },
    email:{
        type:String,
        require:[true,"please enter email"],
        unique:[true,"Email already exist"],
    },
    password:{
        type:String,
        require:[true,"please enter password"],
        minlength: [6,"password must be atleast 6 characters. "],
        select:false,
    },
    gender:{
        type:String,
        default:'male',
    },
    mobile:{
        type:String,
        default:'',
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
        },
    ],
    followers:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
            },
    ],
    followings:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
    ],

    story:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Story",
        }
    ],

    resetPasswordToken : String,

    resetPasswordExpire : Date,

});
    
// userSchema.methods.getResetPasswordToken = function(){
   
//     const resetToken = crypto.randomBytes(20).toString("hex");
//     console.log(resetToken);

//     this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//     this.resetPasswordExpire = Date.now()+10*60*1000;

//     return resetToken;
// }

export const User = mongoose.model("User",userSchema);