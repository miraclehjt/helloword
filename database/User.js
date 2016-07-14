var mongoose = require('./db.js'),
    Schema = mongoose.Schema;
var UserSchema = new Schema({
    username : { type:String },
    password: { type:String },
    name:{type:String},
    sex:{type:Boolean},
    born_date:{type:String},
    nation:{type:String},
    political_status:{type:String },
    place:{type:String },
    id_card:{type:String },
    department:{type:String },
    permission:{type:String},
    tel:{type:String},
    position:{type:String},
    scoreState:{type:Boolean}//数据录入状态,true：已录入 false：未录入
});
module.exports = mongoose.model('member',UserSchema);