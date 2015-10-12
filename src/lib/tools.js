/**
 * Created by liuhao on 8/18/15.
 */
var q = require('q');
var http=require('http');
var querystring=require('querystring');


var Post = function (data,options) {
    var defer = q.defer();
    var postData = querystring.stringify(data || {});

    if(!options || typeof(options)!=='object'){
        defer.reject('options is a object');
    }

    options.port=options.port || 80;
    options.method = 'POST';
    options.headers = options.headers || {'Content-Type': 'application/x-www-form-urlencoded'};
    options.headers[ 'Content-Length']=postData.length;
    options.headers["userkey"]  =  'userkey';

  /*  var options = {
        hostname: 'www.google.com',
        port: 80,
        path: '/upload',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };*/

    var req = http.request(options, function(res) {
        if(+res.statusCode === 200){
            var result='';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                result+=chunk;
            });
            res.on('end',function(){
                defer.resolve(result);
            });
        }else{
            defer.reject('req statuscode:' + res.statusCode);
        }
    });
    req.on('error', function(e) {
        defer.reject(e.message);
    });
    req.write(postData);
    req.end();
    return defer.promise;
}
/*
 @description 标准化返回数据结构
 @param {Object} error -错误信息
 @param {Object} data - 返回的数据对象
 @param {Object} pagination - 返回分页信息
 @param {Object} otherObj - 需要返回的额外信息
 @return {Object}
 */
function resJson(error, data, pagination, otherObj) {
    if (error) {
        console.log('resJosn error:', error);
    }
    var result = union({}, otherObj);
    result.ack = !error;
    result.error = error;
    result.timestamp = Date.now();
    result.data = data || null;
    result.pagination = pagination || null;
    return result;
}

//深度并集复制，用于数据对象复制、数据对象更新，若同时提供参数 a 对象和 b 对象，则将 b 对象所有属性（原始类型，忽略函数）复制给 a 对象（同名则覆盖），
//返回值为深度复制了 b 后的 a，注意 a 和 b 必须同类型;
//若只提供参数 a，则 union 函数返回 a 的克隆，与JSON.parse(JSON.stringify(a))相比，克隆效率略高。

function union(a, b) {
    var type = checkType(a);

    if (b === undefined) {
        b = a;
        a = type === 'object' ? {} : [];
    }
    if (type === checkType(b)) {
        if (type === 'object' || type === 'array') {
            each(b, function (x, i) {
                var type = checkType(x);
                if (type === 'object' || type === 'array') {
                    a[i] = type === checkType(a[i]) ? a[i] : (type === 'object' ? {} : []);
                    union(a[i], x);
                } else {
                    a[i] = type === 'function' ? null : x;
                }
            });
        } else {
            a = type === 'function' ? null : b;
        }
    }
    return a;
}

//判断结构体是否为{}
var nullOjb = function (a) {
    for (var k in a) {
        if (a.hasOwnProperty(k)) {
            return false;
        }
    }
    return true;
};

module.exports={
    nullObj:nullOjb,
    Post:Post,
    union:union
}
//exports.nullObj = nullOjb;
