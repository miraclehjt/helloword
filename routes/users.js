var express = require('express');
var router = express.Router();
var UserModel = require('../database/User');
var ScoreModel=require('../database/Score');
var TargetModel=require('../database/Target');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//个人信息
router.get('/personinformation', function(req, res, next) {
  UserModel.findOne({username:req.session.username},function (err,doc) {
    if(err){
      res.sendStatus(500);
      console.log(err);
    }
    else if(!doc){
      res.sendStatus(404);
    }
    else{
      res.render('personinformation', {personinfo:doc});
    }
  });
});

//加载修改个人信息页面
router.get('/changeinformation', function(req, res, next) {
  UserModel.findOne({username:req.session.username},function (err,doc) {
    if(err){
      res.sendStatus(500);
      console.log(err);
    }
    else if(!doc){
      res.sendStatus(404);
    }
    else{
      res.render('changeinformation', {information:doc});
    }
  });
});

//修改个人信息
router.post('/personchange', function(req, res, next) {
  var update={
    tel:req.body.tel,
    position:req.body.position
  }
  UserModel.update({username:req.body.username}, update, function(error){
    if(error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

//加载修改密码页面
router.get('/changepasswordpage', function(req, res, next) {
  res.render('changepassword',{username:req.session.username,password:req.session.password});
});

//修改密码
router.post('/changepassword', function(req, res, next) {

  UserModel.update({username:req.body.username}, {$set : { password: req.body.new_password }}, function(error){
    if(error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      req.session.password=req.body.new_password;
      console.log('密码修改成功！');
      res.sendStatus(200);
    }
  });
});

//加载个人评分页面
router.get('/personScorepage', function(req, res, next) {
    ScoreModel.find({username:req.session.username},function (err,doc) {
       if(err){
         console.log(err);
         res.sendStatus(500);
       }
      else {
         res.render('personScore',{scorelist:doc});
       }
    });

});

//加载相关指标页面
router.get('/personTargetpage', function(req, res, next) {
  UserModel.findOne({username:req.session.username},function (err,doc) {
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
    else {
      console.log(doc.department);
      TargetModel.find({mainDepartment:doc.department},function (err,docs) {
        if(err){
          console.log(err);
          res.sendStatus(500);
        }else {
          res.render('personTarget',{targetlist:docs});
        }
      });
    }
  });

});

module.exports = router;
