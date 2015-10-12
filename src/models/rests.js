/**
 * Created by liuhao on 8/20/15.
 */
var mysql = require('mysql');
var config = require('../config/apiconf');
var crypto = require('crypto');
var logger = require('../lib/logger').logger('apisys-rest');
var Q = require('q');
var tools = require('../lib/tools');
var urlConf = require('../config/apiconf').apiURLs;
var qs = require('querystring');
var http = require('http');

//餐厅信息分为两部分：1.前期餐厅数据(jie99_main.pf_area)；
//              2.后期为了同前期餐厅数据接口的额外增加的数据(jie99_rest.pf_area)
//前期数据jie99_main.pf_area
var restConn1 = mysql.createConnection({
    host     : config.restDetail.host,
    user     : config.restDetail.username,
    password : config.restDetail.passwd,
    database : config.restDetail.dbname
});

restConn1.connect();

//后期数据jie99_rest.pf_area
var restConn2 = mysql.createConnection({
    host     : config.restInfo.host,
    user     : config.restInfo.username,
    password : config.restInfo.passwd,
    database : config.restInfo.dbname
});

restConn2.connect();

//检查参数
var checkParams = function(params){
    console.log(params)
    if(!params)
        return {status: false, msg: 'parameter is null'};
    if(!params.userId)
        return {status: false, msg: 'userId is null'};
    if(!params.restname)
        return {status: false, msg: 'restname is null'};
    if(!params.addr)
        return {status: false, msg: 'addr is null'};
    //地址
    if(!params.addr.name)
        return {status: false, msg: 'addr.name is null'};
    //if(!params.addr.name_en)
    //    return {status: false, msg: 'addr.name_en is null'};
    if(!params.addr.city1)
        return {status: false, msg: 'addr.city1 is null'};
    if(!params.addr.city2)
        return {status: false, msg: 'addr.city2 is null'};
    if(!params.addr.city3)
        return {status: false, msg: 'addr.city3 is null'};
    /*if(params.addr.level1_id === undefined)
        return {status: false, msg: 'addr.city1 is null'};
    if(params.addr.level2_id === undefined)
        return {status: false, msg: 'addr.city2 is null'};
    if(params.addr.level3_id === undefined)
        return {status: false, msg: 'addr.city3 is null'};*/
    //if(params.addr.top_id === undefined)
    //    return {status: false, msg: 'addr.top_id is null'};
    if(!params.addr.address)
        return {status: false, msg: 'addr.address is null'};
    //纬度
    if(params.addr.lat === undefined)
        return {status: false, msg: 'addr.lat is null'};
    //精度
    if(params.addr.lng === undefined)
        return {status: false, msg: 'addr.lng is null'};
    //餐厅描述
    if(!params.desc)
        return {status: false, msg: 'desc is null'};
    //联系人
    //if(!params.contact)
    //    return {status: false, msg: 'contact is null'};
    //电话
    if(!params.phone)
        return {status: false, msg: 'contact is null'};
    if(!params.email)
        return {status: false, msg: 'email is null'};
    //注册时间
    //if(!params.reg_time)
    //    return {status: false, msg: 'reg_time is null'};
    //送餐距离
    //if(params.allowdistance === undefined)
    //    return {status: false, msg: 'allowdistance is null'};
    //if(!params.logo)
    //    return {status: false, msg: 'logo is null'};

    return {status: true};
};

