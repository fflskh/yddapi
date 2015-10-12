/**
 * Created by liuhao on 8/18/15.
 * 1、当登陆时，生成token
 * 2、token自动老化
 * 3、当请求来到时，验证token
 */
var logger = require('../lib/logger').logger('apisys-auth');
var crypto = require('crypto');
var redis = require('redis');
var qs = require('querystring');
var http = require('http');

var config = require('../config/apiconf').redis;

/**
 * 校验
 * @param appid
 * @param appkey
 * @returns {boolean}
 */
var checkApp = function(appid, appkey){
    var apps = require('../config/apiconf').appauth;

    for(var i=0; i<apps.length; i++){
        if(apps[i].appid === appid && apps[i].appkey === appkey)
            return true;
    }

    return false;
};

var genAndSaveToken = function(appid, appkey, callback){
    //校验appid，appkey
    //校验不通过，直接返回
    if(!checkApp(appid, appkey)){
        return callback(new Error('invalid appid and appkey'));
    }

    //使用appid和appkey来产生token
    //Hash SHA1
    var hash = crypto.createHash('sha1');
    hash.update(appid).update(appkey).update(crypto.randomBytes(32));

    //用'0'替换调'+',防止访问url出现问题
    var token = hash.digest('base64').replace(/\+/g, '0').replace(/=/g, '');;

    var client = redis.createClient(config.port, config.host);
    client.auth(config.pass);

    //同时产生两对(token--appid, appid--token)，方便校验和获取
    //token--appid
    client.set(token, appid, function(err){
        if(err){
            console.error(err);
            return callback(new Error('save token failed'));
        }
        else {
            client.expire(token, config.expire);
            //callback(null, token);

            //appid--token
            client.set(appid, token, function(err){
                if(err){
                    console.error(err);
                    return callback(new Error('save token failed'));
                }
                else {
                    client.expire(appid, config.expire);
                    callback(null, token);
                }
            });
        }
    });
};

/**
 * 产生token
 */
var genToken = function(req, res, next){
    if(!req.body || !req.body.appid){
        return res.send({code:-1, desc:'need appid'});
    }

    if(!req.body || !req.body.appkey)
        return res.send({code:-1, desc:'need appkey'});

    //校验appid，appkey
    //校验不通过，直接返回
    if(!checkApp(req.body.appid, req.body.appkey)){
        return res.send({code:-1, desc:'invalid appid and appkey'})
    }

    genAndSaveToken(req.body.appid, req.body.appkey, function(err, token){
        if(err)
            return res.send({code:-1, desc:err.message});
        res.send({code:0, desc:'', data:token});
    });
};

/**
 * 校验token
 */
var checkToken = function(req, res, next){
    var token;
    if(req.method.toLowerCase() === 'get'){
        //console.log(req.query);
        token = req.query.access_token;
    } else if(req.method.toLowerCase() === 'post'){
        //console.log(req.body);
        token = req.body.access_token;
    }

    //不包含token直接返回
    if(!token){
        return res.send({code:-1, desc:'without access token, login first'});
    }

    var client = redis.createClient(config.port, config.host);
    client.auth(config.pass);

    client.get(token, function(err, value){
        //redis错误
        if(err){
            console.error(err);
            return res.send({code:-1, desc:'redis error'});
        }
        //验证不通过
        else if(!value){
            return res.send({code:-1, desc:'invalid access token, login first'});
        }
        //验证通过
        else {
            //var data = {};
            //data[token] = value;
            //console.log(data);
            console.log('----> ', 'token check success')
            next();
        }
    });
};

/**
 * 存储token
 * @param token
 */
var saveToken = function(token, value, cb){
    var client = redis.createClient(config.port, config.host);
    client.auth(config.pass);

    client.set(token, value, function(err, res){
       if(err){
           console.error(err);
           cb(err);
       }
       else{
           client.expire(token, config.expire);
           cb(null)
       }
    });
};

/**
 * 获取token
 * @param key
 * @param cb
 */
var getToken = function(req, res, cb){
    //校验appid，appkey
    //校验不通过，直接返回
    if(!checkApp(req.body.appid, req.body.appkey)){
        return res.send({code:-1, desc:'invalid appid and appkey'})
    }

    var client = redis.createClient(config.port, config.host);
    client.auth(config.pass);

    client.get(req.body.appid, function(err, value){
        if(err){
            console.error(err);
            cb(err, null);
        } else {
            var data = {};
            data[req.body.appid] = value;
            res.send({code:0, desc:'', data:value});
        }
    });
};
/*
var checkDevkeyInheader = function(req, res, next){
    if(!req.headers.devkey){
        return res.send({code:-1, desc:'devkey not exists,check device first!'})
    }

    var params = {
        cond:JSON.stringify({
            serialNo : req.headers.devkey
        })
    };

    console.log(qs.stringify(params));

    var options = {
        host: '123.56.100.237',
        port: 18088,
        path : '/api/device/getgenlist?'+qs.stringify(params),
        method : 'GET',
        headers : {
            "userkey" : 'userkey'
        }
    };

    var request = http.request(options, function(response){
        if(response.statusCode === 200){
            var data = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function(){
                var resObj = {};
                resObj = JSON.parse(data);
                console.log(resObj);
                if(resObj.status !== 0){
                    res.send({code:-1, desc:'check device failed'});
                    logger.info('check device failed , devid : '+req.params.id);
                }
                else if(!resObj.data || resObj.data.length === 0){
                    res.send({code:-1, desc:'invalid device id'});
                    logger.info('check device failed , devid : '+req.params.id);
                }
                else {
                    next();
                    //res.send({code:0, desc:'check device success', data: resObj.data[0].serialNo});
                    logger.info('check device success , devid : '+req.params.id);
                }

            });
        }
        else {
            res.send({code:response.statusCode, desc:''})
        }

    });

    request.end();
};
*/

exports.genToken = genToken;
exports.checkToken = checkToken;
exports.saveToken = saveToken;
exports.getToken = getToken;
exports.genAndSaveToken = genAndSaveToken;