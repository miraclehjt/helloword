var express = require('express');
var router = express.Router();
var UserModel = require('../database/User');
var ScoreModel = require('../database/Score');
var TargetModel=require('../database/Target');
/* GET home page. */
router.get('/', function(req, res, next) {
    var dang=0; var ren=0; var xing=0; var zheng=0;
    var shen=0; var jian=0; var gong=0; var fu=0;
    var departmentTargetNum=new Array();
    var legendName=[];
    var data=new Array();
    var type="bar";
    var series=[];
    var percent=new Array();
    TargetModel.find({},function(err,doc){
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else if(!doc){
            console.log("No Target!");
        }else{
            for(var i=0;i<doc.length;i++){
                data[i]=[1];
                if(doc[i].achieveValue>doc[i].acceptValue){
                    percent.push(Math.round(doc[i].acceptValue/doc[i].acceptValue*100));
                    data[i][0]=Math.round(doc[i].acceptValue/doc[i].acceptValue*100);
                }else{
                    data[i][0]=Math.round(doc[i].achieveValue/doc[i].acceptValue*100);
                    percent.push(Math.round(doc[i].achieveValue/doc[i].acceptValue*100));
                }
                legendName.push(doc[i].targetName);
                series.push({name:doc[i].targetName,type:type,percent:data[i]});
                if(doc[i].mainDepartment=="党的机关") dang++;
                if(doc[i].mainDepartment=="人大机关") ren++;
                if(doc[i].mainDepartment=="行政机关") xing++;
                if(doc[i].mainDepartment=="政协机关") zheng++;
                if(doc[i].mainDepartment=="审判机关") shen++;
                if(doc[i].mainDepartment=="检察机关") jian++;
                if(doc[i].mainDepartment=="共青团") gong++;
                if(doc[i].mainDepartment=="妇联") fu++;
            }
            res.render('door',{dang:dang,ren:ren,xing:xing,zheng:zheng,shen:shen,jian:jian,gong:gong,fu:fu,legendname:legendName,percent:percent,seriesname:series});
        }
    });
});
router.get('/', function(req, res, next) {
  if (req.session.username) {//检查用户是否已经登录，如果已登录展现的页面
    res.render('home', {username:req.session.username});
  } else {
    res.render('login', {title: '用户登录'});
  }
});

router.get('/home', function(req, res, next) {
  if (req.session.username) {//检查用户是否已经登录，如果已登录展现的页面
   /* console.log(req.session);//打印session的值*/
      UserModel.findOne({username:req.session.username},function (err,doc) {
          if(err){
              res.sendStatus(500);
              console.log(err);
          }else{
              res.render('home', {username:req.session.username,permission:doc.permission});
          }
      })

  } else {
    res.render('login', {title: '用户登录'});
  }
});
router.get('/register', function(req, res, next) {
  res.render('register',{title:'用户注册'});
});

router.post('/register', function (req, res) {
  username = req.body.username;
  password=req.body.password;
  console.log("------"+username+"----");
  console.log("------"+password+"----");
  UserModel.findOne({username: username}, function (error, doc) {
    if (error) {
      res.send(500);
      req.session.error = '网络异常错误！';
      console.log(error);
    } /*else if (doc) {
      res.send(500);
    } */
    else {
      UserModel.create({
        username: req.body.username,
        password: req.body.password
      }, function (error, doc) {
        if (error) {
          res.send(500);
          /*console.log(error);*/
        } else {
          /*req.session.error = '用户名创建成功！';*/
          res.send(200);
        }
      });
    }
  });
});

//加载登录页面
router.get('/login', function(req, res, next) {
  res.render('login',{title:'用户登录'});
});

