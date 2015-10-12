/**
 * Created by liuhao on 8/21/15.
 */

var mysql = require('mysql');
var config = require('../config/apiconf');
var logger = require('../lib/logger').logger('apisys-dishcate');
var tools = require('../lib/tools');

var cateConn = mysql.createConnection({
    host     : config.dishDb.host,
    user     : config.dishDb.username,
    password : config.dishDb.passwd,
    database : config.dishDb.dbname
});

cateConn.connect();

var checkParams = function(params){
    if(!params)
        return {status:-1, message:'param is null'};
    if(!params.restid)
        return {status:-1, message:'restid is null'};
    if(!params.catename)
        return {status:-1, message:'catename is null'};
    return {status:0}
};

var add = function(req, res, next){
    var ret = checkParams(req.body);
    if(ret.status !== 0){
        return res.send({code: -1, desc:ret.message});
    }

    var params = req.body;

    var sql = 'INSERT INTO pf_menucate SET ?';
    var insertData = {
        restid : params.restid,
        catename : params.catename,
        status : params.status ? params.status : 1,
        note : params.note ? params.note : '',
        weight : params.weight ? params.weight : 10
    };

    var query = cateConn.query(sql, insertData, function(err, result){
        if(err){
            logger.error(err);
            return res.send({code:-1, desc:'add dish category failed'});
        }
        return res.send({code:-1, desc:'add success', data: result.insertId});
    });
    console.log(query.sql);
};

var edit = function(req, res, next){
    var sql = 'UPDATE pf_menucate SET ?';
    var updateData = {};
    if(req.body.catename)
        updateData.catename = req.body.catename;
    if(req.body.status)
        updateData.status = req.body.status;
    if(req.body.note)
        updateData.note = req.body.note;
    if(req.body.weight)
        updateData.weight = req.body.weight;

    if(tools.nullObj(updateData)){
        return res.send({code:-1, desc:'nothing to be edit!'});
    }

    var query = cateConn.query(sql, updateData, function(err, result){
        if(err){
            logger.error(err);
            return res.send({code:-1, desc:'edit dish category failed'});
        }
        return res.send({code:-1, desc:'edit success', data: result.insertId});
    });
    console.log(query.sql);
};

var remove = function(req, res, next){
    if(!req.params.cateid){
        return res.send({code:-1, desc:'cateid is null'});
    }

    var sql = 'UPDATE pf_menucate SET status = 0';
    var query = cateConn.query(sql, function(err){
        if(err){
            logger.error(err);
            return res.send({code:-1, desc:'remove dish category failed'});
        }
        return res.send({code:-1, desc:'remove success'});
    });
    console.log(query.sql);
};

var detail = function(req, res, next){
    if(!req.params.cateid){
        return res.send({code:-1, desc:'cateid is null'});
    }

    var sql = 'SELECT * FROM pf_menucate WHERE id = ?';
    var query = cateConn.query(sql, req.params.cateid, function(err, results){
        if(err)if(err){
            logger.error(err);
            return res.send({code:-1, desc:'get dish category failed'});
        }
        return res.send({code:0, desc:'get success', data: results[0]});
    });
    console.log(query.sql);
};

exports.add = add;
exports.edit = edit;
exports.remove = remove;
exports.detail = detail;
