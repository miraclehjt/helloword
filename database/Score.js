var mongoose = require('./db.js'),
    Schema=mongoose.Schema;
var ScoreSchema=new Schema({
    username:{type:String},
    baseScore:{type:Number},
    targetScore:{type:Number},
    sumScore:{type:Number},
    reason:{type:String},
    markMan:{type:String},
    markTime:{type:Date}
});
module.exports = mongoose.model('score',ScoreSchema);