//登录
router.post('/login', function(req, res, next){
  UserModel.findOne({username:req.body.username},function(err,doc){
    if(err){
      res.sendStatus(500);
      console.log(err);
    }else if(!doc){                                 //查询不到用户名匹配信息，则用户名不存在
      req.session.error = '用户名不存在';
      res.sendStatus(404);
    }else{
      if(req.body.password != doc.password){     //查询到匹配用户名的信息，但相应的password属性不匹配
        req.session.error = "密码错误";
        res.sendStatus(404);
      }else{
        req.session.username=doc.username;
        req.session.password=doc.password;
        res.sendStatus(200);
      }
    }
  });
});

//注销
router.get('/logout', function(req, res, next){
  req.session.destroy();
  res.redirect('/login');
});

router.get('/index', function(req, res, next) {
  res.render('index', { title: '欢迎您进入党政监督绩效管理系统！',username:req.session.username});
});

//加载添加用户页面
router.get('/adduserpage', function(req, res, next) {
  res.render('adduser');
});

//检查工号是否存在
router.post('/checkusername', function(req, res, next) {

  UserModel.findOne({username:req.body.username},function(err,doc){
    if(err){
      res.sendStatus(500);
      console.log(err);
    }
    else if(doc){
      res.sendStatus(404);
    }
    else{
      res.sendStatus(200);
    }
  });
});
//添加用户
router.post('/adduser', function (req,res,next) {

    UserModel.create(
      { username:req.body.username,
        password:req.body.password,
        name:req.body.name,
        sex:req.body.sex,
        born_date:req.body.born_date,
        nation:req.body.nation,
        political_status:req.body.political_status,
        place:req.body.place,
        id_card:req.body.id_card,
        department:req.body.department,
        permission:req.body.permission,
        tel:req.body.tel,
        position:req.body.position,
        scoreState:false
      },
      function(error,doc){
        if(error) {
          console.log(error);
        } else {
          res.sendStatus(200);
        }
      });
});
//加载用户列表页面
router.get('/userlistpage', function(req, res, next) {
  UserModel.find({},function (err,doc) {
      if(err){
          console.log(err);
      }else{
        res.render('userlist',{userlist:doc});
      }
  });
});

//发送修改用户信息请求
router.get('/modifyUserPage/:_id', function (req, res, next) {
  UserModel.findOne({_id:req.params._id},function(err,doc){
    if(err){
      res.sendStatus(500);
      console.log(err);
    }
    else if(!doc){
      res.sendStatus(404);
    }
    else{
      res.render('modifyUser', {user:doc});
    }
  });
});
//修改用户信息
router.post('/modifyUser',function (req,res,next) {
  console.log(req.body._id);
  var update={ username:req.body.username,
               password:req.body.password,
               name:req.body.name,
               sex:req.body.sex,
               born_date:req.body.born_date,
               nation:req.body.nation,
               political_status:req.body.political_status,
               place:req.body.place,
               id_card:req.body.id_card,
               department:req.body.department,
               permission:req.body.permission,
               tel:req.body.tel,
               position:req.body.position
               };
     UserModel.update({_id:req.body._id},update,function (err) {
    if(err) {
      res.sendStatus(500);
      console.log(err);
    }
    else {
      res.sendStatus(200);
      console.log('Update success!');
    }
  });
});
//删除用户
router.get('/deleteUser/:username',function (req,res,next) {

  UserModel.remove({username:req.params.username},function (err) {
    if(err){
      res.sendStatus(500);
      console.log(err);
    }
    else
    {
      console.log("remove user success!");
    }
  });
  UserModel.find({},function (err,doc) {
    if(err){
      console.log(err);
    }else{
      /*  console.log(doc);*/
      res.render('userlist',{userlist:doc});
    }
  });
});

//加载添加指标页面
router.get('/addtargetpage', function(req, res, next) {
  res.render('addtarget');
});

