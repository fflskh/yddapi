/**
 * Created by liuhao on 8/17/15.
 */

var logger = require('../lib/logger').logger('apisys-user');
var Q = require('q');
var needle = require('needle');
var unserialize = require('../lib/unserialize');
var querysting = require("querystring");
var url = require('url');
var AuthCode = require('../lib/authcode').authcode;

/**
 * just for test
 * @param req
 * @param res
 * @param next
 */
exports.find = function(req, res, next){
    console.log(req.path);

    if(!req.params.id)
        return res.send({code:-1, desc:'without user id'});

    res.send({code:0, desc:'find a user', data: req.params.id});
};


/**
 * 用户登陆
 * @param req
 * @param res
 * @param next
 */
var login = function(req, res, next){
    console.log(req.body);
    if(!req.body)
        return res.send({code: -1, desc:'incomplete parameters!'});

    if(!req.body.username)
        return res.send({code: -1, desc:'need username!'});

    if(!req.body.passwd)
        return res.send({code: -1, desc:'need password!'});

    var loginObj = {
        username: req.body.username,
        passwd : req.body.passwd
    };
    userProcess('login', loginObj)
        .then(function(userInfo){
            if(userInfo === 0){
                res.send({code:-1, desc:'login failed'});
            } else {
                res.send({code:0, desc:'login success', data:userInfo});
            }
    })
        .fail(function(err){
        res.send({code:-1, desc:err});
    });
};

/**
 * 用户注册
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
var regist = function(req, res, next){
    console.log(req.body);
    if(!req.body)
        return res.send({code: -1, desc:'incomplete parameters!'});

    if(!req.body.username)
        return res.send({code: -1, desc:'need username!'});

    if(!req.body.passwd)
        return res.send({code: -1, desc:'need password!'});

    if(!req.body.email)
        return res.send({code: -1, desc:'need email!'});

    var regObj = {
        username: req.body.username,
        passwd : req.body.passwd,
        email : req.body.email
    };
    userProcess('reg', regObj)
        .then(function(userInfo){
            if(userInfo > 0){
                res.send({code:0, desc:'reg success', data:userInfo});
            } else if(userInfo === -1){
                res.send({code:-1, desc:'invalid username'});
            } else if(userInfo === -2) {
                res.send({code: -2, desc: 'username already exists'});
            } else if(userInfo === -3) {
                res.send({code:-3, desc:'invalid email format'});
            } else if(userInfo === -4) {
                res.send({code:-4, desc:'email already registered'});
            }
        })
        .fail(function(err){
            res.send({code:-1, desc:err});
        });
};

var edit = function(req, res, next){
    if(!req.body)
        return res.send({code: -1, desc:'incomplete parameters!'});

    if(!req.body.username)
        return res.send({code: -1, desc:'need username!'});

    if(!req.body.oldpasswd)
        return res.send({code: -1, desc:'need old password!'});

    if(!req.body.newpasswd)
        return res.send({code: -1, desc:'need new password!'});

    var editObj = {
        username: req.body.username,
        oldpasswd : req.body.oldpasswd,
        newpasswd : req.body.newpasswd
    };
    if(req.body.email)
        editObj.email = req.body.email;

    userProcess('edit', editObj)
        .then(function(userInfo){
            if(userInfo > 0){
                res.send({code:0, desc:'edit success', data:userInfo});
            } else if(userInfo === -1){
                res.send({code:-1, desc:'old password is not correct'});
            } else if(userInfo === -2) {
                res.send({code: -2, desc: 'invalid email format'});
            } else if(userInfo === -3) {
                res.send({code:-3, desc:'email already be registered'});
            } else if(userInfo === -4) {
                res.send({code:-4, desc:'username not exists'});
            } else if(userInfo === -5){
                res.send({code:-5, desc:'unknown error'});
            }
        })
        .fail(function(err){
            res.send({code:-1, desc:err});
        });
};

var userProcess = function(action, userData){
    var deferred = Q.defer();

    var seckey = 'Ax9gfW3_DFGG',
        userapiurl = 'http://passport.jie.acwhy.com/';
    if(action !== 'reg' && action !== 'login' && action !== 'edit'){
        deferred.reject('invalid user action');
        return deferred.promise;
    }

    //赋值，只赋值有用数据
    var data = {};
    if(action === 'reg'){
        data.user_name = (userData.username) ? userData.username : '';
        data.user_password = (userData.passwd) ? userData.passwd : '';
        data.user_email = (userData.email) ? userData.email : '';
    }
    else if(action === 'login'){
        data.user_name = (userData.username) ? userData.username : '';
        data.user_password = (userData.passwd) ? userData.passwd : '';
    }
    else if(action === 'edit'){
        data.user_name = (userData.username) ? userData.username : '';
        data.oldpw = (userData.oldpasswd) ? userData.oldpasswd : '';
        data.user_password = (userData.newpasswd) ? userData.newpasswd : '';
        data.user_email = (userData.email) ? userData.email : '';
    }

    //console.log('data : ', data);
    var args = querysting.stringify(data);
    var args2 = querysting.stringify({input: AuthCode(args, 'ENCODE', seckey)});
    //console.log('args2 : ', args2);
    var posturl = url.resolve('http://passport.jie.acwhy.com', action) + '?' + args2;
    //console.log('posturl:', posturl);

    var urs = url.parse(posturl);
    var postData = urs.query;

    var options = {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };
    needle.post(userapiurl + action, postData, options, function (err, resp) {
        if (!err && resp.statusCode == 200) {
            console.log('resp body:', unserialize(resp.body));
            deferred.resolve(unserialize(resp.body));
        }
        else {
            deferred.reject(err || resp.statusCode);
        }
    });

    return deferred.promise;
};

exports.login = login;
exports.regist = regist;
exports.edit = edit;