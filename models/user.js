const mongoose = require('mongoose'); 
// const bcrypt = require('bcrypt');
var cors = require('cors');
var Schema = mongoose.Schema; 
var passportLocalMongoose = require('passport-local-mongoose'); 
var foodschema = require('./foodschema');
  
var UserSchema = new Schema({    
    email: {type: String, unique:true, required:true}, 
    username : {type: String, unique: true, required:true}, 
    name : {type:String, required:true},
    phoneno : {type:String, required:true},
    foodexpense: [
       {type: mongoose.Schema.Types.ObjectId,ref:'foodschema'
        }
    ],
    entertainmentexpense:[{
        type:mongoose.Schema.Types.ObjectId,ref:'entertainmentschema'}
    ],
    householdexpense:[{
        type: mongoose.Schema.Types.ObjectId,ref:'householdschema'
    }],
    miscelleniousexpense:[{
        type:mongoose.Schema.Types.ObjectId,ref:'miscellaniouschema'}
    ],
    shoppingexpense:[{
        type:mongoose.Schema.Types.ObjectId,ref:'shoppingschema'}
    ],
    transportexpense:[{
        type:mongoose.Schema.Types.ObjectId,ref:'transportschema'}
    ],

}); 

UserSchema.plugin(passportLocalMongoose); 
// export userschema 
 module.exports = mongoose.model("user", UserSchema); 