//添加指标
router.post('/addtarget', function(req, res, next) {
    if(req.body.relatedDepartment=="请 选 择 ！")
        req.body.relatedDepartment="";
    var achieveValue=0;
    var reallyTime="";
    var inputState=false;
    TargetModel.create(
        {   targetId:req.body.targetId,
            targetName:req.body.targetName,
            targetType:req.body.targetType,
            unit:req.body.unit,
            acceptValue:req.body.acceptValue,
            challengeValue:req.body.challengeValue,
            achieveValue:achieveValue,
            mainDepartment:req.body.mainDepartment,
            relatedDepartment:req.body.relatedDepartment,
            startTime:req.body.startTime,
            endTime:req.body.endTime,
            reallyTime:reallyTime,
            inputState:inputState
        },
        function(error,doc){
            if(error) {
                console.log(error);
            } else {
                res.sendStatus(200);
            }
        });
});
//检查指标号是否存在
router.post('/checktargetId', function(req, res, next) {
    TargetModel.findOne({targetId:req.body.targetId},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }
        else if(doc){
            res.sendStatus(404);
        }
        else{
            res.sendStatus(200);
        }
    });
});
//加载指标列表
router.get('/targetlistpage',function (req,res,next) {
    TargetModel.find({},function (err,doc) {
       if(err){
           res.sendStatus(500);
           console.log(err);
       }else{
           res.render('targetlist',{targetlist:doc});
       }
    });
});

//发送修改指标信息请求
router.get('/modifyTargetPage/:_id', function (req, res, next) {
    TargetModel.findOne({_id:req.params._id},function(err,doc){
        if(err){
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.sendStatus(404);
        }
        else{
            res.render('modifyTarget', {target:doc});
        }
    });
});
//修改指标信息
router.post('/modifyTarget',function (req,res,next) {

    var update={ targetId:req.body.targetId,
        targetName:req.body.targetName,
        targetType:req.body.targetType,
        unit:req.body.unit,
        acceptValue:req.body.acceptValue,
        challengeValue:req.body.challengeValue,
        mainDepartment:req.body.mainDepartment,
        relatedDepartment:req.body.relatedDepartment,
        startTime:req.body.startTime,
        endTime:req.body.endTime
    };
    TargetModel.update({_id:req.body._id},update,function (err) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            res.sendStatus(200);
            console.log('Update target success!');
        }
    });
});

//删除指标
router.get('/deleteTarget/:_id',function (req,res,next) {

    TargetModel.remove({_id:req.params._id},function (err) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }
        else
        {
            console.log("remove target success!");
        }
    });
    TargetModel.find({},function (err,doc) {
        if(err){
            console.log(err);
        }else{
            res.render('targetlist',{targetlist:doc});
        }
    });
});
//加载未录入指标数据列表
router.get('/targetDataListpage',function (req,res,next) {
    TargetModel.find({inputState:false},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.render('targetEnterList',{targetlist:doc});
        }
    });
});

//加载已录入指标数据列表
router.get('/alreadyEnter',function (req,res,next) {
    TargetModel.find({inputState:true},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.render('targetAlreadyEnterList',{targetlist:doc});
        }
    });
});

//发送录入指标数据请求
router.get('/targetDatapage/:_id',function (req,res,next) {
    TargetModel.findOne({_id:req.params._id},function(err,doc){
        if(err){
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.sendStatus(404);
        }
        else{
            res.render('inputTargetData', {target:doc});
        }
    });
});

//录入指标数据
router.post('/inputTargetData',function (req,res,next) {
    var state=true;
    var update={
        achieveValue:req.body.achieveValue,
        reallyTime:req.body.reallyTime,
        inputState:state
    };
    TargetModel.update({_id:req.body._id},update,function (err) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            res.sendStatus(200);
            console.log('input targetData success!');
        }
    });
});

//发送修改指标数据请求
router.get('/modifytargetDatapage/:_id',function (req,res,next) {
    TargetModel.findOne({_id:req.params._id},function(err,doc){
        if(err){
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.sendStatus(404);
        }
        else{
            res.render('modifyTargetData', {target:doc});
        }
    });
});