var saveCompany = function(params, area_id, callback){
    var deferred = Q.defer();
    restConn1.query('SELECT id FROM pf_company WHERE company_name="'+params.restname+'"', function(err, rst){
        if(err)
            deferred.reject(err);
        //以name为索引查看company是否存在，若不存在则新增
        else if(rst.length === 0){
            var sql = 'INSERT INTO pf_company SET ?';
            var insertData = {
                area_id : area_id,
                cat_id : 29,
                title : params.restname,
                company_name : params.restname,
                introduction : params.desc,
                contact : params.contact,
                phone : params.phone,
                email : params.email,
                address : params.addr.address,
                site_domain : new Date().getFullYear()
                + (((new Date().getMonth()+1)>=10) ? (new Date().getMonth()+1) : ('0'+(new Date().getMonth()+1))).toString()
                +(((new Date().getDay())>10) ? new Date().getDay() : ('0'+new Date().getDay())).toString()
                + crypto.randomBytes(6).toString('hex'),
                reg_time : Math.round(new Date().getTime()/1000),
                city1_id : 0,//params.addr.level1_id,
                city2_id : 0,//params.addr.level2_id,
                city3_id : 0//params.addr.level3_id
            };

            var query = restConn1.query(sql, insertData, function(err, result){
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(result.insertId);
            });
            console.log(query.sql);
        } else{
            deferred.reject(new Error(params.restname + ' already exists!'));
            //deferred.resolve(rst[0].id);
        }
    });
    return deferred.promise;
};

var saveActiveCompany = function(params, restid, callback){
    var deferred = Q.defer();
    restConn1.query('SELECT id FROM pf_active_company WHERE company_id='+restid, function(err, result){
        if(err)
            deferred.reject(err);
        //查看是否存在，若不存在则新增
        else if(result.length === 0){
            var sql = 'INSERT INTO pf_active_company SET ?';
            var insertData = {
                company_id : restid,
                c_time : Math.round(new Date().getTime()/1000),
                e_time : Math.round(new Date().getTime()/1000) + 60*60*24*365
            };
            var query = restConn1.query(sql, insertData, function(err){
                if(err)
                    deferred.reject(err);
                deferred.resolve(null);
            });
            console.log(query.sql);
        } else{
            deferred.resolve(null);
        }
    });
    return deferred.promise;
};

var saveUserCompany = function(params, restid, callback){
    var deferred = Q.defer();
    restConn1.query('SELECT id FROM pf_user_company WHERE company_id='+restid, function(err, result){
        if(err)
            deferred.reject(err);
        //查看是否存在，若不存在则新增
        else if(result.length === 0){
            var sql = 'INSERT INTO pf_user_company SET ?';
            var insertData = {
                company_id : restid,
                user_id : params.userId
            };
            var query = restConn1.query(sql, insertData, function(err){
                if(err)
                    deferred.reject(err);
                deferred.resolve(null);
            });
            console.log(query.sql);
        } else{
            deferred.resolve(null);
        }
    });

    return deferred.promise;
};

var saveRest = function(params, restid, callback){
    var deferred = Q.defer();
    restConn2.query('SELECT id FROM pf_restaurant WHERE id='+restid, function(err, result){
        if(err)
            deferred.reject(err);
        //查看是否存在，若不存在则新增
        else if(result.length === 0){
            var sql = 'INSERT INTO pf_restaurant SET ?';
            var insertData = {
                id : restid,
                name : params.restname,
                description : params.desc,
                note : params.note ? params.note : '',
                roadphone : params.roadphone ? params.roadphone : '',
                logo : params.logo ? params.logo : ''
            };
            var query = restConn2.query(sql, insertData, function(err){
                if(err)
                    deferred.reject(err);
                deferred.resolve(null);
            });
            console.log(query.sql);
        } else{
            deferred.reject(new Error(params.restname + ' already exists!'));
        }
    });

    return deferred.promise;
};

var saveRestConf = function(params, restid, callback){
    var deferred = Q.defer();
    restConn2.query('SELECT restid FROM pf_restconf WHERE restid='+restid, function(err, result) {
        if (err)
            deferred.reject(err);
        //查看是否存在，若不存在则新增
        else if (result.length === 0) {
            var sql = 'INSERT INTO pf_restconf SET ?';
            var insertData = {
                restid : restid,
                uid : params.userId,
                poiid : 0,
                lat : params.addr.lat,
                lng : params.addr.lng,
                allowdistance : params.allowdistance ? params.allowdistance : 5,
                c_time : Math.round(new Date().getTime()/1000),
                e_time : Math.round(new Date().getTime()/1000) + 60*60*24*365
            };
            var query = restConn2.query(sql, insertData, function(err){
                if(err)
                    deferred.reject(err);
                deferred.resolve(null);
            });
            console.log(query.sql);
        } else{
            deferred.reject(new Error(params.restname + ' already exists!'));
        }
    });

    return deferred.promise;
};

