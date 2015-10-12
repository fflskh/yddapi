/**
 * Created by liuhao on 8/21/15.
 */

var mysql = require('mysql');
var config = require('../config/apiconf');
var logger = require('../lib/logger').logger('apisys-dish');
var tools = require('../lib/tools');

var dishConn = mysql.createConnection({
    host     : config.dishDb.host,
    user     : config.dishDb.username,
    password : config.dishDb.passwd,
    database : config.dishDb.dbname
});

dishConn.connect();

var checkParams = function(params){
    if(!params)
        return {status:-1, message:'param is null'};
    if(!params.restid)
        return {status:-1, message:'restid is null'};
    if(!params.cateid)
        return {status:-1, message:'cateid is null'};
    if(!params.name)
        return {status:-1, message:'name is null'};
    if(!params.price)
        return {status:-1, message:'price is null'};
    if(!params.weight)
        return {status:-1, message:'weight is null'};
    return {status:0}
};

var add = function(req, res, next){
    var ret = checkParams(req.body);
    if(ret.status !== 0){
        return res.send({code: -1, desc:ret.message});
    }

    var params = req.body;

    var sql = 'INSERT INTO pf_dishmenu SET ?';
    var insertData = {
        restid : params.restid,
        cate_id : params.cateid,
        name : params.name,
        price : params.price,
        weight : params.weight,
        pic : params.pic ? params.pic : params.pic,
        dateline : params.dateline ? params.dateline : Math.round(new Date().getTime()/1000),
        status : params.status ? params.status : 1,
        note : params.note ? params.note : '',
        otype : params.otype ? params.otype : 11
    };

    var query = dishConn.query(sql, insertData, function(err, result){
        if(err){
            logger.error(err);
            return res.send({code:-1, desc:'add dish failed'});
        }
        return res.send({code:-1, desc:'add success', data: result.insertId});
    });
    console.log(query.sql);
};

var edit = function(req, res, next){
    var sql = 'UPDATE pf_dishmenu SET ?';
    var updateData = {};
    if(req.body.cateid)
        updateData.cateid = req.body.cateid;
    if(req.body.name)
        updateData.name = req.body.name;
    if(req.body.price)
        updateData.price = req.body.price;
    if(req.body.status)
        updateData.status = req.body.status;
    if(req.body.pic)
        updateData.pic = req.body.pic;
    if(req.body.note)
        updateData.note = req.body.note;
    if(req.body.dateline)
        updateData.dateline = req.body.dateline;
    if(req.body.weight)
        updateData.weight = req.body.weight;
    if(req.body.otype)
        updateData.otype = req.body.otype;


    if(tools.nullObj(updateData)){
        return res.send({code:-1, desc:'nothing to be edit!'});
    }

    var query = dishConn.query(sql, updateData, function(err, result){
        if(err){
            logger.error(err);
            return res.send({code:-1, desc:'edit dish category failed'});
        }
        return res.send({code:-1, desc:'edit success', data: result.insertId});
    });
    console.log(query.sql);
};

var remove = function(req, res, next){
    if(!req.params.dishid){
        return res.send({code:-1, desc:'dishid is null'});
    }

    var sql = 'UPDATE pf_dishmenu SET status = 0';
    var query = dishConn.query(sql, function(err){
        if(err){
            logger.error(err);
            return res.send({code:-1, desc:'remove dish failed'});
        }
        return res.send({code:-1, desc:'remove success'});
    });
    console.log(query.sql);
};

var detail = function(req, res, next){
    if(!req.params.dishid){
        return res.send({code:-1, desc:'dishid is null'});
    }

    var sql = 'SELECT * FROM pf_dishmenu WHERE id = ?';
    var query = cateConn.query(sql, req.params.dishid, function(err, results){
        if(err)if(err){
            logger.error(err);
            return res.send({code:-1, desc:'get dish failed'});
        }
        return res.send({code:0, desc:'get success', data: results[0]});
    });
    console.log(query.sql);
};

var addPubDish = function(params, callback){
    if(!params)
        return callback({status:-1, message:'params is null'});
    if(!params.dishid)
        return callback({status:-1, message:'dishid is null'});
    if(!params.restid)
        return callback({status:-1, message:'restid is null'});
    if(!params.name)
        return callback({status:-1, message:'name is null'});
    if(!params.price)
        return callback({status:-1, message:'price is null'});

    var sql = 'INSERT INTO pf_pubdish SET ?';
    var insertData = {
        dishid : params.dishid,
        restid : params.restid,
        name : params.name,
        price : params.price,
        dateline : params.dateline ? params.dateline : Math.round(new Date().getTime()/1000),
        weight : params.weight ? params.weight : 50
    };

    var query = dishConn.query(sql, insertData, function(err, result){
        if(err){
            logger.error(err);
            callback(new Error('add publish dish failed'));
        }
        callback(null, result.insertId);
    });
    console.log(query.sql);
};

var publish = function(req, res, next){
    if(!req.params.dishid){
        return res.send({code:-1, desc:'dishid is null'});
    }

    var sql = 'UPDATE pf_dishmenu SET status = 2,weight=50 WHERE id = ?';
    var query = dishConn.query(sql, req.params.dishid, function(err){
        if(err){
            logger.error(err);
            return res.send({code:-1, desc:'publish dish failed'});
        }
        dishConn.query('SELECT * FROM pf_dishmenu WHERE dishid = ?', req.params.dishid, function(err, results){
            if(err){
                logger.error(err);
                return res.send({code:-1, desc:'publish dish failed'});
            }

            var pubDish = {
                dishid : results[0].id,
                restid : results[0].restid,
                name : results[0].name,
                price : results[0].price,
                dateline : results[0].dateline,
                weight : results[0].weight ? results[0].weight : 50
            };
            addPubDish(pubDish, function(err, pubid){
                if(err){
                    logger.error(err);
                    return res.send({code:-1, desc:'publish dish failed'});
                }
                return res.send({code:0, desc:'publish success', data: pubid});
            });
        });
    });
    console.log(query.sql);
};

exports.add = add;
exports.edit = edit;
exports.remove = remove;
exports.detail = detail;
exports.publish = publish;