//修改指标数据
router.post('/modifyTargetData',function (req,res,next) {
    var state=true;
    var update={
        achieveValue:req.body.achieveValue,
        reallyTime:req.body.reallyTime,
        inputState:state
    };
    TargetModel.update({_id:req.body._id},update,function (err) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            res.sendStatus(200);
            console.log('modify targetData success!');
        }
    });
});

//显示已录入数据的指标列表
router.get('/showDataListpage',function (req,res,next) {
    TargetModel.find({inputState:true},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.render('targetDateList',{targetlist:doc});
        }
    });
});

//发送指标完成详情
router.get('/targetDetialpage/:_id',function (req,res,next) {
    TargetModel.findOne({_id:req.params._id},function(err,doc){
        if(err){
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.sendStatus(404);
        }
        else{
            res.render('TargetDetial', {target:doc});
        }
    });
});

//加载未录入用户评分列表页面
router.get('/scoreListpage',function (req,res,next) {
    UserModel.find({scoreState:false},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
                res.render('NoInputScore',{userlist:doc});
        }
    });
});
//加载已录入用户评分列表页面
router.get('/YesInputScore',function (req,res,next) {
    UserModel.find({scoreState:true},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.render('YesInputScore',{overlist:doc});
        }
    });
});
//加载录入用户评分页面
router.get('/enterScorepage/:username',function (req,res,next) {
    res.render('scorePage',{username:req.params.username});
});

//录入用户评分
router.post('/enterScore',function (req,res,next) {

    UserModel.update({username:req.body.username},{scoreState:true},function (err) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            console.log('成功更改用户评分状态为true!');
        }
    });
    ScoreModel.create(
        {   username:req.body.username,
            baseScore:req.body.baseScore,
            targetScore:req.body.targetScore,
            sumScore:req.body.sumScore,
            reason:req.body.reason,
            markMan:req.session.username,
            markTime:new Date()
        },
        function(error,doc){
            if(error) {
                console.log(error);
            } else {
                console.log('成功创建用户评分信息');
                res.sendStatus(200);
            }
        });
});
//变更用户评分状态
router.get('/changeScoreState/:username',function (req,res,next) {
    console.log(req.params.username);
    UserModel.update({username:req.params.username},{scoreState:false},function (err) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            console.log('成功更改用户评分状态为false!');
        }
    });
    UserModel.find({scoreState:true},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.render('YesInputScore',{overlist:doc});
        }
    });
});

//展示评分记录
router.get('/showScoreListpage',function (req,res,next) {
    ScoreModel.find({},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.render('scoreDataList',{scorelist:doc});
        }
    })
});

//加载修改用户评分页面
router.get('/modifyScorePage/:_id',function (req,res,next) {
    console.log(req.params._id);
    ScoreModel.findOne({_id:req.params._id},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.render('modifyscorePage',{score:doc});
        }
    });
});

//修改用户评分
router.post('/modifyScore',function (req,res,next) {
    var update={
        baseScore:req.body.baseScore,
        targetScore:req.body.targetScore,
        sumScore:req.body.sumScore,
        reason:req.body.reason,
        markMan:req.session.username,
        markTime:new Date()
    };
    ScoreModel.update({_id:req.body._id},update,function (err) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            res.sendStatus(200);
            console.log('成功修改用户分数!');
        }
    });
});