var saveAddr = function(addr, restid, callback){
    var deferred = Q.defer();
    var sql = 'INSERT INTO pf_address SET ?';
    var insertData = {
        restid : restid,
        country : '中国',
        country_id : 0,
        city1 : addr.city1,
        city1_id : addr.city1_id,
        city2 : addr.city2,
        city2_id : addr.city2_id,
        city3 : addr.city3,
        city3_id : addr.city3_id,
        address : addr.address
    };
    var query = restConn2.query(sql, insertData, function(err){
        if(err)
            deferred.reject(err);
        deferred.resolve(null);
    });

    console.log(query.sql);
    return deferred.promise;
};

var getCityAndCityId = function(addr, callback){
    var deferred = Q.defer();
    var sql = 'SELECT id FROM pf_area WHERE id  '
        +  'IN (SELECT parent_id FROM pf_area WHERE LOCATE(area_name,"'+ addr.city2 +'")>0 and  id '
        + 'IN (SELECT parent_id FROM pf_area WHERE LOCATE(area_name,"'+ addr.city3 +'")>0))';

    var query = restConn1.query(sql, function(err, results){
        if(err){
            deferred.reject(err);
        }
        if(results.length === 0){
            //deferred.reject(new Error(addr.city1+addr.city2+addr.city3 + ' does not exist!'));
            deferred.resolve(results[0].id);
        }

        deferred.resolve(results[0].id);
    });
    console.log(query.sql);
    return deferred.promise;
};

var getLevel3Addr = function(addr, callback){
    var deferred = Q.defer();
    var sql = 'SELECT id FROM pf_area WHERE id = '
        +  '(SELECT parent_id FROM pf_area WHERE parent_id= '+ addr.level1_id +' and  id= '
        + '(SELECT parent_id FROM pf_area WHERE parent_id= '+ addr.level2_id +' and  id= '+ addr.level3_id +'))';

    var query = restConn1.query(sql, function(err, results){
        if(err){
            deferred.reject(err);
        }
        if(results.length === 0){
            deferred.reject(new Error(addr.level3_id + ' does not exist!'));
        }
        deferred.resolve(null);
    });
    console.log(query.sql);
    return deferred.promise;
};

var checkAndWriteAddr_pf_rest = function(addr, callback){
    var deferred = Q.defer();
    var sql = 'SELECT * FROM pf_area WHERE name= "' + addr.name
        + '" and en= "' + addr.name_en
        + '" and level1_id=' + addr.city1_id
        + ' and level2_id=' + addr.city2_id
        + ' and level3_id=' + addr.city3_id;

    var query = restConn2.query(sql, function(err, results){
        if(err)
            deferred.reject(err);
        if( results.length === 0){
            var sql = 'INSERT INTO pf_area SET ?';
            var insertData = {
                name : addr.name,
                en : addr.name_en,
                level1_id : addr.city1_id,
                level2_id : addr.city2_id,
                level3_id : addr.city3_id
                //top_id : addr.top_id
            };
            restConn2.query(sql, insertData, function(err, result){
                if(err){
                    deferred.reject(err);
                }
                deferred.resolve(null);
            });
        } else {
            deferred.resolve(null);
        }
    });
    console.log(query.sql);
    return deferred.promise;
};

/**
 * return：
 *  -1， 服务器错误
 *
 */
