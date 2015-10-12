/**
 * Created by liuhao on 8/18/15.
 */

var mysql = require('mysql');
var config = require('../config/apiconf');

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

var getLevel3Addr = function(addr, callback){
    var sql = 'SELECT id FROM pf_area WHERE id = '
        +  '(SELECT parent_id FROM pf_area WHERE parent_id= '+ addr.level1_id +' and  id= '
        + '(SELECT parent_id FROM pf_area WHERE parent_id= '+ addr.level2_id +' and  id= '+ addr.level3_id +'))';

    var query = restConn1.query(sql, function(err, results){
        if(err){
            console.error(err);
            return callback(err);
        }
        if(results.length === 0){
            return callback(new Error(addr.level3_id + ' does not exist!'));
        }

        callback(null, results[0]);
    });

    console.log(query.sql);
};

var add = function(addr, callback){
    var sql = 'INSERT INTO pf_area SET ?';
    var insertData = {

    };
};

var addr = {
    level1_id : 1,
    level2_id : 35,
    level3_id : 36
};

getLevel3Addr(addr, function(err, results){
    if(err) console.error(err);
    console.log(results);
});

