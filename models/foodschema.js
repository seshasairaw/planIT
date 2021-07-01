var moongoose = require('mongoose'),
    Schema = moongoose.Schema;
    const User = require("./user");
var foodschema = new Schema({
 cost : {type:Number,required:true},
 date:{type:String,required:true},
 description : {type:String},
 user: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "User"
  }
})

module.exports = moongoose.model('foodschema',foodschema);