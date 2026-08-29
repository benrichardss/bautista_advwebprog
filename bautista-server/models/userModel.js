const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    contactNumber:String,
    address:String,
    role:{
        type:String,
        enum:["buyer","seller","admin"],
        default:"buyer"
    },
    isActive:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true
});

module.exports = mongoose.model("User",userSchema);