var mongoose = require('./db.js'),
    Schema = mongoose.Schema;
var TargetSchema=new Schema({
    targetId:{type:String},
    targetName:{type:String},
    targetType:{type:String},
    unit:{type:String},
    acceptValue:{type:Number},
    challengeValue:{type:Number},
    achieveValue:{type:Number},
    mainDepartment:{type:String},
    relatedDepartment:{type:String},
    startTime:{type:String},
    endTime:{type:String},
    reallyTime:{type:String},
    inputState:{type:Boolean}//数据录入状态,true：已录入 false：未录入
});
module.exports = mongoose.model('target',TargetSchema);