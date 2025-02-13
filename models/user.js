const mongoose=require('mongoose');
const { Schema } =mongoose;

const UserSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    pic:{
        type:String,
        default:''
    },
   
    date:{
        type:String,
        default:Date.now
    }
})

module.exports= mongoose.model('User',UserSchema);