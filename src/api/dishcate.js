/**
 * Created by liuhao on 8/21/15.
 */

var dishcate = require('../models/dishcates');

var express = require('express');
var dishCateRouter = express.Router();

//菜品类型
dishCateRouter.post('/add', dishcate.add);
dishCateRouter.post('/edit', dishcate.edit);
dishCateRouter.post('/remove/:cateid', dishcate.remove);
dishCateRouter.get('/detail/:cateid', dishcate.detail);

module.exports = dishCateRouter;