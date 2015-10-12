/**
 * Created by liuhao on 8/18/15.
 */

var logger = require('../lib/logger').logger('apisys-dev');
var http = require('http');
var qs = require('querystring');
var Q = require('q');
var urlConf = require('../config/apiconf').apiURLs;

var bindDetail_devid = function(devid, callback){
    if(!devid){
        return callback(new Error('need devid'));
    }

    var params = {
        cond:JSON.stringify({
            deviceId : devid
        })
    };

    //!!!!!!不要忘了path后面的'?'
    var options = {
        host: urlConf.binddetail.host,
        port: urlConf.binddetail.port,
        path : urlConf.binddetail.path + '?' + qs.stringify(params),
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

            response.on('end', function() {
                var resObj = {};
                resObj = JSON.parse(data);

                if(resObj.status !== 0){
                    callback(new Error('get bind detail failed'), null);
                }
                else {
                    console.log(resObj);
                    if(Array.isArray(resObj.data)){
                        //如果是数组，且长度小于1，则表示未绑定
                        if(resObj.data.length < 1)
                            callback(null, null);
                        else
                            callback(null, resObj.data[0]);
                    }
                    //如果不是数组，则直接返回
                    else {
                        callback(null, resObj.data);
                    }
                }
            });
        }
    });

    request.end();
};

var checkdev = function(devid, callback){
    var deferred = Q.defer();
    var params = {
        cond:JSON.stringify({serialNo : devid})
    };

    var options = {
        host: urlConf.checkdev.host,
        port: urlConf.checkdev.port,
        path : urlConf.checkdev.path + '?'+ qs.stringify(params),
        method : 'GET',
        headers : {
            "userkey" : 'userkey'
        }
    };

    var request = http.request(options, function(response){
        if(response.statusCode === 200) {
            var data = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {
                var resObj = {};
                resObj = JSON.parse(data);

                if(resObj.status === 0 && resObj.data && resObj.data.length>0)
                    deferred.resolve(true);//callback(null, true);
                else{
                    var err = {
                        code : -2,
                        msg : devid + ' not exists'
                    };
                    deferred.reject(err);
                }
                    //deferred.reject(new Error('devid not exists'));//callback(new Error('devid not exists'), false);
            });
        }
        else {
            var err = {
                code : -2,
                msg : 'check device failed'
            };
            deferred.reject(err);
            //deferred.reject(new Error('check device failed'));//callback(new Error('check device failed'), false);
        }
    });
    request.end();
    return deferred.promise;
};

var checkrest = function(restid, callback){
    //callback(null, true);
    var deferred = Q.defer();
    deferred.resolve(true);
    return deferred.promise;
};

var bindDevRest = function(devid, restid, callback){
    var deferred = Q.defer();

    var params = {
        devID : devid,
        cusID : restid
    };

    var options = {
        host: urlConf.bindrest.host,
        port: urlConf.bindrest.port,
        path : urlConf.bindrest.path,
        method : 'POST',
        headers : {
            'Content-Type': 'application/json',
            'userkey' : 'userkey'
        }
    };

    var request = http.request(options, function(response){
        if(response.statusCode === 200){
            var data = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function() {
                var resObj = {};
                resObj = JSON.parse(data);
                console.log('bind resp : ',resObj);
                if(resObj.status !== 0){
                    //resObj.data指示错误信息
                    deferred.reject({code:-4, msg: 'bind device failed'});
                } else {
                    //callback(null);
                    deferred.resolve(0);
                }
            });
        }
        else {
            //callback(new Error('bind device failed'));
            deferred.reject({code:-4, msg: 'bind device failed'});
        }
    });

    request.write(JSON.stringify(params));
    request.end();

    return deferred.promise;
};

var unbindDevRest = function(devid, restid, callback){
    var deferred = Q.defer();
    var params = {
        devID : devid,
        cusID : restid
    };

    var options = {
        host: urlConf.unbindrest.host,
        port: urlConf.unbindrest.port,
        path : urlConf.unbindrest.path,
        method : 'POST',
        headers : {
            'Content-Type': 'application/json',
            'userkey' : 'userkey'
        }
    };

    var request = http.request(options, function(response){
        if(response.statusCode === 200){
            var data = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function() {
                var resObj = {};
                resObj = JSON.parse(data);
                console.log('unbind resp : ',resObj);
                if(resObj.status !== 0){
                    //resObj.data指示错误信息
                    deferred.reject({code:-4, msg: 'unbind device failed'});
                } else {
                    //callback(null);
                    deferred.resolve(0);
                }
            });
        }
        else {
            console.log('unbind resp status code : ', response.statusCode);
            deferred.reject({code:-4, msg: 'unbind device failed'});//callback(new Error('unbind device failed'));
        }
    });

    request.write(JSON.stringify(params));
    request.end();

    return deferred.promise;
};