var add = function(req, res, next){
    var area_id, restid;
    //检查参数
    var checkRes = checkParams(req.body);
    if(!checkRes.status)
        return res.send({code:-1, desc:checkRes.msg});

    //检查地址，获取最后一级地址的id
    getCityAndCityId(req.body.addr)
        .then(function(areaid){
            area_id = areaid;
            return checkAndWriteAddr_pf_rest(req.body.addr);
        })
        .then(function(){
            return saveCompany(req.body, area_id);
        })
        .then(function(id){
            restid = id;
            return saveActiveCompany(req.body, restid);
        })
        .then(function(){
            return saveUserCompany(req.body, restid);
        })
        .then(function(){
            return saveRest(req.body, restid);
        })
        .then(function(){
            return saveAddr(req.body.addr, restid);
        })
        .then(function(){
            return saveRestConf(req.body, restid);
        }).then(function(){
            return res.send({code:0 , dest:'success', data:restid});
        })
        .fail(function(err){
            logger.error(err);
            return res.send({code:-1, desc:err.message});
        });
};

var edit = function(req, res, next){
    console.log('++++++++++',req.body);

    if(!req.body || !req.body.restid){
        return res.send({code:-1, desc:'need restid'});
    }

    var params = req.body;

    var sql1 = 'UPDATE pf_address SET ? where restid = ' + params.restid;
    var sql2 = 'UPDATE pf_restaurant SET ? where id=' + params.restid;
    var sql3 = 'UPDATE pf_restconf SET ? where restid=' + params.restid;
    var sql4 = 'UPDATE pf_company SET ? where id=' + params.restid;
    var data1 = {}, data2 = {}, data3 = {}, data4={};
    if(params.addr.city1_id){
        data1.city1_id = params.addr.city1_id;
        data4.city1_id = params.addr.city1_id;
    }
    if(params.addr.city1_name){
        data1.city1 = params.addr.city1_name;
    }
    if(params.addr.city2_id){
        data1.city2_id = params.addr.city2_id;
        data4.city2_id = params.addr.city2_id;
    }
    if(params.addr.city2_name){
        data1.city2 = params.addr.city2_name;
    }
    if(params.addr.city3_id){
        data1.city3_id = params.addr.city3_id;
        data4.city3_id = params.addr.city3_id;
    }
    if(params.addr.city3_name){
        data1.city3 = params.addr.city3_name;
    }
    if(params.addr.address){
        data1.address = params.addr.address;
        data4.address = params.addr.address;
    }
    if(params.addr.lat){
        data3.lat = params.addr.lat;
    }
    if(params.addr.lng){
        data3.lng = params.addr.lng;
    }
    if(params.restname){
        data2.name = params.restname;
        data4.title = params.restname;
        data4.company_name = params.restname;
    }
    if(params.desc){
        data2.description = params.desc;
        data4.introduction = params.desc;
    }
    if(params.contact){
        data4.contact = params.contact;
    }
    if(params.phone){
        data4.phone = params.phone;
    }
    if(params.email){
        data4.email = params.email;
    }
    if(params.roadphone){
        data2.roadphone = params.roadphone;
    }
    if(params.logo){
        data2.logo = params.logo;
    }
    if(params.allowdistance){
        data3.allowdistance = params.allowdistance;
    }
    if(params.isopen){
        data3.isopen = params.isopen;
    }
    if(params.note){
        data2.note = params.note;
    }

    var q1 = restConn2.query(sql1, data1, function(err){
        if(err){
            console.error(err);
            return res.send({code:-1, desc:err.message});
        }
        var q2 = restConn2.query(sql2, data2, function(err){
            if(err){
                console.error(err);
                return res.send({code:-1, desc:err.message});
            }
            var q3 = restConn2.query(sql3, data3, function(err){
                if(err){
                    console.error(err);
                    return res.send({code:-1, desc:err.message});
                }
                var q4 = restConn1.query(sql4, data4, function(err){
                    if(err){
                        console.error(err);
                        return res.send({code:-1, desc:err.message});
                    }
                    return res.send({code:0, desc:''});
                });
                console.log(q4.sql);
            });
            console.log(q3.sql);
        });
        console.log(q2.sql);
    });
    console.log(q1.sql);
};

var remove = function(req, res, next){

};

