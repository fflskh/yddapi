#!/usr/bin/env node
/**
 * Created by liuhao on 8/17/15.
 */

var http = require('http');
var domain = require('domain');
var Q = require('q');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require("redis");

var routeHandle = require('./routes/routers');
var logger = require('./lib/logger').logger('apisys');
var serverDm = domain.create();
var auth = require('./models/auths');

var app = express();

//全局变量
global.glbVar = {};
var config = require('./config/apiconf');

var readyExpress = function(app){
    var dm = domain.create();
    dm.on('error', function(err){
        delete error.domain;
        logger.error("process service: ", error);
    });

    dm.run(function(){
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());

        //for test!!!!
        app.use(function(req, res, next){
            console.log('>>>>> path : ', req.path);
            if(req.method.toLowerCase() === 'get'){
                console.log('req.query : ', req.query);
            } else {
                console.log('req.body : ', req.body);
            }
            next();
        });

        //token校验
        app.use(function(req, res, next){
            //跳过
            var reg1 = /\api\/auth\/token/;
            var reg2 = /\api\/dev\/check/;
            if(reg1.test(req.path) || reg2.test(req.path)){
                next();
            } else {
                auth.checkToken(req, res, next);
            }
        });

        //路由处理
        app.use('/api', routeHandle);

        //404处理
        app.use(function(req, res, next) {
            res.send({code:-1, desc:'url not found'});
        });
    });
};

//准备redis,用于token相关操作
var readyRedis = function(){
    var deferred = Q.defer();
    var client = redis.createClient(config.redis.port, config.redis.host);
    client.auth(config.redis.pass, function(err){
        if(err)
            deferred.reject('connect redis error!');
        else
            deferred.resolve(client);
    });

    return deferred.promise;
};
/*

var refreshToken = function(){
    var dm = domain.create();
    dm.on('error', function(error){
        delete error.domain;
        logger.error("refresh Token ERROR：", error);
    });
    dm.run(function(){
        for(var i=0; i<config.appauth.length; i++){
            auth.genAndSaveToken(config.appauth[i].appid, config.appauth[i].appkey, function(err, token){
                if(err)
                    logger.error(err);
            });
        }
        setInterval(function(){
            for(var i=0; i<config.appauth.length; i++){
                auth.genAndSaveToken(config.appauth[i].appid, config.appauth[i].appkey, function(err, token){
                    if(err)
                        logger.error(err);
                });
            }
        }, config.redis.expire*1000);
    });
};
*/

var refreshToken = function(){
    Q.all(config.appauth.map(function(app){
        var deferred = Q.defer();
        auth.genAndSaveToken(app.appid, app.appkey, function(err, token){
            if(err)
                deferred.reject(err);
            else
                deferred.resolve(token);
        });
        return deferred.promise;
    })).then(function(tokens){
        //console.log(tokens);
        setTimeout(refreshToken, config.redis.expire*1000);
    }).fail(function(err){
        console.error(err);
        setTimeout(refreshToken, 2500);
    });

/*    for(var i=0; i<config.appauth.length; i++){
        auth.genAndSaveToken(config.appauth[i].appid, config.appauth[i].appkey, function(err, token){
            if(err){
                logger.error(err);
                setTimeout(refreshToken, 2500);
            }
            setTimeout(refreshToken, config.redis.expire*10);
        });
    }*/
};

serverDm.on('error', function (error) {
    delete error.domain;
    logger.error("API SYSTEM ERROR：", error);
});

serverDm.run(function () {
    readyExpress(app);
    //每10分钟更新一次token，放入redis中
    refreshToken();
    var server = http.createServer(app).listen(config.listenport, function(){
        console.log('listening on port ' + config.listenport)
    });
});