//绩效展示
router.get('/showTargetEcharts',function (req,res,next) {
    var dang=0; var ren=0; var xing=0; var zheng=0;
    var shen=0; var jian=0; var gong=0; var fu=0;
    var departmentTargetNum=new Array();
    var legendName=[];
    var data=new Array();
    var type="bar";
    var series=[];
    var percent=new Array();
    TargetModel.find({},function(err,doc){
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else if(!doc){
            console.log("No Target!");
        }else{
            for(var i=0;i<doc.length;i++){
                   data[i]=[1];
                if(doc[i].achieveValue>doc[i].acceptValue){
                    percent.push(Math.round(doc[i].acceptValue/doc[i].acceptValue*100));
                    data[i][0]=Math.round(doc[i].acceptValue/doc[i].acceptValue*100);
                }else{
                    data[i][0]=Math.round(doc[i].achieveValue/doc[i].acceptValue*100);
                    percent.push(Math.round(doc[i].achieveValue/doc[i].acceptValue*100));
                }
                legendName.push(doc[i].targetName);
                series.push({name:doc[i].targetName,type:type,percent:data[i]});
                if(doc[i].mainDepartment=="党的机关") dang++;
                if(doc[i].mainDepartment=="人大机关") ren++;
                if(doc[i].mainDepartment=="行政机关") xing++;
                if(doc[i].mainDepartment=="政协机关") zheng++;
                if(doc[i].mainDepartment=="审判机关") shen++;
                if(doc[i].mainDepartment=="检察机关") jian++;
                if(doc[i].mainDepartment=="共青团") gong++;
                if(doc[i].mainDepartment=="妇联") fu++;
            }
            res.render('TargetEcharts',{dang:dang,ren:ren,xing:xing,zheng:zheng,shen:shen,jian:jian,gong:gong,fu:fu,legendname:legendName,percent:percent,seriesname:series});
        }
    });
});

//评分展示
router.get('/showScoreEcharts',function (req,res,next) {
    res.render('ScoreEcharts',{failed:null,ecellence:null,passed:null,average:null,good:null,state:"none"});
});

router.post('/inquiryByDate',function (req,res,next) {
    console.log(req.body.starttime);
    console.log(req.body.endtime);
    var data=[];
    ScoreModel.find({markTime: {$gte: req.body.starttime, $lt: req.body.endtime}},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            var failed=0;var passed=0;var average=0;var good=0;var ecellence=0;
           console.log(doc);
            for(var i=0;i<doc.length;i++){
                if((doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)<60) failed++;
                if((doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)>=60&&(doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)<70) passed++;
                if((doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)>=70&&(doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)<80) average++;
                if((doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)>=80&&(doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)<90) good++;
                if((doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)>=90&&(doc[i].baseScore+doc[i].targetScore+doc[i].sumScore)<=100) ecellence++;
            }
           // data.push({value:failed,name:"不及格"});data.push({value:passed,name:"及格"});data.push({value:average,name:"中等"});data.push({value:good,name:"良好"});data.push({value:ecellence,name:"优秀"});
           // console.log(data);
           // console.log(JSON.stringify(data));
            res.render('ScoreEcharts',{failed:failed,ecellence:ecellence,passed:passed,average:average,good:good,state:"block"});
           // res.sendStatus(JSON.stringify(data));
        }
    });
})

//加载查询用户界面
router.get('/inquiryUser',function(req,res,next){
    UserModel.find({username:null},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            res.render('inquiryUser',{userlist:doc,state:"none"});
        }
    });
});

//按用户工号查询
router.post('/inquiryByUserId',function (req,res,next) {
    UserModel.find({username:req.body.username},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryUser',{userlist:doc,state:"none"});
        }
        else {
            res.render('inquiryUser',{userlist:doc,state:"block"});
        }
    });
});

//按用户姓名查询
router.post('/inquiryByName',function (req,res,next) {
    UserModel.find({name:req.body.name},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryUser',{userlist:doc,state:"none"});
        }
        else {
            res.render('inquiryUser',{userlist:doc,state:"block"});
        }
    });
});

//按用户所在部门查询
router.post('/inquiryByDepartment',function (req,res,next) {

    UserModel.find({department:req.body.department},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryUser',{userlist:doc,state:"none"});
        }
        else {
            res.render('inquiryUser',{userlist:doc,state:"block"});
        }
    });
});

//按用户身份证查询
router.post('/inquiryByIdCard',function (req,res,next) {
    console.log(req.body.name);
    UserModel.find({id_card:req.body.id_card},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryUser',{userlist:doc,state:"none"});
        }
        else {
            res.render('inquiryUser',{userlist:doc,state:"block"});
        }
    });
});

