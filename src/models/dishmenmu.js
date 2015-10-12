/**
 * Created by 勇 on 2015/8/28.
 */

var Post = require('../lib/tools').Post;
var appConf = require('../config/apiconf');
var msg = require('../locale/msg_' + appConf.locale);

/**
 * @description 通过菜品模板ID获取相关信息
 * @param {object}  req
 * @param {object}  res
 * @param {function} next
 * @constructor
 */
var GetByID = function (req, res, next) {
    var id = req.params.id;
    console.log("dishmenmu id:",id);
    if (!id || id == '') {
        res.send(resJson(msg.errParams));
    }
    else {
        Post({}, appConf.apiURLs.getDishMenmuById).then(function (v) {
            console.log(v);
            res.send(v);
        }).fail(function (e) {
            console.log(e);
            res.send(e);
        });
    }


}

var GetByName=function(req,res,next){
    var name =  req.params.name;
    console.log("dishmenmu name:",name);
    if (!id || id == '') {
        res.send(resJson(msg.errParams));
    }
    else {
        Post({}, appConf.apiURLs.getDishMenmuById).then(function (v) {
            res.send(v);
        }).fail(function (e) {
            res.send(v);
        });
    }
}

module.exports = {
    GetByID: GetByID,
    GetByName:GetByName
}