var getDetail = function(id, callback){
    var deferred = Q.defer();

    var sql_rest = 'SELECT * FROM pf_restaurant WHERE id = ' + id;
    var sql_restconf = 'SELECT * FROM pf_restconf WHERE restid = ' + id;
    var sql_address = 'SELECT * FROM pf_address WHERE restid = ' + id;
    var sql_company = 'SELECT email,phone,contact FROM pf_company WHERE id =' +id;

    restConn1.query(sql_company, function(err, comps){
        restConn2.query(sql_rest, function(err, rests){
            if(err)
                return deferred.reject(err);
            restConn2.query(sql_restconf, function(err, confs){
                if(err)
                    return deferred.reject(err);
                restConn2.query(sql_address, function(err, addrs) {
                    console.log(rests, confs, addrs);
                    if (err)
                        return deferred.reject(err);
                    var data = {};
                    for(var k in rests[0])
                        if(rests[0].hasOwnProperty(k))
                            data[k] = rests[0][k];
                    for(k in confs[0])
                        if(confs[0].hasOwnProperty(k))
                            data[k] = confs[0][k];
                    for(k in addrs[0])
                        if(addrs[0].hasOwnProperty(k))
                            data[k] = addrs[0][k];
                    for(k in comps[0])
                        if(comps[0].hasOwnProperty(k))
                            data[k] = comps[0][k];
                    deferred.resolve(data);
                });
            });
        });
    });
    return deferred.promise;
};

var detail = function(req, res, next){
    if(!req.params.restid)
        return res.send({code:-1, desc:'need restid'});

    getDetail(req.params.restid)
        .then(function(data){
            return res.send({code:0, desc:'success', data:data});
        })
        .fail(function(err){
            return res.send({code:-1, desc:err.message});
        });
};

var uploadImg = function(req, res, next){

};

var restState = function(req, res, next){
    if(!req.params.restid)
        return res.send({code:-1, desc:'need restid'});
    var sql = 'SELECT * FROM pf_restconf WHERE restid = ' + req.params.restid;
    var query = restConn2.query(sql, function(err, results){
        if(err){
            logger.error(err);
            return res.send({code:-1, desc:err.message});
        }
        if(results.length === 0){
            return res.send({code:-1, desc:req.params.restid + ' does not exist!'});
        }
        return res.send({code:0, desc:'success', data:results[0].isopen});
    });
    console.log(query.sql);
};

var restList = function(req, res, next) {
    if (!req.params.uid)
        return res.send({code: -1, desc: 'need uid'});

    var sql = 'SELECT restid FROM pf_restconf WHERE uid = ' + req.params.uid;
    var query = restConn2.query(sql, function(err, confs) {
        if (err) {
            logger.error(err);
            return res.send({code: -1, desc: err.message});
        }
        if (confs.length === 0)
            return res.send({code: 0, desc: 'success', data: []});

        var ids = [];
        for (var i = 0; i < confs.length; i++) {
            ids.push(confs[i].restid);
        }

        Q.all(ids.map(function (id) {
            return getDetail(id);
        }))
            .then(function (docs) {
                return res.send({code: 0, desc: '', data: docs});
            })
            .fail(function (err) {
                return res.send({code: -1, desc: err.message});
            });
    });
    console.log(query.sql);
};


var bindDetail_restid = function(restid, callback){
    if(!restid){
        return callback(new Error('need restid'));
    }

    var params = {
        cond:JSON.stringify({
            customerId : restid
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
        } else {
            callback(new Error('response '+ response.statusCode), null);
        }
    });

    request.end();
};

var binddetail = function(req, res, next) {
    console.log(req.params.restid);
    bindDetail_restid(req.params.restid, function(err, detail){
        if(err){
            console.error(err);
            return  res.send({code:-1, desc:err.message});
        }
        console.log(detail);
        res.send({code:0, desc:'', data:detail})
    });
};

exports.add = add;
exports.edit = edit;
exports.remove = remove;
exports.detail = detail;
exports.uploadImg = uploadImg;
exports.state = restState;
exports.restlist = restList;
exports.binddetail = binddetail;