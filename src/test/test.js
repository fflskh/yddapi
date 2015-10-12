/**
 * Created by liuhao on 8/18/15.
 */

var logger = require('../lib/logger').logger('apisys-user');
var http = require('http');
var qs = require('querystring');

var post_add = function(){
    var params = {
        userId : 92,
        restname : 'rest_name_1',
        addr : {
            name : '北京',
            name_en : 'bj',
            level1_id : 1,
            level2_id : 35,
            level3_id : 36,
            top_id : 0,
            address : '门头沟镇某某地点',
            lat : 34.000291,
            lng : 108.892744
        },
        desc : 'rest_desc_1',
        contact : 'rest_contact_1',
        phone : 'rest_phone_1',
        email : 'rest_email_1',
        reg_time : 'rest_reg_time_1',
        allowdistance : 5,
        roadphone : '028888888',
        logo : 'rest_logo_1',
        'access_token' : 'OeDBOQ4A6mU2Rxu/x/mP4i8uj7M'
    };

    var options = {
        host: '127.0.0.1',
        port: 3000,
        path : '/api/rest/add',
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        }
    };

    var request = http.request(options, function(response){
        console.log('STATUS: ' + response.statusCode);
        var data = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            data += chunk;
        });

        response.on('end', function(){
            console.log(JSON.parse(data));
        });
    });
    request.write(JSON.stringify(params));
    request.end();
};

var post_modify = function(){
    var params = {
        restid : 2596,
        userId : 92,
        restname : 'rest_name_1',
        addr : {
            name : '北京',
            name_en : 'bj',
            level1_id : 1,
            level2_id : 35,
            level3_id : 36,
            top_id : 0,
            address : '门头沟镇某某地点',
            lat : 34.000291,
            lng : 108.892744
        },
        desc : 'rest_desc_1',
        contact : 'rest_contact_1',
        phone : 'rest_phone_1',
        email : 'rest_email_1',
        reg_time : 'rest_reg_time_1',
        allowdistance : 5,
        roadphone : '028888888',
        logo : 'rest_logo_1',
        'access_token' : 'OeDBOQ4A6mU2Rxu/x/mP4i8uj7M'
    };

    var options = {
        host: '127.0.0.1',
        port: 3000,
        path : '/api/rest/edit',
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        }
    };

    var request = http.request(options, function(response){
        console.log('STATUS: ' + response.statusCode);
        var data = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            data += chunk;
        });

        response.on('end', function(){
            console.log(JSON.parse(data));
        });
    });
    request.write(JSON.stringify(params));
    request.end();
};

get_token  = function(){
    var options = {
        host: '127.0.0.1',
        port: 3000,
        path : '/api/auth/token?appid=appid1&appkey=appkey1',
        method : 'GET'
    };
    var request = http.request(options, function(response){
        console.log('STATUS: ' + response.statusCode);
        var data = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            data += chunk;
        });

        response.on('end', function(){
            console.log(JSON.parse(data));
        });
    });
    request.end();
};



//get_token();
//post_add();
post_modify();