/**
 * 验证设备编号是否存在。若存在，再验证设备是否绑定。若绑定，返回绑定餐厅id和绑定日期
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
var check = function(req, res, next){
    if(!req.params.id){
        return res.send({code:-1, desc:'needs device id'});
    }
    var params = {
        cond:JSON.stringify({
            serialNo : req.params.id
        })
    };

    var options = {
        host: urlConf.checkdev.host,
        port: urlConf.checkdev.port,
        path : urlConf.checkdev.path + '?'+ qs.stringify(params),
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

                //console.log("check response : ", resObj);

                if(resObj.status !== 0){
                    res.send({code:-1, desc:'check device failed'});
                    logger.info('check device failed , devid : '+req.params.id);
                }
                else if(!resObj.data || resObj.data.length === 0){
                    res.send({code:-1, desc:'invalid device id'});
                    logger.info('check device failed , devid : '+req.params.id);
                }
                else {
                    //设备编号存在，查询绑定餐厅id和绑定日期
                    bindDetail_devid(req.params.id, function(err, detail){
                        //出错
                        if(err){
                            logger.error(err);
                            res.send({code:0, desc:'check device success,get bind detail failed', data: {}});
                        }
                        //未绑定
                        else if(!detail){
                            res.send({code:0, desc:'check device success, device not bind', data: {}});
                        }
                        //绑定
                        else {
                            //返回UNIX时间戳
                            res.send({code:0,
                                      desc:'check device success',
                                      data: {restid:detail.customerId, bindDate: Math.round(new Date(detail.bindDate).getTime()/1000)}});
                        }
                        logger.info('check device success , devid : '+req.params.id);
                    });

                }

            });
        }
        else {
            res.send({code:response.statusCode, desc:''})
        }

    });

    request.end();
};

/**
 * 绑定餐厅和设备，通过如下步骤：
 * 1.绑定餐厅和设备，成功返回0；
 * 2.参数不完全，返回-1；
 * 3.验证设备编号，若设备编号不存在则返回-2；
 * 4.验证餐厅id，若不存在则返回-3；
 * 5.设备或餐厅已经被绑定，则返回-4；
 * 6.未知错误，则返回-5；
 * @param req
 * @param res
 * @param next
 */
var bind = function(req, res, next){
    if(!req.params || !req.params.devid)
        return res.send({code:-1, desc:'need devid'});

    if(!req.params || !req.params.restid)
        return res.send({code:-1, desc:'need restid'});

    checkdev(req.params.devid)
        .then(function(exists){
            //console.log('unbind checkdev ok............');
            return checkrest(req.params.restid);
        }).then(function(exists){
            //console.log('unbind checkrest ok............');
            return bindDevRest(req.params.devid, req.params.restid);
        }).then(function(data){
            //console.log('unbind bindDevRest ok............');
            res.send({code:0, desc:'unbind success'});
        }).fail(function(err){
            res.send({code:err.code, desc:err.msg});
        });
/*
    //验证设备id
    checkdev(req.params.devid, function(err, rt){
        if(err || !rt){
            return res.send({code:-2, desc:err.message});
        }
        //验证餐厅id
        checkrest(req.params.restid, function(err, rt){
            if(err || !rt){
                return res.send({code:-3, desc:err.message});
            }

            //绑定设备
            bindDevRest(req.params.devid, req.params.restid, function(err){
                if(err){
                    return res.send({code:-4, desc:err});
                }
                return res.send({code:0, desc:'bind success'});
            });
        });
    });*/
};

/**
 * 绑定餐厅和设备，通过如下步骤：
 * 1.绑定餐厅和设备，成功返回0；
 * 2.参数不完全，返回-1；
 * 3.验证设备编号，若设备编号不存在则返回-2；
 * 4.验证餐厅id，若不存在则返回-3；
 * 5.绑定设备和餐厅，绑定不成功则返回-4；
 * 6.未知错误，则返回-5；
 * @param req
 * @param res
 * @param next
 */
var unbind = function(req, res, next){
    var defered = Q.defer();

    if(!req.params || !req.params.devid)
        return res.send({code:-1, desc:'need devid'});

    if(!req.params || !req.params.restid)
        return res.send({code:-1, desc:'need restid'});

    checkdev(req.params.devid)
        .then(function(exists){
            //console.log('unbind checkdev ok............');
            return checkrest(req.params.restid);
        }).then(function(exists){
            //console.log('unbind checkrest ok............');
            return unbindDevRest(req.params.devid, req.params.restid);
        }).then(function(data){
            //console.log('unbind unbindDevRest ok............');
            res.send({code:0, desc:'unbind success'});
        }).fail(function(err){
            res.send({code:err.code, desc:err.msg});
        });

/*

    //验证设备id
    checkdev(req.params.devid, function(err, rt){
        console.log('11111111111');
        if(err || !rt){
            return res.send({code:-2, desc:err.message});
        }
        //验证餐厅id
        checkrest(req.params.restid, function(err, rt){
            console.log('2222222222222');
            if(err || !rt){
                return res.send({code:-3, desc:err.message});
            }

            //绑定设备
            unbindDevRest(req.params.devid, req.params.restid, function(err){
                console.log('3333333333333');
                if(err){
                    return res.send({code:-4, desc:err});
                }
                return res.send({code:0, desc:'unbind success'});
            });
        });
    });
 */
};

exports.check = check;
exports.bind = bind;
exports.unbind = unbind;