//加载查询指标界面
router.get('/inquiryTarget',function(req,res,next){
    TargetModel.find({targetId:null},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            res.render('inquiryTarget',{targetlist:doc,state:"none"});
        }
    });
});

//按指标号查询
router.post('/inquiryByTargetId',function (req,res,next) {
    TargetModel.find({targetId:req.body.targetId},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryTarget',{targetlist:doc,state:"none"});
        }
        else {
            res.render('inquiryTarget',{targetlist:doc,state:"block"});
        }
    });
});

//按指标名称查询
router.post('/inquiryByTargetName',function (req,res,next) {
    TargetModel.find({targetName:req.body.targetName},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryTarget',{targetlist:doc,state:"none"});
        }
        else {
            res.render('inquiryTarget',{targetlist:doc,state:"block"});
        }
    });
});

//按指标类型查询
router.post('/inquiryByTargetType',function (req,res,next) {
    TargetModel.find({targetType:req.body.targetType},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryTarget',{targetlist:doc,state:"none"});
        }
        else {
            res.render('inquiryTarget',{targetlist:doc,state:"block"});
        }
    });
});

//按指标主要负责部门查询
router.post('/inquiryByMainDepartment',function (req,res,next) {
    TargetModel.find({mainDepartment:req.body.mainDepartment},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryTarget',{targetlist:doc,state:"none"});
        }
        else {
            res.render('inquiryTarget',{targetlist:doc,state:"block"});
        }
    });
});

//加载评分查询界面
router.get('/inquiryScore',function(req,res,next){
    TargetModel.find({username:null},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            res.render('inquiryScore',{scorelist:doc,state:"none"});
        }
    });
});

//按职工id查询
router.post('/inquiryByUsername',function (req,res,next) {
    ScoreModel.find({username:req.body.username},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryScore',{scorelist:doc,state:"none"});
        }
        else {
            res.render('inquiryScore',{scorelist:doc,state:"block"});
        }
    });
});

//按评分人id查询
router.post('/inquiryByMarkMan',function (req,res,next) {
    ScoreModel.find({markMan:req.body.markMan},function (err,doc) {
        if(err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if(!doc){
            res.render('inquiryScore',{scorelist:doc,state:"none"});
        }
        else {
            res.render('inquiryScore',{scorelist:doc,state:"block"});
        }
    });
});

//加载指标完成进度查询界面
router.get('/inquirySchedule',function(req,res,next){
    TargetModel.find({inputState:true},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.render('inquirySchedule',{targetlist:doc,state:"none"});
        }
    });
});

//按指标id查询指标完成进度
router.post('/inquiryScheduleByID',function(req,res,next){
    TargetModel.find({inputState:true,targetId:req.body.ID},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else if(!doc){
            res.render('inquirySchedule',{targetlist:doc,state:"none"});
        }else{
            res.render('inquirySchedule',{targetlist:doc,state:"block"});
        }
    });
});

//按指标名称查询指标完成进度
router.post('/inquiryScheduleByTargetName',function(req,res,next){
    TargetModel.find({inputState:true,targetName:req.body.targetName},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else if(!doc){
            res.render('inquirySchedule',{targetlist:doc,state:"none"});
        }
        else{
            res.render('inquirySchedule',{targetlist:doc,state:"block"});
        }
    });
});

//按指标类型查询指标完成进度
router.post('/inquiryScheduleByTargetType',function(req,res,next){
    TargetModel.find({inputState:true,targetType:req.body.targetType},function (err,doc) {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else if(!doc){
            res.render('inquirySchedule',{targetlist:doc,state:"none"});
        }
        else{
            res.render('inquirySchedule',{targetlist:doc,state:"block"});
        }
    });
});

//加载字典界面
router.get('/dictionary',function(req,res,next){
    res.render('dictionary');
});

module.exports = router;
